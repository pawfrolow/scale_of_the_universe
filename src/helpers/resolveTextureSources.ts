import { TItemsManifest, TItemsOverride, TTextureSourceMap } from '@/interfaces';

export const resolveTextureSources = (
  manifest: TItemsManifest,
  locale: string,
  override: TItemsOverride | null,
): TTextureSourceMap => {
  const frames = manifest.frames ?? {};
  const map: TTextureSourceMap = {};

  for (const id of Object.keys(frames)) {
    const hasLocaleTexture = Boolean(override?.textures?.[id]);

    map[id] = hasLocaleTexture
      ? `img/textures/overrides/${locale}/items/${id}.webp`
      : `img/textures/items/${id}.webp`;
  }

  return map;
};
