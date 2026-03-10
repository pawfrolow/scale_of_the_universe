import {
  Graphics,
  Application,
  Container,
  Point,
  Ticker
} from "pixi.js-legacy";
import { Tweenable } from 'shifty';
import { getCssPxVar } from "../helpers/getCssPxVar";

const WIDTH_PERCENT = 0.9;
const HEIGHT_PERCENT = 0.05;
const BASE_BOTTOM_MARGIN = 24;
const HANDLE_WIDTH_PERCENT = 0.04;
const SCROLL_SPEED = -1.5;
let MAX_SCROLL_SPEED = 3;
let EASING_CONSTANT = 0.005;
const MIN_HANDLE_WIDTH_PX = 40;

export class Slider {
  private app: Application;
  public container: Container;
  private handleGfx!: Graphics;
  private onChange: Function;
  private onHandleClicked: Function;
  public dragging: Boolean = false;
  private fpsTarget: number = 200;
  private margin: number;
  private targetX: number;
  private currentX: number;
  private currentPercent: number;
  private interaction: boolean = false;
  private mouseDown: boolean = false;
  public topY: number;
  private w: number;
  private h: number;
  public handleW: number;
  private tweenable: Tweenable;
  private startOffset: number = 0;

  public widthPixels: number;
  public handleWidthPixels: number;
  public scaleWidthPixels: number;

  private ticker = Ticker.shared;
  private tickerHandler?: (deltaTime: number) => void;
  private wheelHandler: (e: Event) => void;
  private destroyed = false;

  constructor(
    app: Application,
    w: number,
    h: number,
    globalRes: number,
    onChange: Function,
    onHandleClicked: Function
  ) {
    this.app = app;
    this.onChange = onChange;
    this.onHandleClicked = onHandleClicked;
    this.w = w / globalRes;
    this.h = h / globalRes;

    this.tweenable = new Tweenable();
    this.container = new Container();

    this.widthPixels = this.w * WIDTH_PERCENT;
    this.handleWidthPixels = this.w * HANDLE_WIDTH_PERCENT;
    this.scaleWidthPixels = this.widthPixels - this.handleWidthPixels;
    this.margin = (this.w - this.widthPixels) / 2;

    this.wheelHandler = (event: Event) => {
      if (this.destroyed) return;

      const e = event as WheelEvent & { wheelDelta?: number; detail?: number };
      const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail || 0)));

      this.startOffset = 0;
      this.interact();
      this.moveTarget(delta * SCROLL_SPEED);
    };

    document.addEventListener('mousewheel', this.wheelHandler, false);
  }

  init() {
    const background = this.backGround();
    const handle = this.handle();

    this.container.removeChildren();
    this.container.addChild(background, handle);

    return this.container;
  }

  backGround() {
    const graphics = new Graphics();

    graphics.lineStyle(2, 0xaaaaaa, 0);
    graphics.beginFill(0xffffff, 1);

    graphics.lineStyle(2, 0xaaaaaa, 1);
    graphics.beginFill(0x666666, 0.5);

    const w = this.widthPixels;
    const h = this.h * HEIGHT_PERCENT;

    const x = this.margin;
    const y = this.h - h - this.getBottomMargin();

    this.topY = y;

    graphics.drawRoundedRect(x, y, w, h, h / 2);
    graphics.cacheAsBitmap = true;

    return graphics;
  }

  handle() {
    const graphics = new Graphics();
    graphics.eventMode = 'static';
    graphics.cursor = 'pointer';

    graphics.lineStyle(0, 0xaaaaaa, 0);
    graphics.beginFill(0xffffff, 1);

    const w = this.getHandleWidth();
    this.handleW = w;
    const h = this.h * HEIGHT_PERCENT;

    const x = this.w / 2 + w / 2;
    this.currentX = x;
    this.targetX = x;
    const y = this.h - h - this.getBottomMargin();

    graphics.drawRoundedRect(0, 0, w, h, h / 2);
    graphics.endFill();

    graphics.position = new Point(x, y);
    graphics.cacheAsBitmap = true;

    const here = this;

    function onDragStart(event: any) {
      if (here.destroyed || !here.handleGfx || here.handleGfx.destroyed) return;

      here.startOffset = event.global.x - here.handleGfx.position.x;
      here.dragging = true;
      graphics.alpha = 0.75;
      here.interact();
      here.onHandleClicked();
    }

    function onDragEnd() {
      if (here.destroyed) return;
      if (!here.dragging) return;

      graphics.alpha = 1;
      here.dragging = false;
      here.interact();

      const diff = here.currentX - here.targetX;
      const newDiff = diff / 3;

      if (Math.abs(diff) > (here.w / 10)) {
        here.setTarget(here.currentX - newDiff);
      }
    }

    function onGlobalDragMove(event: any) {
      if (here.destroyed) return;
      if (!here.dragging) return;

      here.interact();

      const newX = event.global.x;
      here.setTarget(newX - here.startOffset);
    }

    graphics.on('pointerdown', onDragStart);
    graphics.on('pointerup', onDragEnd);
    graphics.on('pointerupoutside', onDragEnd);
    graphics.on('globalpointermove', onGlobalDragMove);

    this.handleGfx = graphics;
    this.handleAnim();

    return graphics;
  }

  setTarget(x: number) {
    const { minX, maxX } = this.getBounds();
    this.targetX = Math.max(minX, Math.min(maxX, x));
  }

  setTargetPercent(percent: number) {
    if (percent < 0) {
      percent = 0;
    }

    MAX_SCROLL_SPEED = 9;
    EASING_CONSTANT = 0.1;
  }

  interact(): void {
    if (this.destroyed) return;

    this.interaction = true;
    Ticker.shared.start();
    Ticker.shared.speed = 1;
  }

  setAnimationTargetPercent(targetPercent: number) {
    if (!this.tweenable.isPlaying) {
      const deltaPercent = Math.abs(this.currentPercent - targetPercent);
      const duration = Math.min(Math.max(50000 * deltaPercent, 250), 1000);

      this.tweenable.setConfig({
        from: { pos: this.currentPercent },
        to: { pos: targetPercent },
        easing: 'easeInOutSine',
        duration,
        render: (state) => typeof state.pos === 'number' && this.setPercent(state.pos)
      });

      this.tweenable.tween();
    }
  }

  animStopped() {
    EASING_CONSTANT = 0.025;
    MAX_SCROLL_SPEED = 3;
  }

  setPercent(percent: number) {
    if (this.destroyed) return;
    if (!this.handleGfx || this.handleGfx.destroyed) return;

    percent = Math.max(0, Math.min(1, percent));

    const { minX, maxX } = this.getBounds();

    this.currentPercent = percent;
    this.currentX = minX + (maxX - minX) * percent;
    this.targetX = this.currentX;
    this.handleGfx.position.x = this.currentX;

    this.onChange(0, percent);
  }

  moveTarget(x: number) {
    if (this.destroyed) return;
    this.setTarget(this.targetX + x);
  }

  handleAnim() {
    if (this.tickerHandler) {
      this.ticker.remove(this.tickerHandler);
    }

    this.tickerHandler = (deltaTime: number) => {
      if (this.destroyed) return;
      if (!this.handleGfx || this.handleGfx.destroyed) return;
      if (this.tweenable.isPlaying) return;

      const { minX, maxX } = this.getBounds();

      let dX = (this.targetX - this.currentX) * deltaTime;
      let dXScaled = dX * EASING_CONSTANT;

      const dir = dXScaled === 0 ? 0 : dXScaled / Math.abs(dXScaled);

      if (Math.abs(dXScaled) > MAX_SCROLL_SPEED) {
        dXScaled = MAX_SCROLL_SPEED * dir;
      }

      if (Math.abs(this.targetX - this.currentX) <= 0.01) {
        this.currentX = this.targetX;
        this.handleGfx.position.x = this.currentX;
        this.currentPercent = Math.max(0, Math.min(1, (this.currentX - minX) / (maxX - minX)));
        this.animStopped();
        return;
      }

      let newPosition = this.currentX + dXScaled;
      newPosition = Math.max(minX, Math.min(maxX, newPosition));

      if (newPosition === minX || newPosition === maxX) {
        this.targetX = newPosition;
      }

      this.currentX = newPosition;
      this.handleGfx.position.x = newPosition;

      const percent = Math.max(0, Math.min(1, (newPosition - minX) / (maxX - minX)));
      this.currentPercent = percent;

      if (Math.abs(dXScaled) > 0.005) {
        this.onChange(newPosition, percent);
      } else {
        this.animStopped();
      }
    };

    this.ticker.add(this.tickerHandler);
  }

  public resize(w: number, h: number, globalRes: number) {
    if (this.destroyed) return;

    this.w = w / globalRes;
    this.h = h / globalRes;

    this.widthPixels = this.w * WIDTH_PERCENT;
    this.handleWidthPixels = this.getHandleWidth();
    this.scaleWidthPixels = this.widthPixels - this.handleWidthPixels;
    this.margin = (this.w - this.widthPixels) / 2;

    const currentPercent = this.currentPercent ?? 0;

    this.init();
    this.setPercent(currentPercent);
  }

  public getPercent() {
    return this.currentPercent ?? 0;
  }

  public destroy() {
    this.destroyed = true;

    if (this.tickerHandler) {
      this.ticker.remove(this.tickerHandler);
      this.tickerHandler = undefined;
    }

    document.removeEventListener('mousewheel', this.wheelHandler, false);

    this.tweenable.stop?.();

    this.container.removeChildren();
    this.container.destroy({ children: true });
  }
  private getBounds() {
    const widthPixels = this.w * WIDTH_PERCENT;
    const handleWidthPixels = this.getHandleWidth();
    const scaleWidthPixels = widthPixels - handleWidthPixels;
    const margin = (this.w - widthPixels) / 2;

    const minX = margin;
    const maxX = margin + widthPixels - handleWidthPixels;

    return {
      minX,
      maxX,
      widthPixels,
      handleWidthPixels,
      scaleWidthPixels,
      margin,
    };
  }

  private getBottomMargin() {
    return BASE_BOTTOM_MARGIN + getCssPxVar('--safe-area-bottom');
  }

  private getHandleWidth() {
    return Math.max(this.w * HANDLE_WIDTH_PERCENT, MIN_HANDLE_WIDTH_PX);
  }
}