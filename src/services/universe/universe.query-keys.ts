export const universeQueryKeys = {
  baseManifest: () => ['universe', 'baseManifest'] as const,
  localeOverride: (locale: string) => ['universe', 'localeOverride', locale] as const,
  texture: (locale: string, id: string, src: string) =>
    ['universe', 'texture', locale, id, src] as const,
};
