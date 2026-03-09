import { RefObject, useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js-legacy'

import { Slider } from '../classes/slider'
import { Universe } from '../classes/universe'
import { ScaleText } from '../classes/scaleText'
import { map } from '../helpers/map'
import { throttle } from '../helpers/throttle'
import { getTextureIdsFromManifest } from '../helpers/getTextureIdsFromManifest'
import { loadItemTextures } from '../helpers/loadItemTextures'
import { MAX_SCALE_EXP, MIN_SCALE_EXP } from '../config'
import { TItemsManifest } from '../interfaces'
import { loadLocaleOverride } from '../helpers/loadLocaleOverride'
import { resolveItemsManifest } from '../helpers/resolveItemsManifest'
import { resolveTextureSources } from '../helpers/resolveTextureSources'
import { useTranslation } from 'react-i18next'
import { validateItemsOverride } from '../helpers/validateItemsOverride'

PIXI.settings.ROUND_PIXELS = true
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR

interface IUseUniverseParams {
  containerRef: RefObject<HTMLDivElement | null>
  isStarted: boolean
  onAssetsLoading: () => void
  onAssetsReady: () => void
  onAssetsProgress?: (progress: number) => void
}

export const useUniverse = ({
  containerRef,
  isStarted,
  onAssetsLoading,
  onAssetsReady,
  onAssetsProgress,
}: IUseUniverseParams) => {
  const appRef = useRef<PIXI.Application | null>(null)
  const initializedRef = useRef(false)
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!isStarted) {
      return
    }

    if (!containerRef.current || initializedRef.current) {
      return
    }

    initializedRef.current = true

    let app: PIXI.Application | null = null
    let slider: Slider | null = null
    let resizeHandler: (() => void) | null = null
    let isDestroyed = false

    const bootstrap = async () => {
      const frame = document.getElementById('frame') as HTMLElement | null
      const buttons = document.querySelector('.buttons') as HTMLElement | null
      const spaceBg = document.getElementById('spaceBgImage') as HTMLElement | null
      const earthBg = document.getElementById('earthBgImage') as HTMLElement | null

      if (!frame || !containerRef.current || isDestroyed) {
        return
      }

      onAssetsLoading()
      onAssetsProgress?.(0)

      const locale = i18n.language

      const baseManifest = await (await fetch('data/items.json')).json() as TItemsManifest
      const override = await loadLocaleOverride(locale)
      const resolvedManifest = resolveItemsManifest(baseManifest, override)
      const textureIds = getTextureIdsFromManifest(resolvedManifest)
      const textureSourceMap = resolveTextureSources(resolvedManifest, locale, override)

      validateItemsOverride(baseManifest, override)

      const allHighTextures = await loadItemTextures(
        textureIds,
        resolvedManifest,
        textureSourceMap,
        (loaded, total) => {
          onAssetsProgress?.(Math.round((loaded / total) * 100))
        }
      )

      if (isDestroyed || !containerRef.current) {
        return
      }

      const globalResolution = 1

      try {
        app = new PIXI.Application({
          width: frame.offsetWidth,
          height: frame.offsetHeight,
          antialias: true,
          backgroundAlpha: 0,
          powerPreference: 'high-performance',
          resolution: globalResolution,
          sharedTicker: true,
          resizeTo: containerRef.current,
        })
      } catch (err) {
        console.error(err)

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

      if (!app || isDestroyed || !containerRef.current) {
        return
      }

      appRef.current = app

      const w = app.renderer.width + 3
      const h = app.renderer.height

      let universe!: Universe
      let scaleText!: ScaleText

      const onHandleClicked = () => {
        universe.onHandleClicked()
      }

      const onChange = (_x: number, percent: number) => {
        if (isDestroyed) {
          return
        }

        const extraRightBoost = 0.2
        const boost = Math.pow(percent, 4) * extraRightBoost

        const scaleExp =
          MIN_SCALE_EXP +
          percent * (MAX_SCALE_EXP - MIN_SCALE_EXP) +
          boost

        scaleText.setColor(scaleExp)

        if (scaleExp <= 5) {
          if (spaceBg) {
            spaceBg.style.opacity = '0'
          }

          if (earthBg) {
            earthBg.style.opacity = '1'
          }

          if (buttons) {
            buttons.style.filter = ''
          }
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

        if (scaleExp >= 7 && buttons) {
          buttons.style.filter = 'invert(100%)'
        }

        universe.update(scaleExp)
        scaleText.setText(`${Math.round(scaleExp * 10) / 10}`)
      }

      slider = new Slider(app, w, h, globalResolution, onChange, onHandleClicked)
      slider.init()

      universe = new Universe(0, slider, app)
      scaleText = new ScaleText((w * 0.9) / globalResolution, slider.topY - 40, '0')

      app.stage.addChild(
        universe.container,
        slider.container,
        scaleText.container,
        universe.displayContainer
      )

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(app.view as HTMLCanvasElement)

      await universe.createItems(allHighTextures, resolvedManifest)

      if (isDestroyed || !app || !slider || !containerRef.current) {
        return
      }

      slider.setPercent(map(0, -35, 27, 0, 1))
      universe.prevZoom = 0

      resizeHandler = throttle(() => {
        if (!app || !slider || isDestroyed) {
          return
        }

        requestAnimationFrame(() => {
          if (!app || !slider || isDestroyed) {
            return
          }

          const width = app.renderer.width + 3
          const height = app.renderer.height
          const currentPercent = slider.getPercent()

          slider.resize(width, height, globalResolution)
          universe.resize()
          scaleText.resize((width * 0.9) / globalResolution, slider.topY - 40)
          slider.setPercent(currentPercent)
        })
      }, 100)

      window.addEventListener('resize', resizeHandler)

      if (!isDestroyed) {
        onAssetsProgress?.(100)
        onAssetsReady()
      }
    }

    void bootstrap().catch(console.error)

    return () => {
      isDestroyed = true

      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
      }

      if (slider) {
        slider.destroy()
        slider = null
      }

      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: false,
          baseTexture: false,
        })
        appRef.current = null
      }

      const spaceBg = document.getElementById('spaceBgImage') as HTMLElement | null
      const earthBg = document.getElementById('earthBgImage') as HTMLElement | null
      const buttons = document.querySelector('.buttons') as HTMLElement | null

      if (spaceBg) {
        spaceBg.style.opacity = '0'
      }

      if (earthBg) {
        earthBg.style.opacity = '1'
      }

      if (buttons) {
        buttons.style.filter = ''
      }

      initializedRef.current = false
    }
  }, [containerRef, isStarted])
}