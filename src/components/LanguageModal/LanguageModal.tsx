import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.scss';

import { ModalDialog, ModalHeader, Overlay } from '@/components';
import { LANGUAGE_OPTIONS } from '@/config';
import { TLanguage } from '@/i18n';

interface ILanguageModalProps {
  isOpen: boolean;
  currentLanguage: TLanguage;
  onSelect: (language: TLanguage) => void;
  onClose: () => void;
}

export const LanguageModal = ({
  isOpen,
  currentLanguage,
  onSelect,
  onClose,
}: ILanguageModalProps) => {
  const { t } = useTranslation();

  return (
    <Overlay isOpen={isOpen} onBackdropClick={onClose}>
      <ModalDialog width="md" ariaLabel={t('html.modal.selectLanguage', { ns: 'ui' })}>
        <ModalHeader
          title={t('html.modal.selectLanguage', { ns: 'ui' })}
          onClose={onClose}
          closeAriaLabel={t('html.modal.closeLanguageModal', {
            ns: 'ui',
            defaultValue: 'Close language modal',
          })}
        />

        <div className={styles.languageList}>
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`${styles.languageOption} ${currentLanguage === language.code ? styles.active : ''}`}
              onClick={() => onSelect(language.code)}
            >
              <span className={styles.languageOptionLabel}>{language.label}</span>
              {currentLanguage === language.code && (
                <span className={styles.languageOptionCheck}>✓</span>
              )}
            </button>
          ))}
        </div>
      </ModalDialog>
    </Overlay>
  );
};
