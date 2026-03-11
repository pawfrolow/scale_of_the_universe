import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getStoredLanguage,
  initI18n,
  LANGUAGE_OPTIONS,
  setStoredLanguage,
  TLanguage,
} from '../i18n';
import { createFrozenStarAudio } from '../services/audio.service';
import {
  Controls,
  ItemDetailsModal,
  LanguageModal,
  LoadingOverlay,
  StartModal,
  UniverseCanvas,
} from '../components';
import { ItemModalData } from '../interfaces';

import styles from './styles.module.scss'

export const App = () => {
  const [isStarted, setIsStarted] = useState(false)
  const [hasEnteredApp, setHasEnteredApp] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isI18nReady, setIsI18nReady] = useState(false)
  const [isAssetsLoading, setIsAssetsLoading] = useState(false)
  const [isAssetsReady, setIsAssetsReady] = useState(false)
  const [assetsProgress, setAssetsProgress] = useState(0)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<TLanguage>(getStoredLanguage());
  const [universeKey, setUniverseKey] = useState(0);
  const [itemModalData, setItemModalData] = useState<ItemModalData | null>(null);

  const { t, i18n } = useTranslation();
  const audio = useMemo(() => createFrozenStarAudio(), []);

  const isLoading = !isI18nReady || isAssetsLoading;

  useEffect(() => {
    initI18n(currentLanguage).then(() => {
      setIsI18nReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isAssetsReady) {
      return;
    }

    audio.muted = isMuted;

    if (isMuted) {
      audio.pause();
    } else if (isStarted) {
      audio.play().catch(console.error);
    }
  }, [audio, isMuted, isStarted, isAssetsReady]);

  useEffect(() => {
    if (!isI18nReady) {
      return
    }

    const title = t('html.meta.ogTitle', { ns: 'ui' })
    const description = t('html.meta.description', { ns: 'ui' })
    const ogTitle = t('html.meta.ogTitle', { ns: 'ui' })
    const ogDescription = t('html.meta.ogDescription', { ns: 'ui' })

    document.title = title

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = ['he', 'ar', 'fa'].includes(currentLanguage) ? 'rtl' : 'ltr';

    const setMetaContent = (selector: string, content: string) => {
      const element = document.querySelector(selector)

      if (element) {
        element.setAttribute('content', content)
      }
    }

    setMetaContent('meta[name="description"]', description)
    setMetaContent('meta[property="og:title"]', ogTitle)
    setMetaContent('meta[property="og:description"]', ogDescription)
  }, [currentLanguage, isI18nReady, t])

  const handleStart = async () => {
    setItemModalData(null);
    setHasEnteredApp(true)
    setIsStarted(true)
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
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

  const handleLanguageSelect = async (language: TLanguage) => {
    if (language === currentLanguage) {
      setIsLanguageModalOpen(false);
      return;
    }

    setItemModalData(null);
    setCurrentLanguage(language);
    setStoredLanguage(language);
    setIsLanguageModalOpen(false);

    await i18n.changeLanguage(language);

    setIsAssetsReady(false);
    setIsAssetsLoading(false);
    setAssetsProgress(0);
    setUniverseKey(prev => prev + 1);
  };

  const handleItemModalOpen = (data: ItemModalData) => {
    setItemModalData(data);
  };

  const handleItemModalClose = () => {
    setItemModalData(null);
  };

  return (
    <>
      <StartModal
        title={t('html.modal.title', { ns: 'ui' })}
        startText={
          isLoading
            ? t('html.modal.startLoading', { ns: 'ui' })
            : t('html.modal.startButton', { ns: 'ui' })
        }
        isLoading={isLoading}
        isOpen={!hasEnteredApp}
        onStart={handleStart}
        onOpenLanguageModal={handleOpenLanguageModal}
      />

      <LanguageModal
        isOpen={isLanguageModalOpen}
        currentLanguage={currentLanguage}
        languages={LANGUAGE_OPTIONS}
        onSelect={handleLanguageSelect}
        onClose={handleCloseLanguageModal}
      />

      <LoadingOverlay
        isVisible={hasEnteredApp && isAssetsLoading}
        progress={assetsProgress}
        title={t('html.modal.startLoading', { ns: 'ui' })}
      />

      <div
        id="frame"
        className={styles.frameStyle}
        style={{ visibility: hasEnteredApp && isAssetsReady ? 'visible' : 'hidden' }}
      >
        <Controls
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenLanguageModal={handleOpenLanguageModal}
        />

        <div className={`${styles.bgEarth} ${styles.fullBg}`} id="earthBgImage" />
        <div className={`${styles.bgSpace} ${styles.fullBg}`} id="spaceBgImage" />

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
    </>
  );
};