import * as PIXI from 'pixi.js-legacy';
import { Assets } from 'pixi.js-legacy';

import { universeQueryKeys } from './universe.query-keys';

import { nextFrame } from '@/helpers/nextFrame';
import { TItemsManifest, TItemsOverride } from '@/interfaces';
import { http } from '@/services/http.service';
import { queryClient } from '@/services/query-client';

type TLoadAssetsParams = {
  locale: string;
  textureIds: string[];
  manifest: TItemsManifest;
  textureSourceMap: Record<string, string>;
  onProgress?: (loaded: number, total: number) => void;
};

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

const textureCache = new Map<string, Promise<PIXI.Texture>>();

const loadTextureWithCache = (src: string): Promise<PIXI.Texture> => {
  const cached = textureCache.get(src);

  if (cached) {
    return cached;
  }

  const promise = Assets.load(src).then((loaded) => loaded as PIXI.Texture);
  textureCache.set(src, promise);

  return promise;
};

export const universeAssetsService = {
  async getBaseManifest(): Promise<TItemsManifest> {
    return queryClient.fetchQuery({
      queryKey: universeQueryKeys.baseManifest(),
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 3,
      queryFn: async () => {
        const { data } = await http.get<TItemsManifest>('/data/items.json');
        return data;
      },
    });
  },

  async getLocaleOverride(locale: string): Promise<TItemsOverride | null> {
    return queryClient.fetchQuery({
      queryKey: universeQueryKeys.localeOverride(locale),
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 1,
      queryFn: async () => {
        try {
          const { data } = await http.get<TItemsOverride>(
            `/data/overrides/${locale}/items.override.json`,
          );

          return data;
        } catch (error) {
          if (error?.response?.status === 404) {
            return null;
          }

          throw error;
        }
      },
    });
  },

  async loadItemTextures({
    textureIds,
    manifest,
    textureSourceMap,
    onProgress,
  }: TLoadAssetsParams): Promise<Record<string, PIXI.Texture>> {
    const result: Record<string, PIXI.Texture> = {};
    const manifestScale = Number(manifest.meta?.scale ?? 1) || 1;

    const total = textureIds.length;
    let loadedCount = 0;

    const chunks = chunkArray(textureIds, 40);

    for (const batch of chunks) {
      const loadedBatch = await Promise.allSettled(
        batch.map(async (id) => {
          const src = textureSourceMap[id] ?? `/img/textures/items/${id}.webp`;
          const texture = await loadTextureWithCache(src);

          const baseTexture = texture.baseTexture;

          if (baseTexture.resolution !== manifestScale) {
            baseTexture.setResolution(manifestScale);
            baseTexture.update();
          }

          return { id, texture };
        }),
      );

      for (const entry of loadedBatch) {
        loadedCount += 1;

        if (entry.status === 'fulfilled') {
          result[entry.value.id] = entry.value.texture;
        } else {
          // eslint-disable-next-line no-console
          console.warn('Failed to load texture', entry.reason);
        }

        onProgress?.(loadedCount, total);
      }

      await nextFrame();
    }

    return result;
  },
};
