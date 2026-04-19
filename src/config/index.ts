export const MIN_SCALE_EXP = -35;
export const MAX_SCALE_EXP = 27;

export const MAX_COMMON_TEXTURES = 329;

export const LANGUAGE_STORAGE_KEY = 'sotu_language';
export const MUTED_STORAGE_KEY = 'sotu_muted';

export const LEGACY_LANGUAGE_CODE_MAP = {
  ua: 'uk',
  'zh-CH': 'zh-CN',
} as const;

export const LANGUAGE_OPTIONS = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'he', label: 'עברית' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'zh-CN', label: '中文(简体)' },
  { code: 'es', label: 'Español' },
  { code: 'sv', label: 'Svenska' },
  { code: 'pl', label: 'Polski' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh-Hant', label: '中文(繁體)' },
  { code: 'fr', label: 'Français' },
  { code: 'eo', label: 'Esperanto' },
  { code: 'ro', label: 'Romanian' },
  { code: 'uk', label: 'Українська' },
  { code: 'ar', label: 'العربية' },
  { code: 'ko', label: '한국어' },
  { code: 'et', label: 'Eesti' },
  { code: 'fa', label: 'فارسی' },
  { code: 'tr', label: 'Türkçe' },
];

export const APP_HOST = 'universe.pavelfrolov.com';

export const isLocalhost = window.location.hostname === 'localhost';

export const isProduction = window.location.host === 'universe.pavelfrolov.com';

export const CREDIT_LINKS = {
  webDev: 'https://github.com/matttt/scale_of_the_universe',
  copyright: 'https://www.htwins.net/scale2/',
  pawfrolow: 'https://github.com/pawfrolow/scale_of_the_universe',
};

export const DONATE_LINKS = [
  {
    key: 'boosty',
    href: 'https://boosty.to/pawfrolow/donate',
    label: 'Boosty',
    iconSrc: '/img/icons/boosty.svg',
  },
];
