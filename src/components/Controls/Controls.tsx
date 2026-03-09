import React from 'react';

import { toggleFullscreen } from '../../helpers/fullscreen';

interface IControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLanguageModal: () => void;
}

export const Controls = ({
  isMuted,
  onToggleMute,
  onOpenLanguageModal,
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
    <div className="buttons">
      <button onClick={handleHomeClick} className="lang" type="button">
        <img src="img/icons/home.svg" alt="Home" />
      </button>

      <button
        onClick={onOpenLanguageModal}
        type="button"
        aria-label="Select language"
      >
        <img src="img/icons/language.svg" alt="Language" />
      </button>

      <button
        onClick={onToggleMute}
        type="button"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <img src="img/icons/speaker_muted.svg" alt="Mute" /> : <img src="img/icons/speaker_active.svg" alt="Unmute" />}
      </button>

      <button
        onClick={handleFullscreenClick}
        type="button"
        aria-label="Fullscreen"
      >
        <img src="img/icons/fullscreen.svg" alt="Fullscreen" />
      </button>
    </div>
  );
};