import * as PIXI from 'pixi.js-legacy';
import { Assets } from 'pixi.js-legacy';

import { nextFrame } from '../../helpers/nextFrame';
import { TItemsManifest, TItemsOverride } from '../../interfaces';
import { http } from '../http.service';
import { queryClient } from '../query-client';

import { universeQueryKeys } from './universe.query-keys';

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

const loadTextureWithCache = async (
  locale: string,
  id: string,
  src: string,
): Promise<PIXI.Texture> => {
  return queryClient.fetchQuery({
    queryKey: universeQueryKeys.texture(locale, id, src),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    queryFn: async () => {
      const loaded = await Assets.load(src);
      return loaded as PIXI.Texture;
    },
  });
};

export const universeAssetsService = {
  async getBaseManifest(): Promise<TItemsManifest> {
    return queryClient.fetchQuery({
      queryKey: universeQueryKeys.baseManifest(),
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 3,
      queryFn: async () => {
        const { data } = await http.get<TItemsManifest>('data/items.json');
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
            `data/overrides/${locale}/items.override.json`,
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
    locale,
    textureIds,
    manifest,
    textureSourceMap,
    onProgress,
  }: TLoadAssetsParams): Promise<Record<string, PIXI.Texture>> {
    const result: Record<string, PIXI.Texture> = {};
    const manifestScale = Number(manifest.meta?.scale ?? 1) || 1;

    const total = textureIds.length;
    let loadedCount = 0;

    const chunks = chunkArray(textureIds, 20);

    for (const batch of chunks) {
      const loadedBatch = await Promise.all(
        batch.map(async (id) => {
          try {
            const src = textureSourceMap[id] ?? `img/textures/items/${id}.png`;
            const texture = await loadTextureWithCache(locale, id, src);

            const baseTexture = texture.baseTexture;

            if (baseTexture.resolution !== manifestScale) {
              baseTexture.setResolution(manifestScale);
              baseTexture.update();
            }

            return { id, texture };
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn(`Failed to load texture id=${id}`, error);
            return null;
          }
        }),
      );

      for (const entry of loadedBatch) {
        loadedCount += 1;

        if (entry) {
          result[entry.id] = entry.texture;
        }

        onProgress?.(loadedCount, total);
        await nextFrame();
      }
    }

    return result;
  },
};
