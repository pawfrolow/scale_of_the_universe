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
import { TLanguage } from '@/i18n';
import { ItemModalData } from '@/interfaces';
import { createFrozenStarAudio } from '@/services/audio.service';

export const App = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [isMuted, setIsMuted] = useState(!!localStorage.getItem(MUTED_STORAGE_KEY));
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [assetsProgress, setAssetsProgress] = useState(0);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [universeKey, setUniverseKey] = useState(0);
  const [itemModalData, setItemModalData] = useState<ItemModalData | null>(null);

  const { isI18nReady, currentLanguage, setCurrentLanguage } = useLanguage();

  const { t, i18n } = useTranslation();
  const audio = useMemo(() => createFrozenStarAudio(), []);

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
    document.documentElement.dir = ['he', 'ar', 'fa'].includes(currentLanguage) ? 'rtl' : 'ltr';

    const setMetaContent = (selector: string, content: string) => {
      const element = document.querySelector(selector);

      if (element) {
        element.setAttribute('content', content);
      }
    };

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', ogTitle);
    setMetaContent('meta[property="twitter:title"]', ogTitle);
    setMetaContent('meta[property="og:description"]', ogDescription);
    setMetaContent('meta[property="twitter:description"]', ogDescription);
  }, [currentLanguage, isI18nReady, t]);

  useEffect(() => {
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

    await i18n.changeLanguage(language);

    ymClick('toggleLanguage', { language, fromMainPage: !hasEnteredApp });

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

  if (!isI18nReady) {
    return <Loader />;
  }

  return (
    <>
      <div className={styles.frameStyle} id="frame">
        <div className={`${styles.bgEarth} ${styles.fullBg}`} id="earthBgImage" />
        <div className={`${styles.bgSpace} ${styles.fullBg}`} id="spaceBgImage" />

        <StartScreen
          title={t('html.modal.title', { ns: 'ui' })}
          startText={t('html.modal.startButton', { ns: 'ui' })}
          isVisible={!hasEnteredApp}
          onStart={handleStart}
        />

        <div
          className={styles.universeLayer}
          style={{ visibility: hasEnteredApp && isAssetsReady ? 'visible' : 'hidden' }}
        >
          <UniverseCanvas
            key={universeKey}
            isStarted={isStarted}
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
        </div>
      </div>

      <LanguageModal
        isOpen={isLanguageModalOpen}
        currentLanguage={currentLanguage}
        onSelect={handleLanguageSelect}
        onClose={handleCloseLanguageModal}
      />

      <DonateModal isOpen={isDonateModalOpen} onClose={handleCloseDonateModal} />

      <LoadingOverlay
        isVisible={hasEnteredApp && isAssetsLoading}
        progress={assetsProgress}
        title={t('html.modal.startLoading', { ns: 'ui' })}
      />

      <Controls
        hasEnteredApp={hasEnteredApp}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLanguageModal={handleOpenLanguageModal}
        onOpenDonateModal={handleOpenDonateModal}
      />
    </>
  );
};
