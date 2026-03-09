import i18next from 'i18next';

import ruObjects from './locales/ru/objects.json';
import ruUnits from './locales/ru/units.json';
import ruUi from './locales/ru/ui.json';

import enObjects from './locales/en/objects.json';
import enUnits from './locales/en/units.json';
import enUi from './locales/en/ui.json';
import { initReactI18next } from 'react-i18next';

export async function initI18n(defaultLanguage = 'ru') {
  if (i18next.isInitialized) {
    return i18next;
  }

  await i18next
  .use(initReactI18next)
  .init({
    lng: defaultLanguage,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ru: {
        objects: ruObjects,
        units: ruUnits,
        ui: ruUi,
      },
      en: {
        objects: enObjects,
        units: enUnits,
        ui: enUi,
      },
    },
  });

  return i18next;
}

export { i18next };