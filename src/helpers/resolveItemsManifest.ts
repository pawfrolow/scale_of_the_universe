import { TItemsManifest, TItemsOverride } from '../interfaces';

const normalizeId = (id: string | number) => String(id).padStart(3, '0');

export const resolveItemsManifest = (
  baseManifest: TItemsManifest,
  override: TItemsOverride | null,
): TItemsManifest => {
  const baseFrames = baseManifest.frames ?? {};
  const resultFrames = { ...baseFrames };

  if (!override) {
    return {
      ...baseManifest,
      frames: resultFrames,
    };
  }

  for (const rawId of override.remove ?? []) {
    const id = normalizeId(rawId);
    delete resultFrames[id];
  }

  for (const [rawId, frame] of Object.entries(override.replace ?? {})) {
    const id = normalizeId(rawId);
    resultFrames[id] = frame;
  }

  for (const [rawId, frame] of Object.entries(override.add ?? {})) {
    const id = normalizeId(rawId);
    resultFrames[id] = frame;
  }

  const sortedFrames = Object.fromEntries(
    Object.entries(resultFrames).sort(([a], [b]) => Number(a) - Number(b)),
  );

  return {
    ...baseManifest,
    frames: sortedFrames,
  };
};
