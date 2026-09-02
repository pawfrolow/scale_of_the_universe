import { SeoLocaleData } from '@/interfaces';

const SEO_LOCALE_DATA_ID = 'seo-locale-data';

let cachedSeoLocaleData: SeoLocaleData | null | undefined;

export const getSeoLocaleData = (): SeoLocaleData | null => {
  if (cachedSeoLocaleData !== undefined) {
    return cachedSeoLocaleData;
  }

  if (typeof document === 'undefined') {
    cachedSeoLocaleData = null;
    return cachedSeoLocaleData;
  }

  const element = document.getElementById(SEO_LOCALE_DATA_ID);

  if (!element?.textContent) {
    cachedSeoLocaleData = null;
    return cachedSeoLocaleData;
  }

  try {
    cachedSeoLocaleData = JSON.parse(element.textContent) as SeoLocaleData;
  } catch {
    cachedSeoLocaleData = null;
  }

  return cachedSeoLocaleData;
};
