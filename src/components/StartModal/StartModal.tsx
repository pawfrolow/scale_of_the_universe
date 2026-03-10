import React from 'react'
import { useTranslation } from 'react-i18next'

interface IStartModalProps {
  title: string
  startText: string
  isLoading: boolean
  isOpen: boolean
  onStart: () => void
  onOpenLanguageModal: () => void
}

export const StartModal = ({
  title,
  startText,
  isLoading,
  isOpen,
  onStart,
  onOpenLanguageModal,
}: IStartModalProps) => {
  const { t } = useTranslation()

  return (
    <>
      <dialog className="startModal" open={isOpen}>
        <div className="modalHeader">
          <h1 className="title">{title}</h1>

          <button
            type="button"
            className="modalLangButton"
            onClick={onOpenLanguageModal}
            aria-label="Select language"
          >
            <img src="img/icons/language.svg" alt="Language" />
          </button>
        </div>

        <div className="infoRow">
          <div className="infoItem">
            <img src="img/slider.png" alt="Slider" />
            <p>{t('html.modal.zoomHint', { ns: 'ui' })}</p>
          </div>

          <div className="infoItem">
            <img src="img/object.png" alt="Object" />
            <p>{t('html.modal.objectHint', { ns: 'ui' })}</p>
          </div>
        </div>

        <div className="bottomRow">
          <div className="credits">
            <p>{t('html.credits.createdBy', { ns: 'ui' })}</p>
            <p>
              {t('html.credits.webDev', { ns: 'ui' })}{' '}
              <a
                className="creditsLink"
                href="https://github.com/matttt/scale_of_the_universe"
                target="_blank"
                rel="noreferrer"
              >
                github.com
              </a>
            </p>
            <p>
              {t('html.credits.copyright', { ns: 'ui' })}{' '}
              <a
                className="creditsLink"
                href="https://www.htwins.net/scale2/"
                target="_blank"
                rel="noreferrer"
              >
                htwins.net
              </a>
            </p>
            <p>
              {t('html.credits.translationAndDev', { ns: 'ui' })}{' '}
              <a
                className="creditsLink"
                href="https://github.com/pawfrolow/scale_of_the_universe"
                target="_blank"
                rel="noreferrer"
              >
                github.com
              </a>
            </p>
          </div>

          <button
            className="startBtn"
            type="button"
            onClick={onStart}
            disabled={isLoading}
          >
            <img className="startBtnIcon" width="25" src="img/icons/play.svg" alt="Play" />
            <span>{startText}</span>
          </button>
        </div>
      </dialog>

      <div className="backdrop" />
    </>
  )
}