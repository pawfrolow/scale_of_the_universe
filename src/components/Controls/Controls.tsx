import React from 'react';

import styles from './styles.module.scss';

import { IconButton } from '@/components';
import { isLocalhost, isProduction } from '@/config';
import { toggleFullscreen } from '@/helpers/fullscreen';

interface IControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLanguageModal: () => void;
  onOpenDonateModal: () => void;
}

export const Controls = ({
  isMuted,
  onToggleMute,
  onOpenLanguageModal,
  onOpenDonateModal,
}: IControlsProps) => {
  const handleHomeClick = () => {
    window.location.reload();
  };

  const handleFullscreenClick = () => {
    const frame = document.getElementById('frame');

    if (frame) {
      toggleFullscreen(frame);
    }
  };

  return (
    <div id="buttons" className={styles.buttons}>
      {(isLocalhost || isProduction) && (
        <IconButton
          onClick={onOpenDonateModal}
          iconSrc="img/icons/pay.svg"
          alt="Donate"
          ariaLabel="Support project"
        />
      )}

      <IconButton
        onClick={handleHomeClick}
        iconSrc="img/icons/home.svg"
        alt="Home"
        ariaLabel="Home"
      />

      <IconButton
        onClick={onOpenLanguageModal}
        iconSrc="img/icons/language.svg"
        alt="Language"
        ariaLabel="Select language"
      />

      <IconButton
        onClick={onToggleMute}
        iconSrc={isMuted ? 'img/icons/speaker_muted.svg' : 'img/icons/speaker_active.svg'}
        alt={isMuted ? 'Mute' : 'Unmute'}
        ariaLabel={isMuted ? 'Unmute' : 'Mute'}
      />

      <IconButton
        onClick={handleFullscreenClick}
        iconSrc="img/icons/fullscreen.svg"
        alt="Fullscreen"
        ariaLabel="Fullscreen"
      />
    </div>
  );
};
