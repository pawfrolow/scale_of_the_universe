import React from 'react';

import styles from './styles.module.scss';

import { IconButton } from '@/components';
import { isLocalhost, isProduction } from '@/config';
import { toggleFullscreen } from '@/helpers/fullscreen';
import { useFullScreen } from '@/hooks/useFullScreen';

interface IControlsProps {
  isMuted: boolean;
  hasEnteredApp: boolean;
  onToggleMute: () => void;
  onOpenLanguageModal: () => void;
  onOpenDonateModal: () => void;
}

export const Controls = ({
  isMuted,
  hasEnteredApp,
  onToggleMute,
  onOpenLanguageModal,
  onOpenDonateModal,
}: IControlsProps) => {
  const { isFullscreen } = useFullScreen();

  const handleHomeClick = () => {
    window.location.reload();
  };

  const handleFullscreenClick = () => {
    const frame = document.getElementById('root');

    if (frame) {
      toggleFullscreen(frame);
    }
  };

  return (
    <div id="buttons" className={styles.buttons}>
      {hasEnteredApp && (
        <IconButton
          onClick={handleHomeClick}
          iconSrc="img/icons/home.svg"
          alt="Home"
          ariaLabel="Home"
        />
      )}

      {(isLocalhost || isProduction) && (
        <IconButton
          onClick={onOpenDonateModal}
          iconSrc="img/icons/pay.svg"
          alt="Donate"
          ariaLabel="Support project"
        />
      )}

      <IconButton
        onClick={onOpenLanguageModal}
        iconSrc="img/icons/language.svg"
        alt="Language"
        ariaLabel="Select language"
      />

      {hasEnteredApp && (
        <IconButton
          onClick={onToggleMute}
          iconSrc={isMuted ? 'img/icons/speaker_muted.svg' : 'img/icons/speaker_active.svg'}
          alt={isMuted ? 'Mute' : 'Unmute'}
          ariaLabel={isMuted ? 'Unmute' : 'Mute'}
        />
      )}

      {hasEnteredApp && (
        <IconButton
          onClick={handleFullscreenClick}
          iconSrc={isFullscreen ? 'img/icons/fullscreen_hide.svg' : 'img/icons/fullscreen_open.svg'}
          alt={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          ariaLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        />
      )}
    </div>
  );
};
