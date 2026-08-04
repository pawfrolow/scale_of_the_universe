import { Text, Container } from 'pixi.js-legacy';

import { PIXI_TEXT_FONT_FAMILY } from '@/config';
import { map } from '@/helpers/map';

export class ScaleText {
  public textSpace: Text;
  public textGround: Text;
  public baseTextSpace: Text;
  public baseTextGround: Text;
  public containerSpace: Container;
  public containerGround: Container;
  public container: Container;

  private textColor = 0x000000;
  private textColorSpace = 0xffffff;

  constructor(x: number, y: number, text: string) {
    this.baseTextGround = new Text('10', {
      fontFamily: PIXI_TEXT_FONT_FAMILY,
      fontSize: 32,
      fill: this.textColor,
      stroke: this.textColor,
      align: 'center',
    });

    this.textGround = new Text(text, {
      fontFamily: PIXI_TEXT_FONT_FAMILY,
      fontSize: 14,
      fill: this.textColor,
      stroke: this.textColor,
      align: 'left',
    });

    this.baseTextSpace = new Text('10', {
      fontFamily: PIXI_TEXT_FONT_FAMILY,
      fontSize: 32,
      fill: this.textColorSpace,
      stroke: this.textColorSpace,
      align: 'center',
    });

    this.textSpace = new Text(text, {
      fontFamily: PIXI_TEXT_FONT_FAMILY,
      fontSize: 14,
      fill: this.textColorSpace,
      stroke: this.textColorSpace,
      align: 'left',
    });

    this.containerSpace = new Container();
    this.containerGround = new Container();

    this.containerSpace.addChild(this.baseTextSpace, this.textSpace);
    this.containerGround.addChild(this.baseTextGround, this.textGround);

    this.container = new Container();

    this.container.addChild(this.containerGround, this.containerSpace);

    this.textGround.x = Math.round(x + 27);
    this.textGround.y = Math.round(y);

    this.textSpace.x = Math.round(x + 27);
    this.textSpace.y = Math.round(y);

    this.baseTextGround.x = Math.round(x - 10);
    this.baseTextGround.y = Math.round(y);

    this.baseTextSpace.x = Math.round(x - 10);
    this.baseTextSpace.y = Math.round(y);
  }

  setText(str: string) {
    const value = Math.round(Number(str) * 10) / 10;
    const formattedValue = Number.isInteger(value) ? String(value) : value.toFixed(1);

    this.textSpace.text = formattedValue;
    this.textGround.text = formattedValue;
  }

  setColor(scaleExp: number) {
    if (scaleExp > 5) {
      const opacity = map(scaleExp, 5, 7, 0.1, 1);

      this.containerSpace.alpha = opacity;
    } else {
      this.containerSpace.alpha = 0.1;
    }
  }

  public resize(x: number, y: number) {
    this.textGround.x = Math.round(x + 27);
    this.textGround.y = Math.round(y);

    this.textSpace.x = Math.round(x + 27);
    this.textSpace.y = Math.round(y);

    this.baseTextGround.x = Math.round(x - 10);
    this.baseTextGround.y = Math.round(y);

    this.baseTextSpace.x = Math.round(x - 10);
    this.baseTextSpace.y = Math.round(y);
  }
}
