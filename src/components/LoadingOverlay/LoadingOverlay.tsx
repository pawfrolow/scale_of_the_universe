import React from 'react'
import { Overlay } from '../Overlay/Overlay'

interface ILoadingOverlayProps {
  isVisible: boolean
  progress: number
  title?: string
}

export const LoadingOverlay = ({
  isVisible,
  progress,
  title = 'Загрузка текстур...',
}: ILoadingOverlayProps) => {
  return (
    <Overlay isOpen={isVisible}>
      <div className="loadingCard">
        <div className="loadingTitle">{title}</div>

        <div className="loadingBar">
          <div
            className="loadingBarFill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loadingPercent">{progress}%</div>
      </div>
    </Overlay>
  )
}