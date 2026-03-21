import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.scss';

import { Overlay } from '@/components';
import { DONATE_LINKS } from '@/config';
import { ymClick } from '@/helpers/ymClick';

interface IDonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal = ({ isOpen, onClose }: IDonateModalProps) => {
  const { t } = useTranslation('ui');

  const handleDonateClick = (key: string, href: string) => {
    ymClick('donateClick', { platform: key, href });
  };

  return (
    <Overlay isOpen={isOpen} onBackdropClick={onClose}>
      <div
        className={styles.donateDialog}
        role="dialog"
        aria-modal="true"
        aria-label={t('html.donate.title', { ns: 'ui' })}
      >
        <div className={styles.donateHeader}>
          <h2 className={styles.donateTitle}>{t('html.donate.title', { ns: 'ui' })}</h2>

          <button
            type="button"
            className={styles.donateClose}
            onClick={onClose}
            aria-label={t('html.donate.closeAriaLabel', { ns: 'ui' })}
          >
            ×
          </button>
        </div>

        <div className={styles.donateBody}>
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
      </div>
    </Overlay>
  );
};
