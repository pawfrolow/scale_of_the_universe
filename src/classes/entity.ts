import {
  Sprite,
  Container,
  Texture,
  Point
} from "pixi.js-legacy";
import { E } from "../helpers/e";
import { SpriteLayout } from "../interfaces";

export class Entity {
  public scaleExp: number;
  protected sprite: Sprite;
  protected video: Sprite;
  public videoStream: any;
  protected spriteLow: Sprite;
  protected spriteMedium: Sprite;
  public culled: boolean = false;
  public cachePeriod: boolean = true;
  public hiddenSprites: boolean = false;
  public isHighQuality: boolean = false;
  public textureId: string;

  public container: Container;
  public spriteLayout: SpriteLayout;

  safetyPeriod: boolean = true;

  constructor(
    scaleExp: number,
    textureId: string,
    textureLow: Texture,
    spriteLayout: SpriteLayout
  ) {
    this.scaleExp = scaleExp;
    this.textureId = textureId;
    this.spriteLayout = spriteLayout;
    this.container = new Container();

    setTimeout(() => (this.safetyPeriod = false), 5000);

    const scale = E(this.scaleExp);

    const spriteLow = new Sprite(textureLow);

    spriteLow.anchor.set(0.5, 0.5);
    spriteLow.position.set(spriteLayout.x, spriteLayout.y);
    spriteLow.zIndex = 0;

    this.container.scale = new Point(scale, scale);

    this.spriteLow = spriteLow;
    this.spriteLow.visible = true;

    this.container.addChild(this.spriteLow);
  }

  getContainer() {
    return this.container;
  }

  setZoom(globalZoomExp: number, deltaZoom: number) {
    const scale = E(this.scaleExp - globalZoomExp);
    this.container.scale = new Point(scale, scale);
  }

  setQuality(qualityIndex: number) {
    if (this.sprite) {
      this.sprite.visible = qualityIndex === 1
    }

    this.spriteLow.visible = qualityIndex === 0;
  }

  public setItemQuality(isHigh: boolean): void {
    this.isHighQuality = isHigh;

    if (this.sprite) {
      this.sprite.visible = this.isHighQuality;
      this.sprite.anchor.set(0.5, 0.5);
      this.sprite.position.set(this.spriteLayout.x, this.spriteLayout.y);
    }

    this.spriteLow.visible = !this.isHighQuality;
  }

  cull(scale: number, sizeData: any) {
    if (scale < 0.001 || scale > 12) {
      this.container.renderable = false;
      this.culled = true;
    } else {
      this.container.renderable = true;
      this.culled = false;
    }

    if (scale < 0.075 || !this.isHighQuality) {
      this.setQuality(0);
    } else {
      this.setQuality(1);
    }
  }
}