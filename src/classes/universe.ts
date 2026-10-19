/* eslint-disable no-console */
import { KawaseBlurFilter } from 'pixi-filters';
import { Application, Container, Texture } from 'pixi.js-legacy';
import * as PIXI from 'pixi.js-legacy';

import { Item } from './item';
import { Ring } from './ring';
import { Slider } from './slider';

import { MAX_SCALE_EXP, MIN_SCALE_EXP } from '@/config';
import { E } from '@/helpers/e';
import { fitItemToViewport } from '@/helpers/fitItemToViewport';
import { getScaleText } from '@/helpers/getScaleText';
import { map } from '@/helpers/map';
import {
  ExtraText,
  ItemModalData,
  SizeData,
  TextDatum,
  TItemsManifest,
  VisualLocation,
} from '@/interfaces';
import { translationService } from '@/services/translation.service';

type TObjectTranslation = {
  title: string;
  description: string;
};

type TUniverseUnits = {
  meterShort: string;
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
  private focusRunId = 0;
  private modalFocus = false;
  private modalOpen = false;
  private getScaleTextBounds?: () => PIXI.Rectangle;

  private onItemModalOpen?: (data: ItemModalData) => void;
  private onItemModalClose?: () => void;

  constructor(
    startingZoom: number,
    slider: Slider,
    app: Application,
    onItemModalOpen?: (data: ItemModalData) => void,
    onItemModalClose?: () => void,
    getScaleTextBounds?: () => PIXI.Rectangle,
  ) {
    this.currentZoomExp = startingZoom;
    this.prevZoom = startingZoom;
    this.container = new Container();
    this.displayContainer = new Container();

    this.onItemModalOpen = onItemModalOpen;
    this.onItemModalClose = onItemModalClose;
    this.getScaleTextBounds = getScaleTextBounds;

    this.displayContainer.eventMode = 'none';
    this.displayContainer.interactiveChildren = true;

    setTimeout(() => {
      for (const entity of [...this.items, ...this.rings]) {
        entity.cachePeriod = false;
      }
    }, 1000);

    this.slider = slider;
    this.app = app;

    this.container.sortableChildren = true;

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', (e) => {
      if (!this.selectedItem) {
        return;
      }

      const selectedContainer = this.selectedItem.getContainer();
      const clickedInsideSelected = this.isDescendantOf(e.target, selectedContainer);

      if (!clickedInsideSelected) {
        this.unHideItems();
      }
    });

    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.displayContainer.x = this.app.screen.width / 2;
    this.displayContainer.y = this.app.screen.height / 2;
  }

  update(scaleExp: number) {
    for (const ring of this.rings) {
      ring.setZoom(scaleExp);
    }

    for (const item of this.items) {
      item.setZoom(scaleExp);
    }

    if (this.selectedItem && !this.modalFocus) {
      this.selectedItem.getContainer().renderable = true;
      this.selectedItem.text.visible = true;
      this.selectedItem.text.alpha = 1;
    }
    this.prevZoom = scaleExp;
  }

  onHandleClicked() {
    this.unHideItems();
  }

  unHideItems() {
    this.focusRunId += 1;
    this.slider.cancelAnimation();
    this.modalFocus = false;
    this.modalOpen = false;
    this.setSceneScale(1);
    this.setScenePosition(this.app.screen.width / 2, this.app.screen.height / 2);
    for (const item of this.items) {
      item.hideDescription();
      item.text.renderable = true;
      item.setInteractiveEnabled(true);
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
    this.onItemModalClose?.();
  }

  hideAllItemsBut(
    item: Item,
    options: { showDescription?: boolean; blurBackground?: boolean } = {},
  ) {
    const { showDescription = true, blurBackground = true } = options;
    this.container.filters = blurBackground ? [new KawaseBlurFilter(1, 3, true)] : null;

    if (this.selectedItem !== item) {
      if (this.selectedItem) {
        this.displayContainer.removeChild(this.selectedItem.getContainer());

        while (this.displayContainer.children[0]) {
          this.displayContainer.removeChildAt(0);
        }

        this.container.addChild(this.selectedItem.getContainer());
      }

      if (showDescription) {
        item.showDescription();
      } else {
        item.hideDescription();
      }

      this.displayContainer.addChild(item.getContainer());

      this.selectedItem = item;

      item.setInteractiveEnabled(false);

      this.displayContainer.visible = true;

      for (const otherItem of this.items.filter((x) => x !== item)) {
        otherItem.hideDescription();
        otherItem.text.renderable = true;
        otherItem.setInteractiveEnabled(true);
      }
    } else {
      if (showDescription) {
        item.showDescription();
      }
    }
  }

  itemClicked(item: Item) {
    void this.focusItem(item);
  }

  public async focusItemById(textureId: string) {
    const item = this.items.find((entry) => entry.textureId === textureId);
    return item ? this.focusItem(item) : false;
  }

  private setScenePosition(x: number, y: number) {
    this.container.position.set(x, y);
    this.displayContainer.position.set(x, y);
  }

  private setSceneScale(scale: number) {
    this.container.scale.set(scale);
    this.displayContainer.scale.set(scale);
  }

  private getFocusViewport() {
    const canvas = this.app.view as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = this.app.screen.width / rect.width;
    const scaleY = this.app.screen.height / rect.height;
    const controls = document.getElementById('buttons')?.getBoundingClientRect();
    const top = Math.max(
      24 * scaleY,
      controls?.height ? (controls.bottom - rect.top + 16) * scaleY : 0,
    );
    const scaleText = this.getScaleTextBounds?.();
    const bottom = Math.min(
      this.app.screen.height - 24 * scaleY,
      this.slider.topY - 16 * scaleY,
      scaleText ? scaleText.y - 16 * scaleY : this.slider.topY - 56 * scaleY,
    );
    return {
      viewport: {
        x: 24 * scaleX,
        y: top,
        width: this.app.screen.width - 48 * scaleX,
        height: bottom - top,
      },
      cssPixelsPerUnit: rect.height / this.app.screen.height,
    };
  }

  private async focusItem(item: Item, animate = true) {
    const runId = ++this.focusRunId;
    this.slider.cancelAnimation();
    const absoluteZoom = item.scaleExp + Math.log10(item.coeff * item.realRatio);
    const zoomOffset = item.visualLocation.zoomOffset || 0;
    const preferredPercent = Math.max(
      0,
      Math.min(
        1,
        map(absoluteZoom + zoomOffset, MIN_SCALE_EXP, MAX_SCALE_EXP, 0, 1) +
          (window.innerHeight < 750 ? 0.0065 : 0.004),
      ),
    );
    const preferredZoom = map(preferredPercent, 0, 1, MIN_SCALE_EXP, MAX_SCALE_EXP);
    const origin = { x: this.app.screen.width / 2, y: this.app.screen.height / 2 };
    let targetPercent = preferredPercent;
    let targetSceneScale = 1;
    let target = origin;
    let useModal = this.shouldUseModalDescription();

    // The outer Universe texture is a backdrop: opening it should not fit the whole image.
    const preserveScene = item.textureId === '162' && !useModal;
    if (preserveScene) {
      targetPercent = this.slider.getPercent();
      targetSceneScale = this.container.scale.x;
      target = { x: this.container.x, y: this.container.y };
    } else if (!useModal) {
      const fit = fitItemToViewport({
        bounds: item.getFocusBounds(),
        ...this.getFocusViewport(),
        origin,
        preferredScale: E(absoluteZoom - preferredZoom),
        descriptionFontSize: item.getDescriptionFontSize(),
      });
      const fittedZoom = absoluteZoom - Math.log10(fit.scale);
      useModal = fit.useModal;
      if (!useModal) {
        const sliderZoom = Math.max(MIN_SCALE_EXP, Math.min(MAX_SCALE_EXP, fittedZoom));
        targetPercent = map(sliderZoom, MIN_SCALE_EXP, MAX_SCALE_EXP, 0, 1);
        // Keep the slider in range; apply remaining zoom to both scene layers.
        targetSceneScale = E(sliderZoom - fittedZoom);
        target = { x: fit.x, y: fit.y };
      }
    }

    this.modalFocus = useModal;
    this.hideAllItemsBut(item, { showDescription: !useModal, blurBackground: !useModal });
    if (useModal) item.hideDescription();
    const start = { x: this.container.x, y: this.container.y };
    const startSceneScale = this.container.scale.x;
    const complete = () => {
      if (runId !== this.focusRunId || this.selectedItem !== item) return;
      this.setScenePosition(target.x, target.y);
      this.setSceneScale(targetSceneScale);
      if (preserveScene) {
        const { viewport, cssPixelsPerUnit } = this.getFocusViewport();
        useModal = !item.fitDescriptionToViewport(viewport, cssPixelsPerUnit);
        if (useModal) {
          this.modalFocus = true;
          item.hideDescription();
          this.container.filters = null;
        }
      }
      if (useModal) {
        this.modalOpen = true;
        this.onItemModalOpen?.(item.getModalData());
      }
    };
    if (animate && !preserveScene) {
      await this.slider.setAnimationTargetPercent(targetPercent, complete, (progress) => {
        if (runId !== this.focusRunId) return;
        this.setSceneScale(startSceneScale + (targetSceneScale - startSceneScale) * progress);
        this.setScenePosition(
          start.x + (target.x - start.x) * progress,
          start.y + (target.y - start.y) * progress,
        );
      });
    } else {
      this.slider.setPercent(targetPercent);
      complete();
    }
    return runId === this.focusRunId && this.selectedItem === item;
  }

  private getRingPrefix(scalePrefixes: string[], idx: number): string {
    return scalePrefixes[idx] ?? '';
  }

  private buildRingText(idx: number, sizeData: SizeData, units: TUniverseUnits): TextDatum {
    const textDatum: TextDatum = {
      title: '',
      description: '',
      metersPlural: units.meters,
      meterSingular: units.meter,
    };

    if (idx < 17) {
      const prefix = this.getRingPrefix(units.scalePrefixes, idx);
      const prefixPart = prefix ? `${prefix}` : '';

      textDatum.title = `1 ${prefixPart}${units.meter}`;
      textDatum.description = `${getScaleText(sizeData.exponent)} ${units.meterShort}`;

      return textDatum;
    }

    let val: string;
    let unitPrefix = units.scalePrefixes[0] || '';

    if (idx <= 26) {
      val = E(idx - 27)
        .toFixed(15)
        .replace(/\.?0+$/, '');
    } else {
      val = E(idx - 26)
        .toFixed(15)
        .replace(/\.?0+$/, '');
    }

    if (val === '100') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async createItems(
    textures: Record<string, Texture>,
    manifest: TItemsManifest,
    textureSourceMap: Record<string, string>,
  ) {
    const frames = manifest.frames ?? {};

    const localeData = translationService.getUniverseLocaleData();
    const objectTranslations: Record<string, TObjectTranslation> = localeData.objects;
    const units: TUniverseUnits = localeData.units;

    const extraText: ExtraText = {
      centimeter: units.centimeter,
      centimeters: units.centimeters,
      lightyear: units.lightyear,
      lightyears: units.lightyears,
      meter: units.meter,
      meters: units.meters,
      meterShort: units.meterShort,
    };

    const onClick = (item: Item) => {
      this.itemClicked(item);
    };

    const frameKeys = Object.keys(frames).sort((a, b) => Number(a) - Number(b));
    this.itemCount = frameKeys.length;

    for (let idx = 0; idx < frameKeys.length; idx++) {
      const textureId = frameKeys[idx];
      const frameEntry = frames[textureId];
      const texture = textures[textureId];

      if (!texture) {
        console.warn(`Texture not found for key=${textureId}`);
        continue;
      }

      if (!frameEntry?.size) {
        console.warn(`Size data not found for key=${textureId}`);
        continue;
      }

      if (!frameEntry?.visualLocation) {
        console.warn(`Visual location not found for key=${textureId}`);
        continue;
      }

      const sizeData: SizeData = frameEntry.size;
      const visualLocation: VisualLocation = frameEntry.visualLocation;
      const spriteLayout = frameEntry.layout;

      if (!frameEntry?.layout) {
        console.warn(`Layout not found for key=${textureId}`);
        continue;
      }

      const numericId = Number(textureId);

      if (numericId >= 30) {
        const objectTranslation = objectTranslations[textureId];

        if (!objectTranslation) {
          console.warn(`Translation not found for item index=${idx}, textureId=${textureId}`);
          continue;
        }

        const textDatum: TextDatum = {
          title: objectTranslation.title,
          description: objectTranslation.description,
          metersPlural: units.meters,
          meterSingular: units.meter,
        };

        texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.ON;
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;

        const item = new Item(
          textureId,
          sizeData,
          texture,
          spriteLayout,
          visualLocation,
          textDatum,
          extraText,
          units.scalePrefixes,
          onClick,
          textureSourceMap[textureId],
        );

        this.items.push(item);
        item.getContainer().zIndex = idx;
        this.container.addChild(item.getContainer());
      } else {
        const textDatum = this.buildRingText(idx, sizeData, units);

        const ring = new Ring(
          idx,
          textureId,
          sizeData,
          texture,
          spriteLayout,
          visualLocation,
          textDatum,
          units.meters,
        );

        this.rings.push(ring);
        ring.getContainer().zIndex = idx;
        this.container.addChild(ring.getContainer());
      }
    }
  }

  public resize() {
    this.app.stage.hitArea = this.app.screen;
    if (this.selectedItem && !this.modalFocus) {
      void this.focusItem(this.selectedItem, false);
    } else {
      this.setScenePosition(this.app.screen.width / 2, this.app.screen.height / 2);
      if (this.selectedItem && this.modalFocus && !this.modalOpen) {
        this.modalOpen = true;
        this.onItemModalOpen?.(this.selectedItem.getModalData());
      }
    }
  }

  private isDescendantOf(target, parent): boolean {
    let current = target;

    while (current) {
      if (current === parent) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  private shouldUseModalDescription() {
    return window.matchMedia('(max-width: 1024px), (pointer: coarse)').matches;
  }
}
