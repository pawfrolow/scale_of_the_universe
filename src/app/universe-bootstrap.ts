import type { UniverseAppProps } from './App';
import { startUniverseTexturePreload } from './universe-texture-preload';

import type { SeoLocaleData } from '@/interfaces';

const ROOT_ID = 'universe-runtime-root';
const SEO_LOCALE_DATA_ID = 'seo-locale-data';
const START_SELECTOR = '[data-universe-start]';
const LOADING_TEXT_SELECTOR = '[data-universe-start-text]';
const BOOTSTRAP_STATE_VERSION = 2;

type RuntimeModule = typeof import('./universe-runtime-loader');

interface BootstrapState {
  abortController: AbortController | null;
  isDomReadyQueued: boolean;
  isMounted: boolean;
  runtimePromise: Promise<RuntimeModule> | null;
  version: number;
}

type BootstrapWindow = Window & {
  __sotuUniverseBootstrapState?: BootstrapState;
};

const getBootstrapState = (): BootstrapState => {
  const bootstrapWindow = window as BootstrapWindow;

  if (bootstrapWindow.__sotuUniverseBootstrapState?.version !== BOOTSTRAP_STATE_VERSION) {
    bootstrapWindow.__sotuUniverseBootstrapState?.abortController?.abort();
    bootstrapWindow.__sotuUniverseBootstrapState = {
      abortController: null,
      isDomReadyQueued: false,
      isMounted: false,
      runtimePromise: null,
      version: BOOTSTRAP_STATE_VERSION,
    };
  }

  return bootstrapWindow.__sotuUniverseBootstrapState;
};

const readSeoLocaleData = (): SeoLocaleData | null => {
  const element = document.getElementById(SEO_LOCALE_DATA_ID);

  if (!element?.textContent) {
    return null;
  }

  try {
    return JSON.parse(element.textContent) as SeoLocaleData;
  } catch {
    return null;
  }
};

const loadRuntime = () => {
  const state = getBootstrapState();

  state.runtimePromise ??= import('./universe-runtime-loader');

  return state.runtimePromise;
};

const getRoot = () => document.getElementById(ROOT_ID);

const getInitialLanguage = (root: HTMLElement | null) => {
  if (!root?.dataset.initialLanguage) {
    return undefined;
  }

  return root.dataset.initialLanguage as UniverseAppProps['initialLanguage'];
};

const setButtonLoading = (button: HTMLButtonElement, isLoading: boolean) => {
  const label = button.querySelector(LOADING_TEXT_SELECTOR);
  const startText = button.dataset.startText ?? '';
  const loadingText = button.dataset.loadingText ?? startText;

  button.disabled = isLoading;
  button.toggleAttribute('aria-busy', isLoading);

  if (label) {
    label.textContent = isLoading ? loadingText : startText;
  }
};

const getStartButton = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest(START_SELECTOR) as HTMLButtonElement | null;
};

const startTexturePreload = () => {
  const initialLanguage = getInitialLanguage(getRoot());

  if (!initialLanguage) {
    return;
  }

  void startUniverseTexturePreload(initialLanguage);
};

const mountRuntime = async (button: HTMLButtonElement) => {
  const state = getBootstrapState();

  if (state.isMounted) {
    return;
  }

  const root = getRoot();
  const initialLanguage = getInitialLanguage(root);

  if (!root) {
    return;
  }

  if (initialLanguage) {
    void startUniverseTexturePreload(initialLanguage);
  }

  setButtonLoading(button, true);

  try {
    const runtimeLoader = await loadRuntime();
    const seoLocaleData = readSeoLocaleData();

    const runtime = await runtimeLoader.loadUniverseRuntime();

    runtime.mountUniverseRuntime(root, {
      autoStart: true,
      initialLanguage,
      seoLocaleData,
    });
    state.isMounted = true;
  } catch (error) {
    state.isMounted = false;
    state.runtimePromise = null;
    setButtonLoading(button, false);
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const setupUniverseBootstrap = () => {
  const state = getBootstrapState();

  state.isDomReadyQueued = false;
  state.abortController?.abort();
  state.abortController = new AbortController();

  document.addEventListener(
    'click',
    (event) => {
      const button = getStartButton(event.target);

      if (!button) {
        return;
      }

      void mountRuntime(button);
    },
    { signal: state.abortController.signal },
  );

  document.addEventListener(
    'pointerover',
    (event) => {
      if (getStartButton(event.target)) {
        startTexturePreload();
      }
    },
    { signal: state.abortController.signal },
  );

  document.addEventListener(
    'focusin',
    (event) => {
      if (getStartButton(event.target)) {
        startTexturePreload();
      }
    },
    { signal: state.abortController.signal },
  );

  startTexturePreload();
};

export const initUniverseBootstrap = () => {
  const state = getBootstrapState();

  if (document.readyState === 'loading') {
    if (!state.isDomReadyQueued) {
      state.isDomReadyQueued = true;
      document.addEventListener('DOMContentLoaded', setupUniverseBootstrap, { once: true });
    }

    return;
  }

  setupUniverseBootstrap();
};
