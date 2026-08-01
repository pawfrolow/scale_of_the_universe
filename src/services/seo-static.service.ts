import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { resolveItemsManifest } from '@/helpers/resolveItemsManifest';
import { TItemsManifest, TItemsOverride } from '@/interfaces';

export const APP_ORIGIN = 'https://universe.pavelfrolov.com';
export const DEFAULT_LANGUAGE = 'ru';
export const COPYRIGHT_YEAR = '2026';
export const DONATE_LINK = 'https://boosty.to/pawfrolow/donate';
export const CONTACT_EMAIL = 'paw.frolow@gmail.com';
export const CREDIT_LINKS = {
  webDev: 'https://github.com/matttt/scale_of_the_universe',
  copyright: 'https://www.htwins.net/scale2/',
  pawfrolow: 'https://github.com/pawfrolow/scale_of_the_universe',
};

const projectRoot = process.cwd();
const localesDir = path.join(projectRoot, 'public', 'locales');
const dataDir = path.join(projectRoot, 'public', 'data');
const itemsSourcePath = path.join(dataDir, 'items.json');
const packageSourcePath = path.join(projectRoot, 'package.json');

const RTL_LANGUAGES = new Set(['ar', 'fa', 'he']);
const OG_LOCALE_MAP: Record<string, string> = {
  ar: 'ar_AR',
  de: 'de_DE',
  en: 'en_US',
  'en-GB': 'en_GB',
  eo: 'eo_EO',
  es: 'es_ES',
  et: 'et_EE',
  fa: 'fa_IR',
  fr: 'fr_FR',
  he: 'he_IL',
  ko: 'ko_KR',
  nl: 'nl_NL',
  pl: 'pl_PL',
  pt: 'pt_PT',
  ro: 'ro_RO',
  ru: 'ru_RU',
  sv: 'sv_SE',
  tr: 'tr_TR',
  uk: 'uk_UA',
  'zh-CN': 'zh_CN',
  'zh-Hant': 'zh_TW',
};

export const OBJECT_SCALE_GROUPS = [
  { minSize: 0, maxSize: 1e-24, ruLabel: 'Субатомные масштабы', enLabel: 'Subatomic scales' },
  { minSize: 1e-24, maxSize: 1e-18, ruLabel: 'Частицы', enLabel: 'Particles' },
  { minSize: 1e-18, maxSize: 1e-12, ruLabel: 'Атомы и молекулы', enLabel: 'Atoms and molecules' },
  { minSize: 1e-12, maxSize: 1e-6, ruLabel: 'Микромир', enLabel: 'Microworld' },
  {
    minSize: 1e-6,
    maxSize: 1e-3,
    ruLabel: 'Миллиметры и сантиметры',
    enLabel: 'Millimeters and centimeters',
  },
  { minSize: 1e-3, maxSize: 1e3, ruLabel: 'Человеческие масштабы', enLabel: 'Human scales' },
  {
    minSize: 1e3,
    maxSize: 1e6,
    ruLabel: 'Здания и ландшафты',
    enLabel: 'Buildings and landscapes',
  },
  { minSize: 1e6, maxSize: 1e9, ruLabel: 'Планеты', enLabel: 'Planets' },
  { minSize: 1e9, maxSize: 1e12, ruLabel: 'Звезды', enLabel: 'Stars' },
  { minSize: 1e12, maxSize: 1e16, ruLabel: 'Солнечная система', enLabel: 'Solar system' },
  {
    minSize: 1e16,
    maxSize: 1e22,
    ruLabel: 'Межзвездные масштабы',
    enLabel: 'Interstellar scales',
  },
  {
    minSize: 1e22,
    maxSize: Infinity,
    ruLabel: 'Галактики и Вселенная',
    enLabel: 'Galaxies and the Universe',
  },
] as const;

type TJsonRecord = {
  [key: string]: TJsonRecord | undefined;
};

export type TSeoObject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  path: string;
  url: string;
  imageSrc: string;
  sizeMeters: number;
  sizeText: string;
};

export type TSeoLocale = {
  language: string;
  segment: string;
  path: string;
  objectIndexPath: string;
  aboutPath: string;
  dir: 'ltr' | 'rtl';
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  metaDescription: string;
  ogImage: string;
  appTitle: string;
  ogLocale: string;
  ui: TJsonRecord;
  units: TJsonRecord;
  objects: TSeoObject[];
  navLabels: {
    about: string;
    objects: string;
    language: string;
    donate: string;
  };
  startScreen: {
    title: string;
    startText: string;
    startLoadingText: string;
    introParagraphs: string[];
    zoomHint: string;
    objectHint: string;
    homePath: string;
    aboutPath: string;
    objectIndexPath: string;
    navLabels: TSeoLocale['navLabels'];
    credits: {
      createdBy: string;
      webDev: string;
      copyright: string;
      translationAndDev: string;
    };
  };
};

export type TSeoPage =
  | { type: 'home' }
  | { type: 'about' }
  | { type: 'objects' }
  | { type: 'object'; id: string };

export type TSeoBreadcrumbItem = {
  href: string;
  label: string;
};

const loadJson = async <T>(filePath: string): Promise<T> =>
  JSON.parse(await readFile(filePath, 'utf8')) as T;

const loadOptionalJson = async <T>(filePath: string): Promise<T | null> => {
  try {
    return await loadJson<T>(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

export const normalizeText = (value: unknown) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

const dedupeTexts = (values: string[]) => {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue || seen.has(normalizedValue)) {
      return false;
    }

    seen.add(normalizedValue);
    return true;
  });
};

export const trimToLength = (value: string, maxLength: number) => {
  const normalizedValue = normalizeText(value);

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  const targetLength = Math.max(maxLength - 3, 1);
  const trimmedValue = normalizedValue.slice(0, targetLength + 1);
  const lastSpaceIndex = trimmedValue.lastIndexOf(' ');
  const safeValue =
    lastSpaceIndex > Math.floor(targetLength * 0.6)
      ? trimmedValue.slice(0, lastSpaceIndex)
      : trimmedValue.slice(0, targetLength);

  return `${safeValue.trim().replace(/[.,;:!?-]+$/u, '')}...`;
};

export const getLanguagePathSegment = (language: string) =>
  language === DEFAULT_LANGUAGE ? '' : language.toLowerCase();

export const getLanguagePath = (language: string) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/` : '/';
};

export const getObjectIndexPath = (language: string) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/objects/` : '/objects/';
};

export const getAboutPath = (language: string) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/about/` : '/about/';
};

export const createObjectSlug = (title: string) =>
  normalizeText(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getObjectSlugPath = (language: string, slug: string) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/objects/${slug}/` : `/objects/${slug}/`;
};

export const getOgImageUrl = (language: string) =>
  `${APP_ORIGIN}/img/${language === DEFAULT_LANGUAGE ? 'ogimage.png' : 'ogimage_en.png'}`;

export const normalizeLanguageSegment = (segment: string) => segment.toLowerCase();

export const getLocaleBySegment = async (segment: string) => {
  const locales = await getLocales();
  const normalizedSegment = normalizeLanguageSegment(segment);

  return locales.find((locale) => normalizeLanguageSegment(locale.segment) === normalizedSegment);
};

const getTextureSource = (id: string, language: string, override: TItemsOverride | null) =>
  override?.textures?.[id]
    ? `/img/textures/overrides/${language}/items/${id}.webp`
    : `/img/textures/items/${id}.webp`;

const formatNumber = (language: string, value: number) =>
  new Intl.NumberFormat(language, {
    maximumFractionDigits: 6,
  }).format(value);

const formatSizeText = (
  language: string,
  size: { coeff: number; exponent: number },
  units: TJsonRecord,
) => {
  const meterShort = units.units?.meterShort ?? 'm';

  return `${formatNumber(language, size.coeff)} x 10^${size.exponent} ${meterShort}`;
};

const getFallbackNavLabels = (language: string) =>
  language === DEFAULT_LANGUAGE
    ? {
        about: 'О проекте',
        objects: 'Объекты',
        language: 'Язык',
        donate: 'Поддержать',
      }
    : {
        about: 'About',
        objects: 'Objects',
        language: 'Language',
        donate: 'Support',
      };

const getNavLabels = (language: string, ui: TJsonRecord) => {
  const fallback = getFallbackNavLabels(language);

  return {
    about: normalizeText(ui.html?.nav?.about ?? fallback.about),
    objects: normalizeText(ui.html?.nav?.objects ?? fallback.objects),
    language: normalizeText(ui.html?.nav?.language ?? fallback.language),
    donate: normalizeText(ui.html?.nav?.donate ?? ui.html?.donate?.title ?? fallback.donate),
  };
};

const createObjectSlugMap = (englishObjectTranslations: TJsonRecord) => {
  const translatedObjects = englishObjectTranslations.items ?? {};
  const slugEntries = new Map<string, string>();
  const usedSlugs = new Map<string, string>();

  Object.entries(translatedObjects).forEach(([id, objectText]) => {
    const englishTitle = normalizeText((objectText as TJsonRecord)?.title);
    const slug = createObjectSlug(englishTitle);

    if (!englishTitle) {
      throw new Error(`Missing English object title for ${id}`);
    }

    if (!slug) {
      throw new Error(`Empty object slug for ${id}: ${englishTitle}`);
    }

    const existingId = usedSlugs.get(slug);

    if (existingId) {
      throw new Error(`Duplicate object slug "${slug}" for ${existingId} and ${id}`);
    }

    usedSlugs.set(slug, id);
    slugEntries.set(id, slug);
  });

  return slugEntries;
};

const createSeoObjects = ({
  language,
  manifest,
  objectTranslations,
  objectSlugs,
  units,
  override,
}: {
  language: string;
  manifest: TItemsManifest;
  objectTranslations: TJsonRecord;
  objectSlugs: Map<string, string>;
  units: TJsonRecord;
  override: TItemsOverride | null;
}) => {
  const frames = manifest.frames ?? {};
  const translatedObjects = objectTranslations.items ?? {};

  return Object.entries(frames)
    .map(([id, frame]) => {
      const objectText = translatedObjects[id];

      if (!frame.size || !objectText?.title || !objectText?.description) {
        return null;
      }

      const title = normalizeText(objectText.title);
      const description = normalizeText(objectText.description);
      const slug = objectSlugs.get(id);

      if (!slug) {
        throw new Error(`Missing English object slug for ${id}`);
      }

      const path = getObjectSlugPath(language, slug);

      return {
        id,
        slug,
        title,
        description,
        path,
        url: `${APP_ORIGIN}${path}`,
        imageSrc: getTextureSource(id, language, override),
        sizeMeters: frame.size.coeff * 10 ** frame.size.exponent,
        sizeText: formatSizeText(language, frame.size, units),
      };
    })
    .filter(Boolean)
    .sort((left, right) => Number(left!.id) - Number(right!.id)) as TSeoObject[];
};

let localesCache: Promise<TSeoLocale[]> | null = null;

export const getLocales = async () => {
  localesCache ??= loadLocales();

  return localesCache;
};

const loadLocales = async () => {
  const baseItemsManifest = await loadJson<TItemsManifest>(itemsSourcePath);
  const englishObjectTranslations = await loadJson<TJsonRecord>(
    path.join(localesDir, 'en', 'objects.json'),
  );
  const objectSlugs = createObjectSlugMap(englishObjectTranslations);
  const entries = await readdir(localesDir, { withFileTypes: true });
  const localeDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => {
      if (left === DEFAULT_LANGUAGE) {
        return -1;
      }

      if (right === DEFAULT_LANGUAGE) {
        return 1;
      }

      return left.localeCompare(right);
    });

  return Promise.all(
    localeDirs.map(async (language) => {
      const ui = await loadJson<TJsonRecord>(path.join(localesDir, language, 'ui.json'));
      const objectTranslations = await loadJson<TJsonRecord>(
        path.join(localesDir, language, 'objects.json'),
      );
      const units = await loadJson<TJsonRecord>(path.join(localesDir, language, 'units.json'));
      const override = await loadOptionalJson<TItemsOverride>(
        path.join(dataDir, 'overrides', language, 'items.override.json'),
      );
      const manifest = resolveItemsManifest(baseItemsManifest, override);
      const appTitle = normalizeText(ui.app?.title ?? ui.html?.modal?.title ?? 'Universe Scale');
      const title = normalizeText(ui.html?.meta?.title ?? ui.html?.meta?.ogTitle ?? appTitle);
      const description = normalizeText(
        ui.html?.meta?.description ?? ui.html?.meta?.ogDescription ?? '',
      );
      const ogTitle = normalizeText(ui.html?.meta?.ogTitle ?? title);
      const ogDescription = normalizeText(ui.html?.meta?.ogDescription ?? description);
      const navLabels = getNavLabels(language, ui);
      const objects = createSeoObjects({
        language,
        manifest,
        objectTranslations,
        objectSlugs,
        units,
        override,
      });

      return {
        language,
        segment: getLanguagePathSegment(language),
        path: getLanguagePath(language),
        objectIndexPath: getObjectIndexPath(language),
        aboutPath: getAboutPath(language),
        dir: RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr',
        title,
        description,
        ogTitle,
        ogDescription,
        metaDescription: description,
        ogImage: getOgImageUrl(language),
        appTitle,
        ogLocale: OG_LOCALE_MAP[language] ?? 'en_US',
        ui,
        units,
        objects,
        navLabels,
        startScreen: {
          title: normalizeText(ui.html?.modal?.title ?? appTitle),
          startText: normalizeText(ui.html?.modal?.startButton ?? ui.app?.start ?? 'Start'),
          startLoadingText: normalizeText(ui.html?.modal?.startLoading ?? 'Loading...'),
          introParagraphs: dedupeTexts([normalizeText(ui.html?.meta?.intro ?? description)]),
          zoomHint: normalizeText(ui.html?.modal?.zoomHint ?? ui.app?.zoomHint ?? ''),
          objectHint: normalizeText(ui.html?.modal?.objectHint ?? ui.app?.objectHint ?? ''),
          homePath: getLanguagePath(language),
          aboutPath: getAboutPath(language),
          objectIndexPath: getObjectIndexPath(language),
          navLabels,
          credits: {
            createdBy: normalizeText(ui.html?.credits?.createdBy ?? ''),
            webDev: normalizeText(ui.html?.credits?.webDev ?? ''),
            copyright: normalizeText(ui.html?.credits?.copyright ?? ''),
            translationAndDev: normalizeText(ui.html?.credits?.translationAndDev ?? ''),
          },
        },
      } satisfies TSeoLocale;
    }),
  );
};

export const getLocaleData = async (language: string) => {
  const locales = await getLocales();
  return locales.find((locale) => locale.language === language) ?? null;
};

export const getObjects = async (language: string) => {
  const locale = await getLocaleData(language);
  return locale?.objects ?? [];
};

export const getObject = async (language: string, id: string) => {
  const objects = await getObjects(language);
  return objects.find((object) => object.id === id) ?? null;
};

export const getLocalizedPagePath = (locale: TSeoLocale, page: TSeoPage) => {
  switch (page.type) {
    case 'about':
      return locale.aboutPath;
    case 'object':
      return locale.objects.find((object) => object.id === page.id)?.path ?? locale.objectIndexPath;
    case 'objects':
      return locale.objectIndexPath;
    default:
      return locale.path;
  }
};

export const getAlternateLinks = (locales: TSeoLocale[], page: TSeoPage) =>
  locales
    .filter(
      (locale) => page.type !== 'object' || locale.objects.some((object) => object.id === page.id),
    )
    .map((locale) => ({
      hreflang: locale.language,
      href: `${APP_ORIGIN}${getLocalizedPagePath(locale, page)}`,
    }));

export const getXDefaultAlternate = (locales: TSeoLocale[], page: TSeoPage) => {
  const defaultLocale = locales.find((locale) => locale.language === DEFAULT_LANGUAGE);

  if (!defaultLocale) {
    return null;
  }

  if (page.type === 'object' && !defaultLocale.objects.some((object) => object.id === page.id)) {
    return null;
  }

  return `${APP_ORIGIN}${getLocalizedPagePath(defaultLocale, page)}`;
};

export const getObjectScaleGroup = (object: TSeoObject) =>
  OBJECT_SCALE_GROUPS.find(
    (group) => object.sizeMeters >= group.minSize && object.sizeMeters < group.maxSize,
  ) ?? OBJECT_SCALE_GROUPS.at(-1);

export const getObjectScaleGroupLabel = (
  language: string,
  group: (typeof OBJECT_SCALE_GROUPS)[number],
) => (language === DEFAULT_LANGUAGE ? group.ruLabel : group.enLabel);

export const buildSizeHtml = (sizeText: string) => {
  const match = sizeText.match(/^(.*?) x 10\^(-?\d+) (.*)$/u);

  if (!match) {
    return sizeText;
  }

  const [, coeff, exponent, unit] = match;

  return `${coeff} &times; 10<sup>${exponent}</sup> ${unit}`;
};

export const buildPowerOfTenRangeHtml = (
  group: (typeof OBJECT_SCALE_GROUPS)[number],
  units: TJsonRecord,
) => {
  const meterShort = units.units?.meterShort ?? 'm';

  if (group.maxSize === Infinity) {
    return `10<sup>${Math.log10(group.minSize)}</sup>+ ${meterShort}`;
  }

  if (group.minSize === 0) {
    return `&lt; 10<sup>${Math.log10(group.maxSize)}</sup> ${meterShort}`;
  }

  return `10<sup>${Math.log10(group.minSize)}</sup> - 10<sup>${Math.log10(group.maxSize)}</sup> ${meterShort}`;
};

export const buildSeoLocaleData = (locale: TSeoLocale) => ({
  language: locale.language,
  dir: locale.dir,
  ui: locale.ui,
  startScreen: locale.startScreen,
});

export const serializeJsonForHtml = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

export const getAppVersion = async () => {
  const packageJson = await loadJson<{ version?: string }>(packageSourcePath);

  return normalizeText(packageJson.version ?? '');
};

export const buildWebsiteStructuredData = (locale: TSeoLocale) => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: locale.appTitle,
    url: `${APP_ORIGIN}${locale.path}`,
    description: locale.metaDescription,
    inLanguage: locale.language,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: locale.appTitle,
    url: `${APP_ORIGIN}${locale.path}`,
    description: locale.metaDescription,
    inLanguage: locale.language,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    image: locale.ogImage,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
];

export const buildBreadcrumbStructuredData = (items: TSeoBreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: `${APP_ORIGIN}${item.href}`,
  })),
});

export const buildObjectStructuredData = (locale: TSeoLocale, object: TSeoObject) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: object.title,
  url: object.url,
  description: object.description,
  inLanguage: locale.language,
  isPartOf: {
    '@type': 'WebSite',
    name: locale.appTitle,
    url: `${APP_ORIGIN}${locale.path}`,
  },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: `${APP_ORIGIN}${object.imageSrc}`,
  },
});

export const buildObjectIndexStructuredData = (locale: TSeoLocale) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: locale.appTitle,
  url: `${APP_ORIGIN}${locale.objectIndexPath}`,
  description: locale.metaDescription,
  inLanguage: locale.language,
});

export const buildAboutStructuredData = (locale: TSeoLocale) => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `${locale.navLabels.about} | ${locale.appTitle}`,
  url: `${APP_ORIGIN}${locale.aboutPath}`,
  description: locale.metaDescription,
  inLanguage: locale.language,
  isPartOf: {
    '@type': 'WebSite',
    name: locale.appTitle,
    url: `${APP_ORIGIN}${locale.path}`,
  },
});
