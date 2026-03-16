import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGE_OPTIONS, LANGUAGE_STORAGE_KEY } from '../config';

import ruObjects from './locales/ru/objects.json';
import ruUnits from './locales/ru/units.json';
import ruUi from './locales/ru/ui.json';

import enObjects from './locales/en/objects.json';
import enUnits from './locales/en/units.json';
import enUi from './locales/en/ui.json';

import heObjects from './locales/he/objects.json';
import heUnits from './locales/he/units.json';
import heUi from './locales/he/ui.json';

import nlObjects from './locales/nl/objects.json';
import nlUnits from './locales/nl/units.json';
import nlUi from './locales/nl/ui.json';

import enGbObjects from './locales/en-GB/objects.json';
import enGbUnits from './locales/en-GB/units.json';
import enGbUi from './locales/en-GB/ui.json';

import zhChObjects from './locales/zh-CH/objects.json';
import zhChUnits from './locales/zh-CH/units.json';
import zhChUi from './locales/zh-CH/ui.json';

import esObjects from './locales/es/objects.json';
import esUnits from './locales/es/units.json';
import esUi from './locales/es/ui.json';

import svObjects from './locales/sv/objects.json';
import svUnits from './locales/sv/units.json';
import svUi from './locales/sv/ui.json';

import plObjects from './locales/pl/objects.json';
import plUnits from './locales/pl/units.json';
import plUi from './locales/pl/ui.json';

import ptObjects from './locales/pt/objects.json';
import ptUnits from './locales/pt/units.json';
import ptUi from './locales/pt/ui.json';

import deObjects from './locales/de/objects.json';
import deUnits from './locales/de/units.json';
import deUi from './locales/de/ui.json';

import zhHantObjects from './locales/zh-Hant/objects.json';
import zhHantUnits from './locales/zh-Hant/units.json';
import zhHantUi from './locales/zh-Hant/ui.json';

import frObjects from './locales/fr/objects.json';
import frUnits from './locales/fr/units.json';
import frUi from './locales/fr/ui.json';

import eoObjects from './locales/eo/objects.json';
import eoUnits from './locales/eo/units.json';
import eoUi from './locales/eo/ui.json';

import roObjects from './locales/ro/objects.json';
import roUnits from './locales/ro/units.json';
import roUi from './locales/ro/ui.json';

import uaObjects from './locales/ua/objects.json';
import uaUnits from './locales/ua/units.json';
import uaUi from './locales/ua/ui.json';

import arObjects from './locales/ar/objects.json';
import arUnits from './locales/ar/units.json';
import arUi from './locales/ar/ui.json';

import koObjects from './locales/ko/objects.json';
import koUnits from './locales/ko/units.json';
import koUi from './locales/ko/ui.json';

import etObjects from './locales/et/objects.json';
import etUnits from './locales/et/units.json';
import etUi from './locales/et/ui.json';

import faObjects from './locales/fa/objects.json';
import faUnits from './locales/fa/units.json';
import faUi from './locales/fa/ui.json';

import trObjects from './locales/tr/objects.json';
import trUnits from './locales/tr/units.json';
import trUi from './locales/tr/ui.json';

export const AVAILABLE_LANGUAGES = LANGUAGE_OPTIONS.map(({ code }) => code);
export type TLanguage = typeof AVAILABLE_LANGUAGES[number];

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

  await i18next
    .use(initReactI18next)
    .init({
      lng: defaultLanguage,
      fallbackLng: 'ru',
      defaultNS: 'ui',
      ns: ['objects', 'units', 'ui'],
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
        he: {
          objects: heObjects,
          units: heUnits,
          ui: heUi,
        },
        nl: {
          objects: nlObjects,
          units: nlUnits,
          ui: nlUi,
        },
        'en-GB': {
          objects: enGbObjects,
          units: enGbUnits,
          ui: enGbUi,
        },
        'zh-CH': {
          objects: zhChObjects,
          units: zhChUnits,
          ui: zhChUi,
        },
        es: {
          objects: esObjects,
          units: esUnits,
          ui: esUi,
        },
        sv: {
          objects: svObjects,
          units: svUnits,
          ui: svUi,
        },
        pl: {
          objects: plObjects,
          units: plUnits,
          ui: plUi,
        },
        pt: {
          objects: ptObjects,
          units: ptUnits,
          ui: ptUi,
        },
        de: {
          objects: deObjects,
          units: deUnits,
          ui: deUi,
        },
        'zh-Hant': {
          objects: zhHantObjects,
          units: zhHantUnits,
          ui: zhHantUi,
        },
        fr: {
          objects: frObjects,
          units: frUnits,
          ui: frUi,
        },
        eo: {
          objects: eoObjects,
          units: eoUnits,
          ui: eoUi,
        },
        ro: {
          objects: roObjects,
          units: roUnits,
          ui: roUi,
        },
        ua: {
          objects: uaObjects,
          units: uaUnits,
          ui: uaUi,
        },
        ar: {
          objects: arObjects,
          units: arUnits,
          ui: arUi,
        },
        ko: {
          objects: koObjects,
          units: koUnits,
          ui: koUi,
        },
        et: {
          objects: etObjects,
          units: etUnits,
          ui: etUi,
        },
        fa: {
          objects: faObjects,
          units: faUnits,
          ui: faUi,
        },
        tr: {
          objects: trObjects,
          units: trUnits,
          ui: trUi,
        },
      },
    });

  return i18next;
}

export { i18next };