import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { LANGUAGE_OPTIONS, LANGUAGE_STORAGE_KEY } from './config';

export const AVAILABLE_LANGUAGES = LANGUAGE_OPTIONS.map(({ code }) => code);
export type TLanguage = (typeof AVAILABLE_LANGUAGES)[number];

const getPublicBasePath = () => {
  const base = './';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const getStoredLanguage = (): TLanguage => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (stored && AVAILABLE_LANGUAGES.includes(stored as TLanguage)) {
    return stored as TLanguage;
  }

  return 'ru';
};

export const setStoredLanguage = (language: TLanguage) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export async function initI18n(defaultLanguage: TLanguage = 'ru') {
  if (i18next.isInitialized) {
    if (i18next.language !== defaultLanguage) {
      await i18next.changeLanguage(defaultLanguage);
    }

    return i18next;
  }

  const basePath = getPublicBasePath();

  await i18next
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: defaultLanguage,
      fallbackLng: 'ru',
      supportedLngs: AVAILABLE_LANGUAGES,
      defaultNS: 'ui',
      ns: ['objects', 'units', 'ui'],
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: `${basePath}/locales/{{lng}}/{{ns}}.json`,
      },
      react: {
        useSuspense: false,
      },
    });

  return i18next;
}

export { i18next };
