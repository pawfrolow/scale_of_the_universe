import React from 'react'
import { useTranslation } from 'react-i18next'

import { TLanguage } from '../../i18n'
import { Overlay } from '../Overlay/Overlay'

import styles from './styles.module.scss'
import { LANGUAGE_OPTIONS } from '../../config'

interface ILanguageModalProps {
  isOpen: boolean
  currentLanguage: TLanguage
  onSelect: (language: TLanguage) => void
  onClose: () => void
}

export const LanguageModal = ({
  isOpen,
  currentLanguage,
  onSelect,
  onClose,
}: ILanguageModalProps) => {
  const { t } = useTranslation()

  return (
    <Overlay isOpen={isOpen} onBackdropClick={onClose}>
      <div
        className={styles.languageDialog}
        role="dialog"
        aria-modal="true"
        aria-label={t('html.modal.selectLanguage', { ns: 'ui' })}
      >
        <div className={styles.languageDialogHeader}>
          <h2>{t('html.modal.selectLanguage', { ns: 'ui' })}</h2>

          <button
            type="button"
            className={styles.languageDialogClose}
            onClick={onClose}
            aria-label="Close language modal"
          >
            ×
          </button>
        </div>

        <div className={styles.languageList}>
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`${styles.languageOption} ${currentLanguage === language.code ? styles.active : ''}`}
              onClick={() => onSelect(language.code)}
            >
              <span className={styles.languageOptionLabel}>{language.label}</span>
              {currentLanguage === language.code && <span className={styles.languageOptionCheck}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </Overlay>
  )
}