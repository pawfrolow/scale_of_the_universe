import { Application, Container, Texture } from 'pixi.js-legacy';
import * as PIXI from 'pixi.js-legacy'
import { KawaseBlurFilter } from 'pixi-filters';

import { Item } from './item';
import { Ring } from './ring';
import { Slider } from './slider';

import { E } from '../helpers/e';
import { pad } from '../helpers/pad';
import { map } from '../helpers/map';
import { getScaleText } from '../helpers/getScaleText';

import { translationService } from '../services/translation.service';

type TObjectTranslation = {
  title: string;
  description: string;
};

type TUniverseUnits = {
  meter: string;
  meters: string;
  centimeter: string;
  centimeters: string;
  lightyear: string;
  lightyears: string;
  scalePrefixes: string[];
};

export class Universe {
  private slider: Slider;
  public app: Application;
  public container: Container;
  public displayContainer: Container;
  public selectedItem?: Item;
  private screenCap?: string;

  public prevZoom: number;

  public items: Array<Item> = [];
  private rings: Array<Ring> = [];

  private itemCount = 0;
  private currentZoomExp = 0;

  constructor(
    startingZoom: number,
    slider: Slider,
    app: Application
  ) {
    this.currentZoomExp = startingZoom;
    this.prevZoom = startingZoom;
    this.container = new Container();
    this.displayContainer = new Container();

    setTimeout(() => {
      for (const entity of [...this.items, ...this.rings]) {
        entity.cachePeriod = false;
      }
    }, 1000);

    this.slider = slider;
    this.app = app;

    this.container.sortableChildren = false;

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', (e: any) => {
      if (!this.selectedItem) {
        return;
      }

      const selectedContainer = this.selectedItem.getContainer();
      const clickedInsideSelected = this.isDescendantOf(e.target, selectedContainer);

      if (!clickedInsideSelected) {
        this.unHideItems();
      }
    });

    document.addEventListener(
      'mousewheel',
      () => {
        this.unHideItems();
      },
      false
    );

    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.displayContainer.x = this.app.screen.width / 2;
    this.displayContainer.y = this.app.screen.height / 2;
  }

  update(scaleExp: number) {
    const delta = this.prevZoom - scaleExp;

    for (const ring of this.rings) {
      ring.setZoom(scaleExp, delta);
    }

    for (const item of this.items) {
      item.setZoom(scaleExp, delta);
    }

    this.prevZoom = scaleExp;
  }

  onHandleClicked() {
    this.unHideItems();
  }

  unHideItems() {
    for (const item of this.items) {
      item.hideDescription();
      item.text.renderable = true;
    }

    this.container.filters = null;

    if (this.selectedItem) {
      this.selectedItem.text.renderable = true;

      if (this.displayContainer.children.length > 0) {
        this.displayContainer.removeChildAt(0);
      }

      this.container.addChild(this.selectedItem.getContainer());
      this.selectedItem = undefined;
    }

    while (this.displayContainer.children[0]) {
      this.displayContainer.removeChildAt(0);
    }

    this.displayContainer.visible = false;
  }

  hideAllItemsBut(item: Item) {
    if (this.selectedItem !== item) {
      if (this.selectedItem) {
        this.displayContainer.removeChild(this.selectedItem.getContainer());

        while (this.displayContainer.children[0]) {
          this.displayContainer.removeChildAt(0);
        }

        this.container.addChild(this.selectedItem.getContainer());
      }

      item.showDescription();

      this.displayContainer.addChild(item.getContainer());

      this.selectedItem = item;

      const filter = new KawaseBlurFilter(1, 3, true);
      this.container.filters = [filter];

      this.displayContainer.visible = true;

      for (const otherItem of this.items.filter((x) => x !== item)) {
        otherItem.hideDescription();
        otherItem.text.renderable = true;
      }
    } else {
      this.unHideItems();
    }
  }

  itemClicked(item: Item) {
    const zoomOffset = item.visualLocation.zoomOffset || 0;
    const absoluteZoom = item.scaleExp + Math.log10(item.coeff * item.realRatio);

    const percent = map(absoluteZoom + zoomOffset, -35, 27, 0, 1);

    this.hideAllItemsBut(item);

    const percentFinal = window.innerHeight < 750
      ? percent + 0.0065
      : percent + 0.004;

    this.slider.setAnimationTargetPercent(percentFinal);
  }

  private getRingPrefix(scalePrefixes: string[], idx: number): string {
    return scalePrefixes[idx] ?? '';
  }

  private buildRingText(
    idx: number,
    sizeData: any,
    units: TUniverseUnits
  ) {
    const textDatum = {
      title: '',
      description: '',
      metersPlural: units.meters,
      meterSingular: units.meter,
    };

    if (idx < 17) {
      const prefix = this.getRingPrefix(units.scalePrefixes, idx);
      const prefixPart = prefix ? `${prefix}` : '';

      textDatum.title = `1 ${prefixPart}${units.meter}`;
      textDatum.description = `${getScaleText(sizeData.exponent)} м`;

      return textDatum;
    }

    let val: string;
    let unitPrefix = units.scalePrefixes[0] || '';

    if (idx <= 26) {
      val = E(idx - 27).toFixed(15).replace(/\.?0+$/, '');
    } else {
      val = E(idx - 26).toFixed(15).replace(/\.?0+$/, '');
    }

    if (val === '100') {
      unitPrefix = units.scalePrefixes[3] || '';
    }

    textDatum.title = '';

    let yoctoVal = getScaleText(sizeData.exponent + 24);

    if (yoctoVal === '1') {
      yoctoVal = '10';
    }

    textDatum.description = `${yoctoVal} ${units.scalePrefixes[0]}${units.meters}`;

    if (idx === 28) {
      let femtoVal = getScaleText(sizeData.exponent + 15);

      if (femtoVal === '1') {
        femtoVal = '100';
      }

      textDatum.description = `${femtoVal} ${units.scalePrefixes[3]}${units.meters}`;
    }

    return textDatum;
  }

  async createItems(textures: Record<string, Texture>) {
    const itemSizes = await (await fetch('data/sizes.json')).json();
    const visualLocations = await (await fetch('data/visualLocations.json')).json();

    const localeData = translationService.getUniverseLocaleData();
    const objectTranslations: Record<string, TObjectTranslation> = localeData.objects;
    const units: TUniverseUnits = localeData.units;

    const extraText = {
      centimeter: units.centimeter,
      centimeters: units.centimeters,
      lightyear: units.lightyear,
      lightyears: units.lightyears,
      meter: units.meter,
      meters: units.meters,
    };

    const onClick = (item: Item) => {
      this.itemClicked(item);
    };

    this.itemCount = itemSizes.length;

    for (let idx = 0; idx < itemSizes.length; idx++) {
      const sizeData = itemSizes[idx];
      const visualLocation = visualLocations[idx];

      const textureId = pad(idx + 1, 3)
      const texture = textures[textureId]

      if (!texture) {
        console.warn(`Texture not found for item index=${idx}, key=${textureId}`);
        continue;
      }

      if (idx >= 29) {
        const objectTranslation = objectTranslations[textureId];

        if (!objectTranslation) {
          console.warn(
            `Translation not found for item index=${idx}, objectIndex=${idx - 29}, objectID=${sizeData.objectID}`
          );
          continue;
        }

        const textDatum = {
          title: objectTranslation.title,
          description: objectTranslation.description,
          metersPlural: units.meters,
          meterSingular: units.meter,
        };

        texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.ON;
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;

        const item = new Item(
          sizeData,
          texture,
          visualLocation,
          textDatum,
          extraText,
          units.scalePrefixes,
          onClick
        );

        this.items.push(item);
        this.container.addChild(item.getContainer());
      } else {
        const textDatum = this.buildRingText(idx, sizeData, units);

        const ring = new Ring(
          idx,
          sizeData,
          texture,
          visualLocation,
          textDatum,
          units.meters
        );

        this.rings.push(ring);
        this.container.addChild(ring.getContainer());
      }
    }
  }

  public resize() {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.displayContainer.x = this.app.screen.width / 2;
    this.displayContainer.y = this.app.screen.height / 2;
  }

  private isDescendantOf(target: any, parent: any): boolean {
    let current = target;

    while (current) {
      if (current === parent) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }
}