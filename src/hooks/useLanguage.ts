import { useEffect, useState } from 'react';

import { getInitialLanguage, initI18n, setStoredLanguage, TLanguage } from '@/i18n';
import { SeoLocaleData } from '@/interfaces';

export const useLanguage = (
  initialLanguage?: TLanguage,
  initialSeoLocaleData?: SeoLocaleData | null,
) => {
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<TLanguage>(
    () => initialLanguage ?? getInitialLanguage(),
  );

  useEffect(() => {
    initI18n(currentLanguage, initialSeoLocaleData).then(() => {
      setIsI18nReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeLanguage = (language: TLanguage) => {
    setCurrentLanguage(language);
    setStoredLanguage(language);
  };

  return {
    isI18nReady,
    currentLanguage,
    setCurrentLanguage: handleChangeLanguage,
  };
};
