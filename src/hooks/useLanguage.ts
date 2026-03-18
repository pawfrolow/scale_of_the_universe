import { useEffect, useState } from 'react';

import { getStoredLanguage, initI18n, setStoredLanguage, TLanguage } from '../i18n';

export const useLanguage = () => {
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<TLanguage>(getStoredLanguage());

  useEffect(() => {
    initI18n(currentLanguage).then(() => {
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
