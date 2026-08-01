import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.scss';

import {
  Controls,
  DonateModal,
  ItemDetailsModal,
  LanguageModal,
  Loader,
  LoadingOverlay,
  StartScreen,
  UniverseCanvas,
} from '@/components';
import { MUTED_STORAGE_KEY } from '@/config';
import { ymClick } from '@/helpers/ymClick';
import { useLanguage } from '@/hooks/useLanguage';
import { getLanguageUrl, isRtlLanguage, TLanguage } from '@/i18n';
import { ItemModalData, StartScreenContent } from '@/interfaces';
import { createFrozenStarAudio } from '@/services/audio.service';
import { getSeoLocaleData } from '@/services/seo-locale-data.service';

export interface UniverseAppProps {
  autoStart?: boolean;
  initialLanguage?: TLanguage;
  seoLocaleData?: ReturnType<typeof getSeoLocaleData>;
}

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

const getLocalizedSubPath = (language: TLanguage, subPath: string) => {
  const languageUrl = getLanguageUrl(language);

  return languageUrl === '/' ? `/${subPath}/` : `${languageUrl}${subPath}/`;
};

const getNavLabels = (language: TLanguage, t: ReturnType<typeof useTranslation>['t']) => ({
  about: t('html.nav.about', {
    ns: 'ui',
    defaultValue: language === 'ru' ? 'О проекте' : 'About',
  }),
  objects: t('html.nav.objects', {
    ns: 'ui',
    defaultValue: language === 'ru' ? 'Объекты' : 'Objects',
  }),
  language: t('html.nav.language', {
    ns: 'ui',
    defaultValue: language === 'ru' ? 'Язык' : 'Language',
  }),
  donate: t('html.nav.donate', {
    ns: 'ui',
    defaultValue: language === 'ru' ? 'Поддержать' : 'Support',
  }),
});

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

export const App = ({
  autoStart = false,
  initialLanguage,
  seoLocaleData: initialSeoLocaleData,
}: UniverseAppProps = {}) => {
  const [isStarted, setIsStarted] = useState(autoStart);
  const [hasEnteredApp, setHasEnteredApp] = useState(autoStart);
  const [isMuted, setIsMuted] = useState(() =>
    typeof localStorage === 'undefined' ? false : !!localStorage.getItem(MUTED_STORAGE_KEY),
  );
  const [isAssetsLoading, setIsAssetsLoading] = useState(autoStart);
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [assetsProgress, setAssetsProgress] = useState(0);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [universeKey, setUniverseKey] = useState(0);
  const [itemModalData, setItemModalData] = useState<ItemModalData | null>(null);

  const { isI18nReady, currentLanguage, setCurrentLanguage } = useLanguage(
    initialLanguage,
    initialSeoLocaleData,
  );

  const { t, i18n } = useTranslation();
  const audio = useMemo(() => createFrozenStarAudio(), []);
  const seoLocaleData = initialSeoLocaleData ?? getSeoLocaleData();
  const startScreenContent =
    seoLocaleData?.startScreen ??
    (isI18nReady
      ? ({
          title: t('html.modal.title', { ns: 'ui' }),
          startText: t('html.modal.startButton', { ns: 'ui' }),
          startLoadingText: t('html.modal.startLoading', { ns: 'ui' }),
          introParagraphs: dedupeTexts([
            t('html.meta.intro', {
              ns: 'ui',
              defaultValue: t('html.meta.description', { ns: 'ui' }),
            }),
          ]),
          zoomHint: t('html.modal.zoomHint', { ns: 'ui' }),
          objectHint: t('html.modal.objectHint', { ns: 'ui' }),
          homePath: getLanguageUrl(currentLanguage),
          aboutPath: getLocalizedSubPath(currentLanguage, 'about'),
          objectIndexPath: getLocalizedSubPath(currentLanguage, 'objects'),
          navLabels: getNavLabels(currentLanguage, t),
          credits: {
            createdBy: t('html.credits.createdBy', { ns: 'ui' }),
            webDev: t('html.credits.webDev', { ns: 'ui' }),
            copyright: t('html.credits.copyright', { ns: 'ui' }),
            translationAndDev: t('html.credits.translationAndDev', { ns: 'ui' }),
          },
        } satisfies StartScreenContent)
      : null);
  const loadingTitle =
    startScreenContent?.startLoadingText ??
    (isI18nReady ? t('html.modal.startLoading', { ns: 'ui' }) : 'Загрузка...');

  useEffect(() => {
    if (!isAssetsReady) {
      return;
    }

    audio.muted = isMuted;

    if (isMuted) {
      audio.pause();
    } else if (isStarted) {
      // eslint-disable-next-line no-console
      audio.play().catch(console.error);
    }
  }, [audio, isMuted, isStarted, isAssetsReady]);

  useEffect(() => {
    if (!isI18nReady) {
      return;
    }

    const title = t('html.meta.ogTitle', { ns: 'ui' });
    const description = t('html.meta.description', { ns: 'ui' });
    const ogTitle = t('html.meta.ogTitle', { ns: 'ui' });
    const ogDescription = t('html.meta.ogDescription', { ns: 'ui' });

    document.title = title;

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRtlLanguage(currentLanguage) ? 'rtl' : 'ltr';

    const setMetaContent = (selector: string, content: string) => {
      const element = document.querySelector(selector);

      if (element) {
        element.setAttribute('content', content);
      }
    };

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', ogTitle);
    setMetaContent('meta[name="twitter:title"]', ogTitle);
    setMetaContent('meta[property="og:description"]', ogDescription);
    setMetaContent('meta[name="twitter:description"]', ogDescription);
  }, [currentLanguage, isI18nReady, t]);

  useEffect(() => {
    if (!startScreenContent) {
      return;
    }

    document.querySelector('[data-seo-static="true"]')?.remove();
  }, [startScreenContent]);

  useEffect(() => {
    if (autoStart && isI18nReady) {
      ymClick('startBtn');
    }
  }, [autoStart, isI18nReady]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') {
      return;
    }

    if (isMuted) {
      localStorage.setItem(MUTED_STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(MUTED_STORAGE_KEY);
    }
  }, [isMuted]);

  useEffect(() => {
    if ([25, 50, 75, 100].includes(assetsProgress)) {
      ymClick('assetsProgress', { progress: assetsProgress });
    }
  }, [assetsProgress]);

  const handleStart = async () => {
    if (!isI18nReady) {
      return;
    }

    setItemModalData(null);
    setHasEnteredApp(true);
    setIsStarted(true);

    ymClick('startBtn');
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);

    ymClick('toggleSound', { muted: !isMuted });
  };

  const handleAssetsLoading = () => {
    setIsAssetsLoading(true);
    setAssetsProgress(0);
  };

  const handleAssetsReady = () => {
    setIsAssetsLoading(false);
    setIsAssetsReady(true);
    setAssetsProgress(100);
  };

  const handleAssetsProgress = (progress: number) => {
    setAssetsProgress(progress);
  };

  const handleOpenLanguageModal = () => {
    setIsLanguageModalOpen(true);
  };

  const handleCloseLanguageModal = () => {
    setIsLanguageModalOpen(false);
  };

  const handleOpenDonateModal = () => {
    setIsDonateModalOpen(true);
    ymClick('openDonateModal');
  };

  const handleCloseDonateModal = () => {
    setIsDonateModalOpen(false);
  };

  const handleLanguageSelect = async (language: TLanguage) => {
    if (language === currentLanguage) {
      setIsLanguageModalOpen(false);
      return;
    }

    setItemModalData(null);
    setCurrentLanguage(language);
    setIsLanguageModalOpen(false);
    ymClick('toggleLanguage', { language, fromMainPage: !hasEnteredApp });

    const nextUrl = getLanguageUrl(language);

    if (window.location.pathname !== nextUrl) {
      window.location.assign(nextUrl);
      return;
    }

    await i18n.changeLanguage(language);

    setIsAssetsReady(false);
    setIsAssetsLoading(false);
    setAssetsProgress(0);
    setUniverseKey((prev) => prev + 1);
  };

  const handleItemModalOpen = (data: ItemModalData) => {
    setItemModalData(data);
  };

  const handleItemModalClose = () => {
    setItemModalData(null);
  };

  if (!startScreenContent && !isI18nReady) {
    return <Loader />;
  }

  return (
    <>
      <div className={styles.frameStyle} id="frame">
        <div className={`${styles.bgEarth} ${styles.fullBg}`} id="earthBgImage" />
        <div className={`${styles.bgSpace} ${styles.fullBg}`} id="spaceBgImage" />

        {startScreenContent ? (
          <StartScreen
            content={startScreenContent}
            isVisible={!hasEnteredApp}
            isStartEnabled={isI18nReady}
            onOpenLanguageModal={handleOpenLanguageModal}
            onStart={handleStart}
          />
        ) : null}

        <div
          className={styles.universeLayer}
          style={{ visibility: hasEnteredApp ? 'visible' : 'hidden' }}
        >
          {isI18nReady ? (
            <>
              <UniverseCanvas
                key={universeKey}
                isStarted={isStarted}
                isItemModalOpen={Boolean(itemModalData)}
                onAssetsLoading={handleAssetsLoading}
                onAssetsReady={handleAssetsReady}
                onAssetsProgress={handleAssetsProgress}
                onItemModalOpen={handleItemModalOpen}
                onItemModalClose={handleItemModalClose}
              />

              <ItemDetailsModal
                isOpen={Boolean(itemModalData)}
                imageSrc={itemModalData?.imageSrc ?? ''}
                title={itemModalData?.title ?? ''}
                subtitle={itemModalData?.subtitle ?? ''}
                description={itemModalData?.description ?? ''}
                onClose={handleItemModalClose}
              />
            </>
          ) : null}
        </div>

        <LoadingOverlay
          isVisible={hasEnteredApp && (isAssetsLoading || !isAssetsReady)}
          progress={assetsProgress}
          title={loadingTitle}
        />

        {isI18nReady ? (
          <>
            <LanguageModal
              isOpen={isLanguageModalOpen}
              currentLanguage={currentLanguage}
              onSelect={handleLanguageSelect}
              onClose={handleCloseLanguageModal}
            />

            <DonateModal isOpen={isDonateModalOpen} onClose={handleCloseDonateModal} />

            {hasEnteredApp ? (
              <Controls
                hasEnteredApp={hasEnteredApp}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                onOpenLanguageModal={handleOpenLanguageModal}
                onOpenDonateModal={handleOpenDonateModal}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
};
