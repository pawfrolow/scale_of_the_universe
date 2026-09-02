import { getTextureIdsFromManifest } from '@/helpers/getTextureIdsFromManifest';
import { resolveItemsManifest } from '@/helpers/resolveItemsManifest';
import { resolveTextureSources } from '@/helpers/resolveTextureSources';
import type { TItemsManifest, TItemsOverride } from '@/interfaces';

const TEXTURE_PRELOAD_CONCURRENCY = 4;
const LOCALE_NAMESPACES = ['ui', 'objects', 'units'];
const preloadPromises = new Map<string, Promise<void>>();

type FetchPriority = 'high' | 'low';
type PriorityRequestInit = RequestInit & {
  priority?: FetchPriority;
};

const fetchCached = (url: string, priority: FetchPriority = 'low') =>
  fetch(url, {
    cache: 'force-cache',
    credentials: 'same-origin',
    priority,
  } satisfies PriorityRequestInit);

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetchCached(url, 'high');

  if (!response.ok) {
    throw new Error(`Failed to preload ${url}: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const fetchLocaleOverride = async (language: string): Promise<TItemsOverride | null> => {
  const response = await fetchCached(`/data/overrides/${language}/items.override.json`, 'high');

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to preload locale override for ${language}: ${response.status}`);
  }

  return response.json() as Promise<TItemsOverride>;
};

const preloadTexture = async (src: string) => {
  const response = await fetchCached(src, 'low');

  if (!response.ok) {
    throw new Error(`Failed to preload texture ${src}: ${response.status}`);
  }

  await response.blob();
};

const preloadLocaleNamespaces = async (language: string) => {
  await Promise.all(
    LOCALE_NAMESPACES.map(async (namespace) => {
      try {
        const response = await fetchCached(`/locales/${language}/${namespace}.json`, 'high');

        if (response.ok) {
          await response.blob();
        }
      } catch (error) {
        // Locale preload is opportunistic. i18next will still request the file normally.
        // eslint-disable-next-line no-console
        console.warn(error);
      }
    }),
  );
};

const preloadTextures = async (sources: string[]) => {
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < sources.length) {
      const src = sources[nextIndex];
      nextIndex += 1;

      try {
        await preloadTexture(src);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error);
      }
    }
  };

  const workerCount = Math.min(TEXTURE_PRELOAD_CONCURRENCY, sources.length);

  await Promise.all(Array.from({ length: workerCount }, worker));
};

const startTexturePreload = async (language: string) => {
  const [baseManifest, override] = await Promise.all([
    fetchJson<TItemsManifest>('/data/items.json'),
    fetchLocaleOverride(language),
    preloadLocaleNamespaces(language),
  ]).then(([manifest, localeOverride]) => [manifest, localeOverride] as const);
  const manifest = resolveItemsManifest(baseManifest, override);
  const textureIds = getTextureIdsFromManifest(manifest);
  const textureSourceMap = resolveTextureSources(manifest, language, override);
  const sources = textureIds.map((id) => textureSourceMap[id]).filter(Boolean);

  await preloadTextures(sources);
};

export const startUniverseTexturePreload = (language: string): Promise<void> => {
  const existingPromise = preloadPromises.get(language);

  if (existingPromise) {
    return existingPromise;
  }

  const preloadPromise = startTexturePreload(language).catch((error) => {
    // Texture preload is only a warm-up. Runtime loading must still work if it fails.
    // eslint-disable-next-line no-console
    console.warn(error);
  });

  preloadPromises.set(language, preloadPromise);

  return preloadPromise;
};
