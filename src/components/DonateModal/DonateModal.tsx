import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.scss';

import { ModalDialog, ModalHeader, Overlay } from '@/components';
import { DONATE_LINKS } from '@/config';
import { ymClick } from '@/helpers/ymClick';

interface IDonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const DonateModal = ({ isOpen, onClose, theme = 'light' }: IDonateModalProps) => {
  const { t } = useTranslation('ui');

  const handleDonateClick = (key: string, href: string) => {
    ymClick('donateClick', { platform: key, href });
  };

  return (
    <Overlay isOpen={isOpen} onBackdropClick={onClose} theme={theme}>
      <ModalDialog width="md" ariaLabel={t('html.donate.title', { ns: 'ui' })} theme={theme}>
        <ModalHeader
          title={t('html.donate.title', { ns: 'ui' })}
          onClose={onClose}
          closeAriaLabel={t('html.donate.closeAriaLabel', { ns: 'ui' })}
          theme={theme}
        />

        <div
          className={[styles.donateBody, theme === 'dark' ? styles.dark : '']
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.donateDescription}>
            {t('html.donate.description', { ns: 'ui' })}
          </div>

          <div className={styles.donateLinks}>
            {DONATE_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={styles.donateLink}
                aria-label={link.label}
                title={link.label}
                onClick={() => handleDonateClick(link.key, link.href)}
              >
                <img src={link.iconSrc} alt={link.label} className={styles.donateLinkIcon} />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </ModalDialog>
    </Overlay>
  );
};
