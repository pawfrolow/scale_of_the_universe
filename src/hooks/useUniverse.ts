import * as PIXI from 'pixi.js-legacy';
import { RefObject, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ScaleText } from '@/classes/scaleText';
import { Slider } from '@/classes/slider';
import { Universe } from '@/classes/universe';
import { MAX_SCALE_EXP, MIN_SCALE_EXP } from '@/config';
import { checkMobileDevice } from '@/helpers/checkMobileDevice';
import { getTextureIdsFromManifest } from '@/helpers/getTextureIdsFromManifest';
import { map } from '@/helpers/map';
import { nextFrame } from '@/helpers/nextFrame';
import { resolveItemsManifest } from '@/helpers/resolveItemsManifest';
import { resolveTextureSources } from '@/helpers/resolveTextureSources';
import { throttle } from '@/helpers/throttle';
import { validateItemsOverride } from '@/helpers/validateItemsOverride';
import { ItemModalData } from '@/interfaces';
import { universeAssetsService } from '@/services/universe/universe-assets.service';

PIXI.settings.ROUND_PIXELS = true;
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

const MOBILE_MAX_PERCENT_STEP = 0.004;
const EXTRA_RIGHT_BOOST = 0.2;

const clampScaleExp = (scaleExp: number) =>
  Math.max(MIN_SCALE_EXP, Math.min(MAX_SCALE_EXP, scaleExp));

const getScaleExpByPercent = (percent: number) => {
  const scaleRange = MAX_SCALE_EXP - MIN_SCALE_EXP;
  const normalizedLinearRange = scaleRange - EXTRA_RIGHT_BOOST;

  return clampScaleExp(
    MIN_SCALE_EXP + percent * normalizedLinearRange + Math.pow(percent, 4) * EXTRA_RIGHT_BOOST,
  );
};

interface IUseUniverseParams {
  containerRef: RefObject<HTMLDivElement | null>;
  isStarted: boolean;
  isItemModalOpen: boolean;
  onAssetsLoading: () => void;
  onAssetsReady: () => void;
  onAssetsProgress?: (progress: number) => void;
  onItemModalOpen: (data: ItemModalData) => void;
  onItemModalClose: () => void;
}

export const useUniverse = ({
  containerRef,
  isStarted,
  isItemModalOpen,
  onAssetsLoading,
  onAssetsReady,
  onAssetsProgress,
  onItemModalOpen,
  onItemModalClose,
}: IUseUniverseParams) => {
  const appRef = useRef<PIXI.Application | null>(null);
  const initializedRef = useRef(false);
  const universeRef = useRef<Universe | null>(null);
  const visualViewportHandlerRef = useRef<(() => void) | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const orientationHandlerRef = useRef<(() => void) | null>(null);
  const fullscreenHandlerRef = useRef<(() => void) | null>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (isItemModalOpen) {
      return;
    }

    universeRef.current?.unHideItems();
  }, [isItemModalOpen]);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    let app: PIXI.Application | null = null;
    let slider: Slider | null = null;
    let isDestroyed = false;

    const bootstrap = async () => {
      const frame = document.getElementById('frame') as HTMLElement | null;
      const buttons = document.getElementById('buttons') as HTMLElement | null;
      const spaceBg = document.getElementById('spaceBgImage') as HTMLElement | null;
      const earthBg = document.getElementById('earthBgImage') as HTMLElement | null;

      if (!frame || !containerRef.current || isDestroyed) {
        return;
      }

      onAssetsLoading();
      onAssetsProgress?.(0);

      const locale = i18n.language;

      const baseManifest = await universeAssetsService.getBaseManifest();
      const override = await universeAssetsService.getLocaleOverride(locale);

      const resolvedManifest = resolveItemsManifest(baseManifest, override);
      const textureIds = getTextureIdsFromManifest(resolvedManifest);
      const textureSourceMap = resolveTextureSources(resolvedManifest, locale, override);

      validateItemsOverride(baseManifest, override);

      const allHighTextures = await universeAssetsService.loadItemTextures({
        locale,
        textureIds,
        manifest: resolvedManifest,
        textureSourceMap,
        onProgress: (loaded, total) => {
          onAssetsProgress?.(Math.round((loaded / total) * 96));
        },
      });

      if (isDestroyed || !containerRef.current) {
        return;
      }

      const globalResolution = 1;

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
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);

        app = new PIXI.Application({
          width: frame.offsetWidth,
          height: frame.offsetHeight,
          backgroundColor: 0xffffff,
          backgroundAlpha: 0,
          antialias: true,
          forceCanvas: true,
          resolution: globalResolution,
        });
      }

      onAssetsProgress?.(97);
      await nextFrame();

      if (!app || isDestroyed || !containerRef.current) {
        return;
      }

      appRef.current = app;

      const w = app.screen.width;
      const h = app.screen.height;

      let universe: Universe | null = null;
      let scaleText: ScaleText | null = null;
      const isMobileDevice = checkMobileDevice();
      let lastAppliedPercent: number | null = null;

      const onHandleClicked = () => {
        universe?.onHandleClicked();
      };

      const onChange = (_x: number, percent?: number) => {
        if (isDestroyed || !universe || !scaleText || typeof percent !== 'number') {
          return;
        }

        let nextPercent = percent;

        if (isMobileDevice && lastAppliedPercent !== null) {
          const delta = percent - lastAppliedPercent;
          const limitedDelta = Math.max(
            -MOBILE_MAX_PERCENT_STEP,
            Math.min(MOBILE_MAX_PERCENT_STEP, delta),
          );

          nextPercent = lastAppliedPercent + limitedDelta;
        }

        lastAppliedPercent = nextPercent;

        const scaleExp = getScaleExpByPercent(nextPercent);

        scaleText.setColor(scaleExp);

        if (scaleExp <= 5) {
          if (spaceBg) {
            spaceBg.style.opacity = '0';
          }

          if (earthBg) {
            earthBg.style.opacity = '1';
          }

          if (buttons) {
            buttons.style.filter = '';
          }

          document.body.classList.remove('dark');
        }

        if (scaleExp > 5 && scaleExp < 7) {
          const opacity = map(scaleExp, 5, 7, 0.1, 100);
          const opacityNorm = opacity / 100;

          if (spaceBg) {
            spaceBg.style.opacity = `${opacityNorm}`;
          }

          if (earthBg) {
            earthBg.style.opacity = `${1 - opacityNorm}`;
          }

          if (buttons) {
            buttons.style.filter = `invert(${opacity}%)`;
          }

          if (opacity > 50) {
            document.body.classList.add('dark');
          } else {
            document.body.classList.remove('dark');
          }
        }

        if (scaleExp >= 7 && buttons) {
          buttons.style.filter = 'invert(100%)';
          document.body.classList.add('dark');
        }

        universe.update(scaleExp);
        scaleText.setText(`${Math.round(scaleExp * 10) / 10}`);
      };

      slider = new Slider(app, w, h, globalResolution, onChange, onHandleClicked);
      slider.init();

      universe = new Universe(0, slider, app, onItemModalOpen, onItemModalClose);
      universeRef.current = universe;
      const scaleTextX = isMobileDevice
        ? (w * 0.9 - 30) / globalResolution
        : (w * 0.9) / globalResolution;
      scaleText = new ScaleText(scaleTextX, slider.topY - 40, '0');

      app.stage.addChild(
        universe.container,
        universe.displayContainer,
        slider.container,
        scaleText.container,
      );

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(app.view as HTMLCanvasElement);

      onAssetsProgress?.(98);
      await nextFrame();

      await universe.createItems(allHighTextures, resolvedManifest, textureSourceMap);

      onAssetsProgress?.(99);
      await nextFrame();

      if (isDestroyed || !app || !slider || !universe || !scaleText || !containerRef.current) {
        return;
      }

      slider.setPercent(map(0, MIN_SCALE_EXP, MAX_SCALE_EXP, 0, 1));
      lastAppliedPercent = slider.getPercent();
      universe.prevZoom = 0;

      const performResize = () => {
        if (!app || !slider || !universe || !scaleText || isDestroyed || !containerRef.current) {
          return;
        }

        requestAnimationFrame(() => {
          if (!app || !slider || !universe || !scaleText || isDestroyed || !containerRef.current) {
            return;
          }

          const currentFrame = document.getElementById('frame') as HTMLElement | null;

          if (!currentFrame) {
            return;
          }

          const rect = containerRef.current.getBoundingClientRect();
          const width = Math.round(rect.width || currentFrame.clientWidth || window.innerWidth);
          const height = Math.round(rect.height || currentFrame.clientHeight || window.innerHeight);

          app.renderer.resize(width, height);

          const currentPercent = slider.getPercent();

          slider.resize(app.screen.width, app.screen.height, globalResolution);
          universe.resize();
          scaleText.resize((app.screen.width * 0.9) / globalResolution, slider.topY - 40);
          slider.setPercent(currentPercent);
          lastAppliedPercent = currentPercent;
        });
      };

      resizeHandlerRef.current = throttle(performResize, 100);

      orientationHandlerRef.current = () => {
        setTimeout(performResize, 50);
        setTimeout(performResize, 250);
      };

      fullscreenHandlerRef.current = () => {
        setTimeout(performResize, 50);
        setTimeout(performResize, 250);
      };

      visualViewportHandlerRef.current = throttle(() => {
        performResize();
      }, 100);

      window.addEventListener('resize', resizeHandlerRef.current);
      window.addEventListener('orientationchange', orientationHandlerRef.current);
      document.addEventListener('fullscreenchange', fullscreenHandlerRef.current);
      document.addEventListener('webkitfullscreenchange', fullscreenHandlerRef.current);
      document.addEventListener('mozfullscreenchange', fullscreenHandlerRef.current);
      document.addEventListener('MSFullscreenChange', fullscreenHandlerRef.current);

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', visualViewportHandlerRef.current);
      }

      if (!isDestroyed) {
        onAssetsProgress?.(100);
        onAssetsReady();
      }
    };

    // eslint-disable-next-line no-console
    void bootstrap().catch(console.error);

    return () => {
      isDestroyed = true;

      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
      }

      if (orientationHandlerRef.current) {
        window.removeEventListener('orientationchange', orientationHandlerRef.current);
      }

      if (fullscreenHandlerRef.current) {
        document.removeEventListener('fullscreenchange', fullscreenHandlerRef.current);
        document.removeEventListener('webkitfullscreenchange', fullscreenHandlerRef.current);
        document.removeEventListener('mozfullscreenchange', fullscreenHandlerRef.current);
        document.removeEventListener('MSFullscreenChange', fullscreenHandlerRef.current);
      }

      if (visualViewportHandlerRef.current && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', visualViewportHandlerRef.current);
      }

      if (slider) {
        slider.destroy();
        slider = null;
      }

      universeRef.current = null;

      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: false,
          baseTexture: false,
        });
        appRef.current = null;
      }

      const spaceBg = document.getElementById('spaceBgImage') as HTMLElement | null;
      const earthBg = document.getElementById('earthBgImage') as HTMLElement | null;
      const buttons = document.getElementById('buttons') as HTMLElement | null;

      if (spaceBg) {
        spaceBg.style.opacity = '0';
      }

      if (earthBg) {
        earthBg.style.opacity = '1';
      }

      if (buttons) {
        buttons.style.filter = '';
      }

      onItemModalClose();

      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, isStarted]);
};
