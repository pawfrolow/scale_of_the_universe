import * as PIXI from 'pixi.js-legacy'
import 'pixi.js-legacy'
import { Assets } from 'pixi.js-legacy'

import { Slider } from './classes/slider'
import { Universe } from './classes/universe'
import { ScaleText } from './classes/scaleText'

import { map } from './helpers/map'

declare global {
  interface Window {
    startSOTU: () => void
  }
}

const frozenStar = new Audio('/assets/sound/frozen_star.mp3')
frozenStar.loop = true
frozenStar.volume = 0.5
frozenStar.preload = 'auto'

const frame = document.getElementById('frame') as HTMLElement
const sotuFrame = document.getElementById('sotu') as HTMLElement
const modal = document.getElementById('modal') as HTMLDialogElement | null

console.log(`
  Шкала масштабов Вселенной 2.1

  Разработано: Кэри Хуан, Майкл Хуан
  Разработка веб версии: Мэтью Мартори
  Copyright ©: Кэри и Майкл Хуан
  Перевод: Павел Фролов
  
  Сделано с ♥️
`)

const muteToggle = document.querySelector('.speaker') as HTMLElement | null
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

const highJSONCount = 5
const textureJsonPaths: string[] = []

for (let i = 0; i <= highJSONCount; i++) {
  textureJsonPaths.push(`/assets/img/textures/new_items_${i}.json`)
}

const globalResolution = 1

async function bootstrap() {
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

  const buttons = document.getElementById('buttons') as HTMLElement | null
  const spaceBg = document.getElementById('spaceBgImage') as HTMLElement | null
  const earthBg = document.getElementById('earthBgImage') as HTMLElement | null

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
    } else if (buttons?.style.filter) {
      buttons.style.filter = ''
    }

    universe.update(scaleExp)
    scaleText.setText(`${Math.round(scaleExp * 10) / 10}`)
  }

  function onHandleClicked() {
    universe.onHandleClicked()
  }

  const textData = (
    await (await fetch('/assets/data/languages/l20.txt')).text()
  ).split('\n').map(x => x.replace(/\r?\n|\r/g, ''))

  slider.setPercent(map(0.1, -35, 27, 0, 1))

  app.stage.addChild(
    universe.container,
    slider.container,
    scaleText.container,
    universe.displayContainer
  )

  sotuFrame.appendChild(app.view as HTMLCanvasElement)

  await universe.createItems(allHighTextures, textData)

  slider.setPercent(map(0, -35, 27, 0, 1))
  universe.prevZoom = 0

  const startBtn = document.getElementById('startBtn') as HTMLButtonElement | null

  startBtn?.addEventListener('click', () => {
    modal?.close()
    frame.style.visibility = 'visible'

    if (!isMuted) {
      void frozenStar.play().catch(console.error)
    }
  })
}

void bootstrap().catch(console.error)