import React from 'react'
import { useTranslation } from 'react-i18next'

import { TLanguage } from '../../i18n'
import { Overlay } from '../Overlay/Overlay'

interface ILanguageOption {
  code: TLanguage
  label: string
}

interface ILanguageModalProps {
  isOpen: boolean
  currentLanguage: TLanguage
  languages: ILanguageOption[]
  onSelect: (language: TLanguage) => void
  onClose: () => void
}

export const LanguageModal = ({
  isOpen,
  currentLanguage,
  languages,
  onSelect,
  onClose,
}: ILanguageModalProps) => {
  const { t } = useTranslation()

  return (
    <Overlay isOpen={isOpen} onBackdropClick={onClose}>
      <div className="languageDialog">
        <div className="languageDialogHeader">
          <h2>{t('html.modal.selectLanguage', { ns: 'ui' })}</h2>

          <button
            type="button"
            className="languageDialogClose"
            onClick={onClose}
            aria-label="Close language modal"
          >
            ×
          </button>
        </div>

        <div className="languageList">
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`languageOption ${currentLanguage === language.code ? 'active' : ''}`}
              onClick={() => onSelect(language.code)}
            >
              <span>{language.label}</span>
              {currentLanguage === language.code && <span>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </Overlay>
  )
}