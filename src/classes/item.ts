import { Sprite, Text, Container, Texture, Point, DisplayObject, Rectangle } from 'pixi.js-legacy';

import { Entity } from './entity';

import { calculateScale } from '@/helpers/calculateScale';
import { getGraphics } from '@/helpers/description';
import { E } from '@/helpers/e';
import { powToUnit } from '@/helpers/powToUnit';
import { ymClick } from '@/helpers/ymClick';
import { TextDatum, VisualLocation, SizeData, ExtraText, SpriteLayout } from '@/interfaces';
import { ItemModalData } from '@/interfaces';

type THoleShape = {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
};

type TSpecialHitAreaConfig = {
  holes: THoleShape[];
};

const SPECIAL_HIT_AREAS: Partial<Record<string, TSpecialHitAreaConfig>> = {
  '162': {
    holes: [
      {
        type: 'circle',
        x: 0,
        y: 0,
        radius: 190,
      },
    ],
  },
  '163': {
    holes: [
      {
        type: 'circle',
        x: 0,
        y: 0,
        radius: 150,
      },
    ],
  },
};

export class Item extends Entity {
  public descriptionGraphics: Container;

  public coeff: number = 1;
  public sizeData: SizeData;
  public realRatio: number = 1;
  public currentScale: number = 1;
  public visualLocation: VisualLocation;
  declare public video: Sprite;
  public videoSrc;
  private textDatum: TextDatum;
  public text: Text;
  private onClick: (e?) => void;
  private description?: Container;
  private units: Array<string>;
  private extraText: ExtraText;

  private imageSrc: string;
  private subtitle: string;

  constructor(
    textureId: string,
    sizeData: SizeData,
    textureLow: Texture,
    spriteLayout: SpriteLayout,
    visualLocation: VisualLocation,
    textDatum: TextDatum,
    extraText: ExtraText,
    units: Array<string>,
    onClick: (e?) => void,
    imageSrc: string,
  ) {
    super(sizeData.exponent, textureId, textureLow, spriteLayout);

    this.extraText = extraText;
    this.coeff = sizeData.coeff;
    this.realRatio = sizeData.realRatio;
    this.visualLocation = visualLocation;
    this.textDatum = textDatum;
    this.sizeData = sizeData;
    this.units = units;
    this.imageSrc = imageSrc;
    this.subtitle = powToUnit(textureId, sizeData, units, extraText);

    this.onClick = onClick;

    const scale = calculateScale(this.scaleExp, this.coeff, this.realRatio);
    this.container.scale = new Point(scale, scale);

    this.createClickableRegion();
    this.createText();
    this.container.sortableChildren = true;
    this.cull(scale);
  }

  showDescription() {
    if (this.description) {
      return;
    }

    const descriptionGfx = getGraphics(
      this.textureId,
      this.visualLocation,
      this.textDatum,
      this.extraText,
      this.units,
      this.sizeData,
    );

    const s = this.visualLocation.descriptionScale;
    if (s) {
      descriptionGfx.scale = new Point(s, s);
    }

    descriptionGfx.zIndex = 1;
    this.text.zIndex = 2;
    this.spriteLow.zIndex = 0;
    if (this.sprite) {
      this.sprite.zIndex = 1;
    }

    this.container.addChild(descriptionGfx);

    this.description = descriptionGfx;

    this.container.sortChildren();
  }

  hideDescription() {
    if (this.description) {
      this.container.removeChild(this.description);
      this.description.destroy?.({ children: true });
      this.description = undefined;
    }
  }

  setZoom(globalZoomExp: number) {
    const scaleExp = this.scaleExp - globalZoomExp;

    if (!this.culled) {
      const scale = calculateScale(scaleExp, this.coeff, this.realRatio); // Math.round(rawScale * 500) / 500;

      if (scale > 0.05 && scale < 0.1) {
        this.text.alpha = 0.5;
      } else if (scale > 0.1) {
        this.text.alpha = 1;
      } else if (this.text.alpha !== 0) {
        this.text.alpha = 0;
      }

      if (this.cachePeriod) {
        this.text.alpha = 1;
      }

      this.text.visible = this.text.alpha !== 0;

      this.cull(scale);
      this.container.scale = new Point(scale, scale);
      this.currentScale = scale;
    } else {
      const scaleExp = this.scaleExp - globalZoomExp;
      if (scaleExp > 2 || scaleExp < -4) {
        this.cull(E(-8));
      } else {
        const scale = calculateScale(scaleExp, this.coeff, this.realRatio); // Math.round(rawScale * 500) / 500;
        this.cull(scale);
      }
    }
  }

  getScale() {
    return this.currentScale;
  }

  createText() {
    const textStyle = {
      fontFamily: 'Roboto',
      fontSize: 48 * this.visualLocation.titleScale,
      fill: 0x000000,
      align: 'center' as const,
      wordWrap: this.visualLocation.titleWrap,
      wordWrapWidth: 400,
    };

    const scale = calculateScale(this.scaleExp, this.coeff, this.realRatio);

    if (scale > E(5)) {
      textStyle.fill = 0xdddddd;
    }

    this.text = new Text(this.textDatum.title, textStyle);
    this.text.anchor.set(0.5, 0);
    this.text.zIndex = 2;

    this.text.position.x = this.visualLocation.titleX;
    this.text.position.y = this.visualLocation.titleY;

    this.text.cacheAsBitmap = false;
    this.container.addChild(this.text);
    this.setInteractiveEvents(this.text);
  }

  createClickableRegion() {
    this.setSpriteEvents(this.spriteLow);
  }

  public setHighSpriteEvents() {
    this.setSpriteEvents(this.sprite);
  }

  setSpriteEvents(sprite: Sprite) {
    const { width, height } = this.spriteLayout;

    const left = -width / 2;
    const top = -height / 2;

    const specialHitArea = this.getSpecialHitAreaConfig();

    if (specialHitArea) {
      sprite.hitArea = {
        contains: (px: number, py: number) => {
          const insideRect = px >= left && px <= left + width && py >= top && py <= top + height;

          if (!insideRect) {
            return false;
          }

          const insideAnyHole = specialHitArea.holes.some((hole) =>
            this.isPointInsideHole(px, py, hole),
          );

          return !insideAnyHole;
        },
      };
    } else {
      sprite.hitArea = new Rectangle(left, top, width, height);
    }

    this.setInteractiveEvents(sprite);
  }

  setInteractiveEvents(target: DisplayObject) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const here = this;

    function onPointerTap(event) {
      event?.stopPropagation?.();

      ymClick('clickObject', { id: here.textureId });

      here.onClick(here);
    }

    // для pixi legacy / mixed API
    target.eventMode = 'static';
    target.interactive = true;
    target.cursor = 'pointer';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    target.buttonMode = true;

    target.on('pointertap', onPointerTap);
  }

  getModalData(): ItemModalData {
    return {
      imageSrc: this.imageSrc,
      title: this.textDatum.title,
      subtitle: this.subtitle,
      description: this.textDatum.description,
    };
  }

  setInteractiveEnabled(enabled: boolean) {
    const apply = (target?: DisplayObject) => {
      if (!target) {
        return;
      }

      target.eventMode = enabled ? 'static' : 'none';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      target.interactive = enabled;
      target.cursor = enabled ? 'pointer' : 'default';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      target.buttonMode = enabled;
    };

    apply(this.spriteLow);
    apply(this.sprite);
    apply(this.text);
  }

  private getSpecialHitAreaConfig(): TSpecialHitAreaConfig | null {
    return SPECIAL_HIT_AREAS[this.textureId] ?? null;
  }

  private isPointInsideHole(px: number, py: number, hole: THoleShape): boolean {
    if (hole.type === 'circle') {
      const dx = px - hole.x;
      const dy = py - hole.y;

      return dx * dx + dy * dy <= hole.radius * hole.radius;
    }

    return false;
  }
}
