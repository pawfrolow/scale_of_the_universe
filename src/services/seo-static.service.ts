import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { resolveItemsManifest } from '@/helpers/resolveItemsManifest';
import { TItemsManifest, TItemsOverride } from '@/interfaces';

export const APP_ORIGIN = 'https://universe.pavelfrolov.com';
export const DEFAULT_LANGUAGE = 'ru';
export const COPYRIGHT_YEAR = '2026';
export const DONATE_LINK = 'https://boosty.to/pawfrolow/donate';
export const DONATE_LINKS = [
  {
    key: 'boosty',
    href: DONATE_LINK,
    label: 'Boosty',
    iconSrc: '/img/icons/boosty.svg',
  },
] as const;
export const CONTACT_EMAIL = 'paw.frolow@icloud.com';
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
  { key: 'subatomic', minSize: 0, maxSize: 1e-24 },
  { key: 'particles', minSize: 1e-24, maxSize: 1e-18 },
  { key: 'atomsMolecules', minSize: 1e-18, maxSize: 1e-12 },
  { key: 'microworld', minSize: 1e-12, maxSize: 1e-6 },
  { key: 'smallObjects', minSize: 1e-6, maxSize: 1e-3 },
  { key: 'humanScales', minSize: 1e-3, maxSize: 1e3 },
  { key: 'buildingsLandscapes', minSize: 1e3, maxSize: 1e6 },
  { key: 'planets', minSize: 1e6, maxSize: 1e9 },
  { key: 'stars', minSize: 1e9, maxSize: 1e12 },
  { key: 'solarSystem', minSize: 1e12, maxSize: 1e16 },
  { key: 'interstellar', minSize: 1e16, maxSize: 1e22 },
  { key: 'galaxiesUniverse', minSize: 1e22, maxSize: Infinity },
] as const;

const OBJECT_SCALE_GROUP_LABEL_FALLBACKS = {
  ru: {
    subatomic: 'Субатомные масштабы',
    particles: 'Частицы',
    atomsMolecules: 'Атомы и молекулы',
    microworld: 'Микромир',
    smallObjects: 'Миллиметры и сантиметры',
    humanScales: 'Человеческие масштабы',
    buildingsLandscapes: 'Здания и ландшафты',
    planets: 'Планеты',
    stars: 'Звезды',
    solarSystem: 'Околозвёздные масштабы',
    interstellar: 'Межзвездные масштабы',
    galaxiesUniverse: 'Галактики и Вселенная',
  },
  en: {
    subatomic: 'Subatomic scales',
    particles: 'Particles',
    atomsMolecules: 'Atoms and molecules',
    microworld: 'Microworld',
    smallObjects: 'Millimeters and centimeters',
    humanScales: 'Human scales',
    buildingsLandscapes: 'Buildings and landscapes',
    planets: 'Planets',
    stars: 'Stars',
    solarSystem: 'Circumstellar scales',
    interstellar: 'Interstellar scales',
    galaxiesUniverse: 'Galaxies and the Universe',
  },
} satisfies Record<'ru' | 'en', Record<(typeof OBJECT_SCALE_GROUPS)[number]['key'], string>>;

type TJsonRecord = {
  [key: string]: TJsonRecord | undefined;
};

export type TSeoObject = {
  id: string;
  slug: string;
  slugAliases: string[];
  title: string;
  description: string;
  path: string;
  url: string;
  imageSrc: string;
  sizeMeters: number;
  sizeText: string;
};

export type TObjectsSearchCopy = {
  label: string;
  placeholder: string;
  clear: string;
  empty: string;
};

export type TAboutPageCopy = {
  paragraphs: string[];
  history: {
    beforeOriginalLink: string;
    originalLinkLabel: string;
    afterLinks: string;
  };
  contact: {
    beforeEmail: string;
    afterEmail: string;
  };
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
  aboutPage: TAboutPageCopy;
  navLabels: {
    about: string;
    objects: string;
    language: string;
    donate: string;
  };
  objectPage: {
    openOnScaleAction: string;
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

export const SEO_INDEX_ROBOTS = 'index,follow,max-image-preview:large';
export const SEO_NOINDEX_ROBOTS = 'noindex,follow';

const SEO_INDEXABLE_ABOUT_LANGUAGES = new Set([DEFAULT_LANGUAGE, 'en']);
const SEO_INDEXABLE_OBJECT_LANGUAGES = new Set([DEFAULT_LANGUAGE, 'en']);

export const isSeoPageIndexable = (
  locale: Pick<TSeoLocale, 'language'>,
  page: TSeoPage,
  options: { isAlias?: boolean } = {},
) => {
  if (options.isAlias) {
    return false;
  }

  switch (page.type) {
    case 'about':
      return SEO_INDEXABLE_ABOUT_LANGUAGES.has(locale.language);
    case 'object':
      return SEO_INDEXABLE_OBJECT_LANGUAGES.has(locale.language);
    default:
      return true;
  }
};

export const getSeoRobots = (
  locale: Pick<TSeoLocale, 'language'>,
  page: TSeoPage,
  options: { isAlias?: boolean } = {},
) => (isSeoPageIndexable(locale, page, options) ? SEO_INDEX_ROBOTS : SEO_NOINDEX_ROBOTS);

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

const normalizeTextOrFallback = (value: unknown, fallback: string) =>
  normalizeText(value) || fallback;

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

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

const getFallbackObjectsSearchCopy = (language: string): TObjectsSearchCopy =>
  language === DEFAULT_LANGUAGE
    ? {
        label: 'Поиск объектов',
        placeholder: 'Название объекта',
        clear: 'Очистить',
        empty: 'Объекты не найдены.',
      }
    : {
        label: 'Search objects',
        placeholder: 'Object name',
        clear: 'Clear',
        empty: 'No objects found.',
      };

export const getObjectsSearchCopy = (locale: TSeoLocale): TObjectsSearchCopy => {
  const fallback = getFallbackObjectsSearchCopy(locale.language);
  const copy = locale.ui.html?.objectsSearch;

  return {
    label: normalizeText(copy?.label ?? fallback.label),
    placeholder: normalizeText(copy?.placeholder ?? fallback.placeholder),
    clear: normalizeText(copy?.clear ?? fallback.clear),
    empty: normalizeText(copy?.empty ?? fallback.empty),
  };
};

const getObjectPageCopy = (language: string, ui: TJsonRecord) => ({
  openOnScaleAction: normalizeText(
    ui.html?.object?.openOnScaleAction ??
      (language === DEFAULT_LANGUAGE ? 'Открыть на шкале' : 'Open on scale'),
  ),
});

const ABOUT_PAGE_FALLBACKS = {
  ru: {
    paragraphs: [
      '«Шкала масштабов Вселенной» — это интерактивная визуализация, которая помогает наглядно почувствовать размеры объектов вокруг нас: от мельчайших элементарных частиц до планет, звёзд, галактик и наблюдаемой Вселенной. Все объекты собраны на одной непрерывной шкале, поэтому их проще сравнить между собой — даже если в обычной жизни такие масштабы почти невозможно представить рядом.',
      'Размеры объектов часто указаны как приближённые или характерные значения. В некоторых случаях используется средний размер, типичный пример или удобная для сравнения величина, чтобы разные объекты могли существовать на общей шкале и оставаться понятными для восприятия.',
      'Первая версия проекта появилась в 2010 году как Flash-приложение и быстро стала популярным образовательным инструментом. Со временем идея развивалась: появились новые данные, современные веб-технологии, дополнительные локализации и более удобный формат для изучения масштаба Вселенной.',
      'Оригинальную Scale of the Universe создали Кэри Хуан и его брат Майкл Хуан. Их работа стала одним из самых узнаваемых интерактивных проектов о размерах объектов во Вселенной и вдохновила многих людей интересоваться наукой, космосом и визуализацией данных.',
    ],
    history: {
      beforeOriginalLink: 'Эта версия проекта основана на',
      originalLinkLabel: 'веб-реализации шкалы Мэтью Мартори',
      afterLinks: '. Проект постепенно обновляется и дополняется.',
    },
    contact: {
      beforeEmail: 'Если у вас есть предложения по улучшению проекта, напишите мне на',
      afterEmail: '.',
    },
  },
  en: {
    paragraphs: [
      'The Scale of the Universe is an interactive visualization that helps you get an intuitive sense of the sizes of objects around us: from the smallest elementary particles to planets, stars, galaxies, and the observable Universe. All objects are placed on one continuous scale, making it easier to compare things that are almost impossible to imagine side by side in everyday life.',
      'Object sizes are often shown as approximate or characteristic values. In some cases, an average size, a typical example, or a convenient comparison value is used so different objects can share one scale and remain easy to understand.',
      'The first version of the project appeared in 2010 as a Flash application and quickly became a popular educational tool. Over time, the idea has evolved with new data, modern web technologies, additional localizations, and a more convenient format for exploring the scale of the Universe.',
      'The original Scale of the Universe was created by Cary Huang and his brother Michael Huang. Their work became one of the most recognizable interactive projects about the sizes of objects in the Universe and inspired many people to take an interest in science, space, and data visualization.',
    ],
    history: {
      beforeOriginalLink: 'This version of the project is based on',
      originalLinkLabel: 'the web implementation of the scale by Matthew Martori',
      afterLinks: '. The project is gradually updated and expanded.',
    },
    contact: {
      beforeEmail: 'If you have ideas for improving the project, write to me at',
      afterEmail: '.',
    },
  },
} satisfies Record<'ru' | 'en', TAboutPageCopy>;

const getFallbackAboutPageCopy = (language: string) =>
  language === DEFAULT_LANGUAGE ? ABOUT_PAGE_FALLBACKS.ru : ABOUT_PAGE_FALLBACKS.en;

const getAboutPageCopy = (language: string, ui: TJsonRecord): TAboutPageCopy => {
  const fallback = getFallbackAboutPageCopy(language);
  const about = toRecord(ui.html?.about);
  const history = toRecord(about.history);
  const contact = toRecord(about.contact);
  const configuredParagraphs = Array.isArray(about.paragraphs)
    ? about.paragraphs.map((paragraph) => normalizeText(paragraph)).filter(Boolean)
    : [];

  return {
    paragraphs: configuredParagraphs.length > 0 ? configuredParagraphs : fallback.paragraphs,
    history: {
      beforeOriginalLink: normalizeTextOrFallback(
        history.beforeOriginalLink,
        fallback.history.beforeOriginalLink,
      ),
      originalLinkLabel: normalizeTextOrFallback(
        history.originalLinkLabel,
        fallback.history.originalLinkLabel,
      ),
      afterLinks: normalizeTextOrFallback(history.afterLinks, fallback.history.afterLinks),
    },
    contact: {
      beforeEmail: normalizeTextOrFallback(contact.beforeEmail, fallback.contact.beforeEmail),
      afterEmail: normalizeTextOrFallback(contact.afterEmail, fallback.contact.afterEmail),
    },
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

const normalizeObjectId = (id: string | number) => String(id).padStart(3, '0');

const createObjectSlugOverrideMap = (language: string, override: TItemsOverride | null) => {
  const slugs = new Map<string, string>();

  Object.entries(override?.slugs ?? {}).forEach(([rawId, slugValue]) => {
    const id = normalizeObjectId(rawId);
    const slug = createObjectSlug(slugValue);

    if (!slug) {
      throw new Error(`Empty object slug override for ${language}:${id}`);
    }

    slugs.set(id, slug);
  });

  return slugs;
};

const validateSeoObjectSlugs = (language: string, objects: TSeoObject[]) => {
  const primarySlugOwners = new Map<string, string>();
  const routeSlugOwners = new Map<string, string>();

  objects.forEach((object) => {
    const existingPrimaryId = primarySlugOwners.get(object.slug);

    if (existingPrimaryId) {
      throw new Error(
        `Duplicate object slug "${object.slug}" for locale ${language}: ${existingPrimaryId} and ${object.id}`,
      );
    }

    primarySlugOwners.set(object.slug, object.id);

    [object.slug, ...object.slugAliases].forEach((slug) => {
      const existingRouteId = routeSlugOwners.get(slug);

      if (existingRouteId && existingRouteId !== object.id) {
        throw new Error(
          `Duplicate object route slug "${slug}" for locale ${language}: ${existingRouteId} and ${object.id}`,
        );
      }

      routeSlugOwners.set(slug, object.id);
    });
  });
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
  const slugOverrides = createObjectSlugOverrideMap(language, override);

  const objects = Object.entries(frames)
    .map(([id, frame]) => {
      const objectText = translatedObjects[id];

      if (!frame.size || !objectText?.title || !objectText?.description) {
        return null;
      }

      const title = normalizeText(objectText.title);
      const description = normalizeText(objectText.description);
      const englishSlug = objectSlugs.get(id);

      if (!englishSlug) {
        throw new Error(`Missing English object slug for ${id}`);
      }

      const slug = slugOverrides.get(id) ?? englishSlug;
      const slugAliases = slug === englishSlug ? [] : [englishSlug];
      const path = getObjectSlugPath(language, slug);

      return {
        id,
        slug,
        slugAliases,
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

  validateSeoObjectSlugs(language, objects);

  return objects;
};

let localesCache: Promise<TSeoLocale[]> | null = null;

export const getLocales = async () => {
  if (process.env.NODE_ENV === 'development') {
    return loadLocales();
  }

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
        aboutPage: getAboutPageCopy(language, ui),
        navLabels,
        objectPage: getObjectPageCopy(language, ui),
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

export const getObjectIndexPageCopy = (locale: TSeoLocale) => {
  if (locale.language === DEFAULT_LANGUAGE) {
    return {
      heading: 'Все объекты шкалы',
      intro:
        'Каталог объектов «Шкалы масштабов Вселенной»: от элементарных частиц, атомов и клеток до планет, звёзд, галактик и наблюдаемой Вселенной. Откройте карточку объекта, чтобы посмотреть его размер и описание.',
      seoDescription:
        'Каталог объектов «Шкалы масштабов Вселенной»: размеры частиц, клеток, людей, планет, звёзд, галактик и Вселенной на одной шкале.',
    };
  }

  if (locale.language === 'en' || locale.language === 'en-GB') {
    return {
      heading: 'All scale objects',
      intro:
        'A catalog of objects from The Scale of the Universe: from elementary particles, atoms, and cells to planets, stars, galaxies, and the observable universe. Open an object card to see its size and description.',
      seoDescription:
        'Catalog of objects from The Scale of the Universe: sizes of particles, cells, humans, planets, stars, galaxies, and the universe on one scale.',
    };
  }

  return {
    heading: locale.startScreen.objectHint,
    intro: locale.metaDescription,
    seoDescription: trimToLength(`${locale.metaDescription} ${locale.startScreen.objectHint}`, 155),
  };
};

export const getAlternateLinks = (locales: TSeoLocale[], page: TSeoPage) =>
  locales
    .filter(
      (locale) =>
        isSeoPageIndexable(locale, page) &&
        (page.type !== 'object' || locale.objects.some((object) => object.id === page.id)),
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

  if (
    !isSeoPageIndexable(defaultLocale, page) ||
    (page.type === 'object' && !defaultLocale.objects.some((object) => object.id === page.id))
  ) {
    return null;
  }

  return `${APP_ORIGIN}${getLocalizedPagePath(defaultLocale, page)}`;
};

export const getObjectScaleGroup = (object: TSeoObject) =>
  OBJECT_SCALE_GROUPS.find(
    (group) => object.sizeMeters >= group.minSize && object.sizeMeters < group.maxSize,
  ) ?? OBJECT_SCALE_GROUPS.at(-1);

export const getObjectScaleGroupLabel = (
  locale: TSeoLocale,
  group: (typeof OBJECT_SCALE_GROUPS)[number],
) => {
  const fallback =
    locale.language === DEFAULT_LANGUAGE
      ? OBJECT_SCALE_GROUP_LABEL_FALLBACKS.ru[group.key]
      : OBJECT_SCALE_GROUP_LABEL_FALLBACKS.en[group.key];

  return normalizeTextOrFallback(locale.ui.html?.objectScaleGroups?.[group.key], fallback);
};

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
