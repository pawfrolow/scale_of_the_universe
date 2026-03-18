import { TItemsManifest } from '../interfaces';

export const getTextureIdsFromManifest = (manifest: TItemsManifest): string[] => {
  return Object.keys(manifest.frames ?? {}).sort((a, b) => Number(a) - Number(b));
};
