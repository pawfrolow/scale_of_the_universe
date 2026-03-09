import React from 'react'

import { toggleFullscreen } from '../../helpers/fullscreen'

interface IControlsProps {
  isMuted: boolean
  onToggleMute: () => void
}

export const Controls = ({ isMuted, onToggleMute }: IControlsProps) => {
  const handleHomeClick = () => {
    window.location.reload()
  }

  const handleFullscreenClick = () => {
    const frame = document.getElementById('frame')

    if (frame) {
      toggleFullscreen(frame)
    }
  }

  return (
    <div className="buttons">
      <button onClick={handleHomeClick} className="lang" type="button">
        <img src="img/icons/home.svg" alt="Home" />
      </button>

      <button
        className={`speaker ${isMuted ? 'mute' : ''}`}
        onClick={onToggleMute}
        type="button"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <span />
      </button>

      <button
        className="fullscreen"
        onClick={handleFullscreenClick}
        type="button"
        aria-label="Fullscreen"
      >
        <img src="img/icons/fullscreen.svg" alt="Fullscreen" />
      </button>
    </div>
  )
}