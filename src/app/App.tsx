import React, { useEffect, useMemo, useState } from 'react'

import { initI18n, i18next } from '../i18n'
import { createFrozenStarAudio } from '../services/audio.service'
import { Controls, StartModal, UniverseCanvas } from '../components'
import { useTranslation } from 'react-i18next'

export const App = () => {
  const [isStarted, setIsStarted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isI18nReady, setIsI18nReady] = useState(false)
  const [isAssetsLoading, setIsAssetsLoading] = useState(false)
  const [isAssetsReady, setIsAssetsReady] = useState(false)
  const { t } = useTranslation();

  const audio = useMemo(() => createFrozenStarAudio(), [])

  const isLoading = !isI18nReady || isAssetsLoading

  useEffect(() => {
    void initI18n('ru').then(() => {
      setIsI18nReady(true)
    })
  }, [])

  useEffect(() => {
    audio.muted = isMuted

    if (isMuted) {
      audio.pause()
    } else if (isStarted) {
      void audio.play().catch(console.error)
    }
  }, [audio, isMuted, isStarted])

  const handleStart = async () => {
    setIsStarted(true)
  }

  const handleToggleMute = () => {
    setIsMuted(prev => !prev)
  }

  const handleAssetsLoading = () => {
    setIsAssetsLoading(true)
  }

  const handleAssetsReady = () => {
    setIsAssetsLoading(false)
    setIsAssetsReady(true)
  }

  return (
    <>
      <StartModal
        title={t('html.modal.title', { ns: 'ui' })}
        startText={isLoading ? t('html.modal.startLoading', { ns: 'ui' }) : t('html.modal.startButton', { ns: 'ui' })}
        isLoading={isLoading}
        onStart={handleStart}
        isOpen={!isAssetsReady}
      />
      <div
        id="frame"
        className="frameStyle"
        style={{ visibility: (isStarted && isAssetsReady) ? 'visible' : 'hidden' }}
      >
        <Controls
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        <div className="bgEarth fullBg" id="earthBgImage" />
        <div className="bgSpace fullBg" id="spaceBgImage" />

        <UniverseCanvas
          isStarted={isStarted}
          onAssetsLoading={handleAssetsLoading}
          onAssetsReady={handleAssetsReady}
        />
      </div>
    </>
  )
}