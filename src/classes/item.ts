import {
  Sprite,
  Text,
  Container,
  Texture,
  Point,
  Polygon,
  DisplayObject
} from "pixi.js-legacy";
import { Entity } from "./entity";
import { E } from "../helpers/e";
import { getGraphics } from "../helpers/description";
import {
  TextDatum,
  VisualLocation,
  SizeData,
  ExtraText
} from "../interfaces";
import { calculateScale } from "../helpers/calculateScale";

export class Item extends Entity {
  public descriptionGraphics: Container;

  public coeff: number = 1;
  public sizeData: SizeData;
  public realRatio: number = 1;
  public currentScale: number = 1;
  public visualLocation: VisualLocation;
  public video: Sprite;
  public videoSrc: any;
  private textDatum: TextDatum;
  public text: Text;
  private onClick: Function;
  private description: Container;
  private units: Array<string>;
  private extraText: ExtraText;

  private centerVec: Point;

  constructor(
    sizeData: SizeData,
    textureLow: Texture,
    visualLocation: VisualLocation,
    textDatum: TextDatum,
    extraText: ExtraText,
    units: Array<string>,
    onClick: Function
  ) {
    super(sizeData.exponent, sizeData.objectID, textureLow);

    this.extraText = extraText;

    this.coeff = sizeData.coeff;
    this.realRatio = sizeData.realRatio;
    this.visualLocation = visualLocation;
    this.textDatum = textDatum;
    this.sizeData = sizeData;
    this.units = units;

    const trim = textureLow.trim ?? {
      x: 0,
      y: 0,
      width: textureLow.width,
      height: textureLow.height,
    }

    const orig = textureLow.orig ?? {
      width: textureLow.width,
      height: textureLow.height,
    }

    const dX = orig.width / 2 - trim.x - trim.width / 2
    const dY = orig.height / 2 - trim.y - trim.height / 2

    const c = Math.sqrt(dX * dX + dY * dY) || 1

    this.centerVec = new Point(dX / c, dY / c)

    this.onClick = onClick;

    const scale = calculateScale(this.scaleExp, this.coeff, this.realRatio)//  E(this.scaleExp) * this.coeff * this.realRatio;
    this.container.scale = new Point(scale, scale);

    this.createClickableRegion();
    this.createText();
    this.container.sortableChildren = true;
    this.cull(scale, this.sizeData);
  }

  showDescription() {
    if (this.description) {
      return;
    }

    const descriptionGfx = getGraphics(
      this.visualLocation,
      this.textDatum,
      this.extraText,
      this.units,
      this.sizeData
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

  setZoom(globalZoomExp: number, deltaZoom: number) {
    const scaleExp = this.scaleExp - globalZoomExp;


    if (!this.culled) {
      const scale = calculateScale(scaleExp, this.coeff, this.realRatio)// Math.round(rawScale * 500) / 500;

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

      this.cull(scale, this.sizeData);
      this.container.scale = new Point(scale, scale);
      this.currentScale = scale;
    } else {
      const scaleExp = this.scaleExp - globalZoomExp;
      if (scaleExp > 2 || scaleExp < -4) {
        this.cull(E(-8), this.sizeData);
      } else {
        const scale = calculateScale(scaleExp, this.coeff, this.realRatio)// Math.round(rawScale * 500) / 500;
        this.cull(scale, this.sizeData);
      }
    }
  }

  getScale() {
    return this.currentScale;
  }

  createText() {
    const textStyle = {
      fontFamily: "Roboto",
      fontSize: 48 * this.visualLocation.titleScale,
      fill: 0x000000,
      align: "center" as const,
      wordWrap: this.visualLocation.titleWrap,
      wordWrapWidth: 400,
    };

    const scale = calculateScale(this.scaleExp, this.coeff, this.realRatio)

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
    const bX1 = this.visualLocation.boundX;
    const bY1 = this.visualLocation.boundY;
    const bX2 = bX1 + this.visualLocation.boundW;
    const bY2 = bY1 + this.visualLocation.boundH;

    const points = [
      new Point(bX1, bY1),
      new Point(bX2, bY1),
      new Point(bX2, bY2),
      new Point(bX1, bY2),
    ];

    sprite.hitArea = new Polygon(points);
    this.setInteractiveEvents(sprite);
  }

  setInteractiveEvents(target: DisplayObject) {
    const here = this;

    function onButtonDown(event: any) {
      event?.stopPropagation?.();

      here.onClick(here);
    }

    // для pixi legacy / mixed API
    target.eventMode = 'static';
    target.interactive = true;
    target.cursor = 'pointer';
    // @ts-ignore
    target.buttonMode = true;

    target
      .on('pointerdown', onButtonDown);
  }
}
