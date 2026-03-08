import React from 'react'

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
  if (!isVisible) {
    return null
  }

  return (
    <>
      <div className="loadingOverlay">
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
      </div>
    </>
  )
}