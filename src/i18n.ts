import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { LANGUAGE_OPTIONS, LANGUAGE_STORAGE_KEY, LEGACY_LANGUAGE_CODE_MAP } from './config';

import { getSeoLocaleData } from '@/services/seo-locale-data.service';

export const DEFAULT_LANGUAGE = 'ru';
export const AVAILABLE_LANGUAGES = LANGUAGE_OPTIONS.map(({ code }) => code);
export type TLanguage = (typeof AVAILABLE_LANGUAGES)[number];
const RTL_LANGUAGES: TLanguage[] = ['ar', 'fa', 'he'];

const normalizeLanguageCode = (language: string | null): TLanguage | null => {
  if (!language) {
    return null;
  }

  const normalizedLanguage = LEGACY_LANGUAGE_CODE_MAP[
    language as keyof typeof LEGACY_LANGUAGE_CODE_MAP
  ]
    ? LEGACY_LANGUAGE_CODE_MAP[language as keyof typeof LEGACY_LANGUAGE_CODE_MAP]
    : language;

  const matchedLanguage = AVAILABLE_LANGUAGES.find(
    (availableLanguage) => availableLanguage.toLowerCase() === normalizedLanguage.toLowerCase(),
  );

  if (matchedLanguage) {
    return matchedLanguage;
  }

  if (AVAILABLE_LANGUAGES.includes(normalizedLanguage as TLanguage)) {
    return normalizedLanguage as TLanguage;
  }

  return null;
};

export const getLanguagePathSegment = (language: TLanguage) =>
  language === DEFAULT_LANGUAGE ? '' : language.toLowerCase();

export const getLanguageUrl = (language: TLanguage) => {
  const segment = getLanguagePathSegment(language);

  return segment ? `/${segment}/` : '/';
};

export const getLanguageFromPathname = (pathname: string): TLanguage | null => {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');

  if (!normalizedPath || normalizedPath === 'index.html') {
    return DEFAULT_LANGUAGE;
  }

  const [firstSegment] = normalizedPath.split('/');

  return normalizeLanguageCode(firstSegment);
};

export const isRtlLanguage = (language: TLanguage) => RTL_LANGUAGES.includes(language);

export const getStoredLanguage = (): TLanguage => {
  const stored = normalizeLanguageCode(localStorage.getItem(LANGUAGE_STORAGE_KEY));

  if (stored) {
    if (localStorage.getItem(LANGUAGE_STORAGE_KEY) !== stored) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, stored);
    }

    return stored;
  }

  return 'ru';
};

export const getInitialLanguage = (): TLanguage =>
  getLanguageFromPathname(window.location.pathname) ?? getStoredLanguage();

export const setStoredLanguage = (language: TLanguage) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export async function initI18n(defaultLanguage: TLanguage = DEFAULT_LANGUAGE) {
  if (i18next.isInitialized) {
    if (i18next.language !== defaultLanguage) {
      await i18next.changeLanguage(defaultLanguage);
    }

    return i18next;
  }

  const seoLocaleData = getSeoLocaleData();
  const preloadedUiLanguage = normalizeLanguageCode(seoLocaleData?.language ?? null);
  const preloadedUi =
    preloadedUiLanguage === defaultLanguage && seoLocaleData?.ui ? seoLocaleData.ui : undefined;

  await i18next
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: defaultLanguage,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: AVAILABLE_LANGUAGES,
      defaultNS: 'ui',
      ns: ['objects', 'units', 'ui'],
      partialBundledLanguages: true,
      resources: preloadedUi
        ? {
            [defaultLanguage]: {
              ui: preloadedUi,
            },
          }
        : undefined,
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: `/locales/{{lng}}/{{ns}}.json`,
      },
      react: {
        useSuspense: false,
      },
    });

  return i18next;
}

export { i18next };
