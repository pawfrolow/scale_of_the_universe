import {
  Graphics,
  Application,
  Container,
  Point,
  Ticker
} from "pixi.js-legacy";
import { Tweenable } from 'shifty';

const WIDTH_PERCENT = 0.9;
const HEIGHT_PERCENT = 0.05;
const BOTTOM_MARGIN = 100;
const HANDLE_WIDTH_PERCENT = 0.04;
const SCROLL_SPEED = -1.5;
let MAX_SCROLL_SPEED = 3; // TODO: FIX: this is modified in runtime to speed up the onclick animation
let EASING_CONSTANT = 0.005;

export class Slider {
  private app: Application;
  public container: Container;
  private handleGfx: Graphics;
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

  constructor(app: Application,
    w: number,
    h: number,
    globalRes: number,
    onChange: Function,
    onHandleClicked: Function) {
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

    this.margin = (this.w - this.widthPixels) / 2; // left/right margin for slider bg

    document.addEventListener("mousewheel", (e: any) => {
      var e = window.event || e; // old IE support
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      this.startOffset = 0;

      this.interact();


      this.moveTarget(delta * SCROLL_SPEED)
    }, false);
  }

  init() {
    let background = this.backGround();
    let handle = this.handle();

    this.container.removeChildren();
    this.container.addChild(background, handle)

    return this.container;
  }


  backGround() {
    const graphics = new Graphics();

    // set a fill and a line style again and draw a rectangle
    graphics.lineStyle(2, 0xaaaaaa, 0);
    graphics.beginFill(0xffffff, 1);

    // set a fill and a line style again and draw a rectangle
    graphics.lineStyle(2, 0xaaaaaa, 1);
    graphics.beginFill(0x666666, .5);

    const w = this.widthPixels;
    const h = this.h * HEIGHT_PERCENT;

    const x = this.margin;
    const y = this.h - h - BOTTOM_MARGIN;

    this.topY = y;

    graphics.drawRoundedRect(x, y, w, h, h / 2);


    const widthPixels = this.w;
    const handleWidthPixels = this.w * HANDLE_WIDTH_PERCENT;

    const scaleWidthPixels = widthPixels - handleWidthPixels / 2;

    graphics.lineStyle(3, 0x00ff00, 1);

    // blue rectangle
    graphics.lineStyle(3, 0x0000ff, 1);
    graphics.cacheAsBitmap = true;

    return graphics;
  }

  handle() {
    const graphics = new Graphics()
    graphics.eventMode = 'static'
    graphics.cursor = 'pointer'

    graphics.lineStyle(0, 0xaaaaaa, 0)
    graphics.beginFill(0xffffff, 1)

    const w = this.w * HANDLE_WIDTH_PERCENT
    this.handleW = w
    const h = this.h * HEIGHT_PERCENT

    const x = this.w / 2 + w / 2
    this.currentX = x
    this.targetX = x
    const y = this.h - h - BOTTOM_MARGIN

    graphics.drawRoundedRect(0, 0, w, h, h / 2)

    graphics.lineStyle(3, 0xff0000, 1)
    graphics.endFill()

    graphics.lineStyle(3, 0xff00ff, 1)

    graphics.position = new Point(x, y)
    graphics.cacheAsBitmap = true

    const here = this

    function onDragStart(event: any) {
      here.startOffset = event.global.x - here.handleGfx.position.x
      here.dragging = true

      graphics.alpha = 0.75
      here.interact()
      here.onHandleClicked()
    }

    function onDragEnd() {
      if (!here.dragging) return

      graphics.alpha = 1
      here.dragging = false
      here.interact()

      const diff = here.currentX - here.targetX
      const newDiff = diff / 3

      if (Math.abs(diff) > (here.w / 10)) {
        here.setTarget(here.currentX - newDiff)
      }
    }

    function onGlobalDragMove(event: any) {
      if (!here.dragging) return

      here.interact()

      const newX = event.global.x
      here.setTarget(newX - here.startOffset)
    }

    graphics.on('pointerdown', onDragStart)
    graphics.on('pointerup', onDragEnd)
    graphics.on('pointerupoutside', onDragEnd)

    // глобальное движение, даже вне хэндла
    graphics.on('globalpointermove', onGlobalDragMove)

    this.handleGfx = graphics
    this.handleAnim()

    return graphics
  }

  setTarget(x: number) {
    if (x < 0) {
      x = 0;
    }
    this.targetX = x;
  }

  setTargetPercent(percent: number) {
    // HACK: changes constants to speed up the animations
    // this.terminateAutopilot()
    if (percent < 0) {
      percent = 0;
    }

    MAX_SCROLL_SPEED = 9;
    EASING_CONSTANT = 0.1;
  }


  interact(): void {
    this.interaction = true;

    Ticker.shared.start();
    Ticker.shared.speed = 1;
  }
  setAnimationTargetPercent(targetPercent: number) {
    if (!this.tweenable.isPlaying) {
      const deltaPercent = Math.abs(this.currentPercent - targetPercent);
      const duration = Math.min(Math.max(50000 * deltaPercent, 250), 1000)

      this.tweenable.setConfig({
        from: { pos: this.currentPercent },
        to: { pos: targetPercent },
        easing: 'easeInOutSine',
        duration,
        render: (state) => typeof state.pos === 'number' && this.setPercent(state.pos)
      });

      this.tweenable.tween()
    }

  }

  animStopped() {
    EASING_CONSTANT = .025;
    MAX_SCROLL_SPEED = 3;
  }

  setPercent(percent: number) {
    if (percent < 0) {
      percent = 0;
    }

    this.currentX = this.scaleWidthPixels * percent + this.margin;
    this.targetX = this.scaleWidthPixels * percent + this.margin;
    this.handleGfx.position.x = this.currentX;

    this.onChange(0, percent);
  }

  moveTarget(x: number) {

    if (this.targetX + x > 0) {
      this.targetX += x;
    }
  }

  handleAnim() {

    let frameCount = 0;
    let prevDX = 0;
    let ticker = Ticker.shared;

    ticker.add((deltaTime: number) => {
      if (!this.tweenable.isPlaying) {
        let dX = (this.targetX - this.currentX) * deltaTime; //
        const widthPixels = this.w * WIDTH_PERCENT;
        const handleWidthPixels = this.w * HANDLE_WIDTH_PERCENT;
        const scaleWidthPixels = widthPixels - handleWidthPixels;

        const margin = (this.w - widthPixels) / 2; // left/right margin for slider bg

        const leftBound = margin + handleWidthPixels / 2; // allow slider to get to left most edge
        const rightBound = margin + widthPixels - handleWidthPixels / 2 + 3; // ^^ but right edge

        let dXScaled = dX * EASING_CONSTANT;
        const dir = dXScaled / Math.abs(dXScaled);


        if (Math.abs(dXScaled) > MAX_SCROLL_SPEED) {
          dXScaled = MAX_SCROLL_SPEED * dir
        }


        const newX = this.currentX + dXScaled;
        const adjX = newX + handleWidthPixels / 2;

        const insideLeft = leftBound < adjX;
        const insideRight = adjX < rightBound;

        let changed = Math.abs(dXScaled) > .005;
        let newPosition = this.currentX;

        if (insideLeft && insideRight && changed) {
          newPosition = newX;
          this.currentX = newX;
        }

        if (adjX > rightBound + 5) {
          newPosition = rightBound - 1 - handleWidthPixels / 2;
          this.currentX = rightBound - 1 - handleWidthPixels / 2;
        }


        this.handleGfx.position.x = newPosition;


        let percent = (newPosition - margin) / (scaleWidthPixels);

        this.currentPercent = percent;

        if (changed) {
          this.onChange(newPosition, percent);
        } else {

          this.animStopped()
        }

        prevDX = dXScaled;

      }
    });
  }
}
