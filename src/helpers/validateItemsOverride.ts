import { TItemsManifest, TItemsOverride } from '@/interfaces';

export const validateItemsOverride = (baseManifest: TItemsManifest, override: TItemsOverride) => {
  if (!override) {
    return;
  }

  const baseIds = new Set(Object.keys(baseManifest.frames ?? {}));
  const removeIds = new Set((override.remove ?? []).map((id) => String(id).padStart(3, '0')));
  const replaceIds = new Set(
    Object.keys(override.replace ?? {}).map((id) => String(id).padStart(3, '0')),
  );
  const addIds = new Set(Object.keys(override.add ?? {}).map((id) => String(id).padStart(3, '0')));

  for (const id of removeIds) {
    if (Number(id) < 30) {
      // eslint-disable-next-line no-console
      console.warn(`Cannot remove system ring id=${id}`);
    }
  }

  for (const id of replaceIds) {
    if (!baseIds.has(id)) {
      // eslint-disable-next-line no-console
      console.warn(`Cannot replace missing base item id=${id}`);
    }
  }

  for (const id of addIds) {
    if (baseIds.has(id)) {
      // eslint-disable-next-line no-console
      console.warn(`Cannot add existing id=${id}, use replace instead`);
    }
  }
};
