import { Text, Container, Point, Texture } from 'pixi.js-legacy';

import { Entity } from './entity';

import { calculateScale } from '@/helpers/calculateScale';
import { E } from '@/helpers/e';
import { VisualLocation, SizeData, TextDatum, SpriteLayout } from '@/interfaces';

export class Ring extends Entity {
  private coeff: number = 1;
  private realRatio: number = 1;
  private visualLocation: VisualLocation;
  private textDatum: TextDatum;
  private text: Text;
  private descriptionText: Text;
  private onClick: () => void;
  private idx: number;
  private sizeData: SizeData;
  private textContainer: Container;
  private meterPlural: string;

  constructor(
    idx: number,
    textureId: string,
    sizeData: SizeData,
    textureLow: Texture,
    spriteLayout: SpriteLayout,
    visualLocation: VisualLocation,
    textDatum: TextDatum,
    metersText: string,
  ) {
    super(sizeData.exponent, textureId, textureLow, spriteLayout);

    this.idx = idx;
    this.coeff = sizeData.coeff;
    this.realRatio = sizeData.realRatio;
    this.visualLocation = visualLocation;
    this.textDatum = textDatum;
    this.sizeData = sizeData;

    this.meterPlural = metersText;

    const scale = calculateScale(this.scaleExp, this.coeff, this.realRatio);
    this.container.scale = new Point(scale, scale);

    this.createText();
  }

  setZoom(globalZoomExp: number) {
    const scaleExp = this.scaleExp - globalZoomExp;
    if (!this.culled) {
      const scale = calculateScale(scaleExp, this.coeff, this.realRatio); // Math.round(rawScale * 500) / 500;
      this.cull(scale);

      if (scale > 0.05 && scale < 0.1) {
        this.textContainer.alpha = 0.5;
      } else if (scale > 0.1) {
        this.textContainer.alpha = 1;
      } else if (this.text.alpha !== 0) {
        this.textContainer.alpha = 0;
      }

      if (this.cachePeriod) {
        this.textContainer.alpha = 1;
      }
      this.textContainer.visible = this.textContainer.alpha !== 0;

      this.container.scale = new Point(scale, scale);
    } else {
      const scaleExp = this.scaleExp - globalZoomExp;

      if (scaleExp > 2 || scaleExp < -4) {
        this.cull(E(-4));
      } else {
        const scale = calculateScale(scaleExp, this.coeff, this.realRatio); // Math.round(rawScale * 500) / 500;
        this.cull(scale);
      }
    }
  }
  createText() {
    const baseStyle = {
      fontFamily: 'Roboto',
      fontSize: 40,
      fill: 0x777777,
      align: 'center' as const,
      wordWrap: false,
      wordWrapWidth: 1000,
      breakWords: false,
    };

    const textStyle = {
      ...baseStyle,
      fontSize: 60,
    };

    const expBaseStyle = {
      ...baseStyle,
      fontSize: 40,
    };

    const expSupStyle = {
      ...baseStyle,
      fontSize: 24,
    };

    const descriptionStyle = {
      ...baseStyle,
    };

    const scale = calculateScale(this.scaleExp, this.coeff, this.realRatio); // Math.round(rawScale * 500) / 500;

    if (scale > E(5)) {
      textStyle.fill = 0xdddddd;
      expBaseStyle.fill = 0xdddddd;
      expSupStyle.fill = 0xdddddd;
      descriptionStyle.fill = 0xdddddd;
    }

    this.text = new Text(this.textDatum.title, textStyle);
    this.text.anchor.set(0.5, 0);
    this.text.cacheAsBitmap = false;
    this.text.position.x = 0;
    this.text.position.y = -300;

    const expTextContainer = new Container();

    const baseText = new Text('10', expBaseStyle);
    baseText.anchor.set(0, 0);

    const superscriptText = new Text(String(this.sizeData.exponent), expSupStyle);
    superscriptText.anchor.set(0, 0);
    superscriptText.position.x = baseText.width + 2;
    superscriptText.position.y = -2;

    const unitText = new Text(` ${this.meterPlural}`, expBaseStyle);
    unitText.anchor.set(0, 0);
    unitText.position.x = baseText.width + superscriptText.width + 6;
    unitText.position.y = 0;

    expTextContainer.addChild(baseText, superscriptText, unitText);
    expTextContainer.position.x = -expTextContainer.width / 2;
    expTextContainer.position.y = -225;

    this.descriptionText = new Text(this.textDatum.description, descriptionStyle);
    this.descriptionText.anchor.set(0.5, 0);
    this.descriptionText.cacheAsBitmap = false;
    this.descriptionText.position.x = 0;
    this.descriptionText.position.y = 175;

    this.textContainer = new Container();
    this.textContainer.addChild(this.text, this.descriptionText, expTextContainer);

    this.container.addChild(this.textContainer);
  }
}
