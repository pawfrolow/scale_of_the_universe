import { i18next } from '../i18n';

type TObjectText = {
  title: string;
  description: string;
};

type TSimpleUnitForms = {
  one: string;
  many: string;
};

type TUnitsData = {
  meterShort: string;
  meter: string;
  meters: string;
  centimeter: string;
  centimeters: string;
  lightyear: string;
  lightyears: string;
  scalePrefixes: string[];
};

type TUniverseLocaleData = {
  objects: Record<string, TObjectText>;
  units: TUnitsData;
  ui: Record<string, unknown>;
};

function getResource<T>(ns: string): T {
  const data = i18next.getResourceBundle(i18next.language, ns);

  if (data) {
    return data as T;
  }

  const fallback = i18next.getResourceBundle(
    String(i18next.options.fallbackLng || 'ru'),
    ns
  );

  return (fallback || {}) as T;
}

export const translationService = {
  getCurrentLanguage() {
    return i18next.language || 'ru';
  },

  async changeLanguage(language: string) {
    await i18next.changeLanguage(language);
  },

  t(key: string, options?: Record<string, unknown>) {
    return i18next.t(key, options);
  },

  getUniverseLocaleData(): TUniverseLocaleData {
    const objectsData = getResource<{ items?: Record<string, TObjectText> }>('objects');
    const unitsData = getResource<{
      units?: {
        meterShort?: string,
        meter?: string;
        meters?: string;
        centimeter?: string;
        centimeters?: string;
        lightyear?: string;
        lightyears?: string;
      };
      scalePrefixes?: string[];
    }>('units');
    const uiData = getResource<Record<string, unknown>>('ui');

    return {
      objects: objectsData.items ?? {},
      units: {
        meterShort: unitsData.units?.meterShort ?? 'м',
        meter: unitsData.units?.meter ?? 'метр',
        meters: unitsData.units?.meters ?? 'метров',
        centimeter: unitsData.units?.centimeter ?? 'сантиметр',
        centimeters: unitsData.units?.centimeters ?? 'сантиметров',
        lightyear: unitsData.units?.lightyear ?? 'световой год',
        lightyears: unitsData.units?.lightyears ?? 'световых лет',
        scalePrefixes: unitsData.scalePrefixes ?? [],
      },
      ui: uiData,
    };
  },

  getObjectText(index: number): TObjectText {
    const { objects } = this.getUniverseLocaleData();

    return objects[index] ?? {
      title: '',
      description: '',
    };
  },

  getUnits(): TUnitsData {
    return this.getUniverseLocaleData().units;
  },

  formatUnit(value: number | string, forms: TSimpleUnitForms | undefined) {
    if (!forms) {
      return String(value);
    }

    const numericValue = typeof value === 'number' ? value : Number(value);

    if (Number.isNaN(numericValue)) {
      return `${value} ${forms.many}`;
    }

    return `${value} ${Math.abs(numericValue) === 1 ? forms.one : forms.many}`;
  },

  getUi() {
    return this.getUniverseLocaleData().ui;
  },
};