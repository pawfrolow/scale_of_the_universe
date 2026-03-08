import * as PIXI from 'pixi.js-legacy'
import 'pixi.js-legacy'
import { Assets } from 'pixi.js-legacy'

import { Slider } from './classes/slider'
import { Universe } from './classes/universe'
import { ScaleText } from './classes/scaleText'

import { map } from './helpers/map'
import { i18next, initI18n } from '../i18n'
import { getTextureJsonPaths } from './helpers/getTextureJsonPaths'
import { throttle } from './helpers/throttle'
import { toggleFullscreen } from './helpers/fullscreen'

declare global {
  interface Window {
    startSOTU: () => void
  }
}

console.log(`
  Шкала масштабов Вселенной 2.1

  Разработано: Кэри Хуан, Майкл Хуан
  Разработка веб версии: Мэтью Мартори
  Copyright ©: Кэри и Майкл Хуан
  Перевод: Павел Фролов
  
  Сделано с ♥️
`)

const frozenStar = new Audio('sound/frozen_star.mp3')
frozenStar.loop = true
frozenStar.volume = 0.5
frozenStar.preload = 'auto'

const frame = document.getElementById('frame') as HTMLElement
const sotuFrame = document.getElementById('sotu') as HTMLElement
const modal = document.getElementById('modal') as HTMLDialogElement | null
const buttons = document.getElementById('buttons') as HTMLElement
const spaceBg = document.getElementById('spaceBgImage') as HTMLElement
const earthBg = document.getElementById('earthBgImage') as HTMLElement
const startBtn = document.getElementById('startBtn') as HTMLButtonElement
const startBtnText = document.getElementById('startBtnText') as HTMLElement
const muteToggle = document.querySelector('.speaker') as HTMLElement | null
const fullscreenBtn = document.getElementById('fullscreenBtn') as HTMLButtonElement

let isMuted = false

muteToggle?.addEventListener('click', (ev) => {
  ev.preventDefault()
  isMuted = !isMuted
  muteToggle.classList.toggle('mute', isMuted)
  frozenStar.muted = isMuted

  if (isMuted) {
    frozenStar.pause()
  } else {
    void frozenStar.play().catch(console.error)
  }
})

fullscreenBtn?.addEventListener('click', () => {
  toggleFullscreen(frame);
});

const textureJsonPaths: string[] = getTextureJsonPaths()

const globalResolution = 1

async function bootstrap() {
  await initI18n('ru');

  console.log(i18next)

  startBtnText.innerHTML = i18next.t('html.modal.startLoading', { ns: 'ui' });
  startBtn.disabled = true

  const resources: Record<string, any> = {}

  for (const path of textureJsonPaths) {
    resources[path] = await Assets.load(path)
  }

  let app: PIXI.Application

  try {
    app = new PIXI.Application({
      width: frame.offsetWidth,
      height: frame.offsetHeight,
      antialias: true,
      backgroundAlpha: 0,
      powerPreference: 'high-performance',
      resolution: globalResolution,
      sharedTicker: true,
      resizeTo: sotuFrame,
    })
  } catch (err) {
    console.log('error', err)
    app = new PIXI.Application({
      width: frame.offsetWidth,
      height: frame.offsetHeight,
      backgroundColor: 0xffffff,
      backgroundAlpha: 0,
      antialias: true,
      forceCanvas: true,
      resolution: globalResolution,
    })
  }

  const w = app.renderer.width + 3
  const h = app.renderer.height

  const slider = new Slider(app, w, h, globalResolution, onChange, onHandleClicked)
  slider.init()

  const universe = new Universe(0, slider, app)
  const scaleText = new ScaleText((w * 0.9) / globalResolution, slider.topY - 40, '0')

  const allHighTextures: Record<string, PIXI.Texture> = {}

  for (const key of Object.keys(resources)) {
    const resource = resources[key]
    if (resource?.textures) {
      Object.assign(allHighTextures, resource.textures)
    }
  }

  function onChange(x: number, percent: number) {
    const scaleExp = percent * 62 - 35

    scaleText.setColor(scaleExp)

    if (scaleExp <= 5) {
      buttons.style.filter = ''
    }

    if (scaleExp > 5 && scaleExp < 7) {
      const opacity = map(scaleExp, 5, 7, 0.1, 100)
      const opacityNorm = opacity / 100

      if (spaceBg) {
        spaceBg.style.opacity = `${opacityNorm}`
      }

      if (earthBg) {
        earthBg.style.opacity = `${1 - opacityNorm}`
      }

      if (buttons) {
        buttons.style.filter = `invert(${opacity}%)`
      }
    }

    if (scaleExp >= 7) {
      buttons.style.filter = 'invert(100%)'
    }

    universe.update(scaleExp)
    scaleText.setText(`${Math.round(scaleExp * 10) / 10}`)
  }

  function onHandleClicked() {
    universe.onHandleClicked()
  }

  slider.setPercent(map(0.1, -35, 27, 0, 1))

  app.stage.addChild(
    universe.container,
    slider.container,
    scaleText.container,
    universe.displayContainer
  )

  sotuFrame.appendChild(app.view as HTMLCanvasElement)

  await universe.createItems(allHighTextures);

  slider.setPercent(map(0, -35, 27, 0, 1))
  universe.prevZoom = 0

  const handleResize = throttle(() => {
    requestAnimationFrame(() => {
      const w = app.renderer.width + 3;
      const h = app.renderer.height;

      const currentPercent = slider.getPercent();

      slider.resize(w, h, globalResolution);
      universe.resize();
      scaleText.resize((w * 0.9) / globalResolution, slider.topY - 40);

      slider.setPercent(currentPercent);
    });
  }, 100);

  window.addEventListener('resize', handleResize);

  startBtn?.addEventListener('click', () => {
    modal?.close()
    frame.style.visibility = 'visible'

    if (!isMuted) {
      void frozenStar.play().catch(console.error)
    }
  })

  startBtnText.innerHTML = i18next.t('html.modal.startButton', { ns: 'ui' });
  startBtn.disabled = false
}

void bootstrap().catch(console.error)