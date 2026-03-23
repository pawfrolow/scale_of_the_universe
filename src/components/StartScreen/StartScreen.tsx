import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.scss';

import { Version } from '@/components';
import { CREDIT_LINKS } from '@/config';
import { ymClick } from '@/helpers/ymClick';

interface IStartScreenProps {
  title: string;
  startText: string;
  isVisible: boolean;
  onStart: () => void;
}

export const StartScreen = ({ title, startText, isVisible, onStart }: IStartScreenProps) => {
  const { t } = useTranslation();

  const openLink = (link: string) => {
    ymClick('openLink', { link });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section className={styles.startScreen} aria-label={title}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{title}</h1>
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <img src="img/slider.png" alt="Slider" />
            <p>{t('html.modal.zoomHint', { ns: 'ui' })}</p>
          </div>

          <div className={styles.infoItem}>
            <img src="img/object.png" alt="Object" />
            <p>{t('html.modal.objectHint', { ns: 'ui' })}</p>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.credits}>
            <p>{t('html.credits.createdBy', { ns: 'ui' })}</p>
            <p>
              {t('html.credits.webDev', { ns: 'ui' })}{' '}
              <a
                className={styles.creditsLink}
                href={CREDIT_LINKS.webDev}
                onClick={() => openLink(CREDIT_LINKS.webDev)}
                target="_blank"
                rel="noreferrer"
              >
                github.com
              </a>
            </p>
            <p>
              {t('html.credits.copyright', { ns: 'ui' })}{' '}
              <a
                className={styles.creditsLink}
                href={CREDIT_LINKS.copyright}
                target="_blank"
                rel="noreferrer"
                onClick={() => openLink(CREDIT_LINKS.copyright)}
              >
                htwins.net
              </a>
            </p>
            <p>
              {t('html.credits.translationAndDev', { ns: 'ui' })}{' '}
              <a
                className={styles.creditsLink}
                href={CREDIT_LINKS.pawfrolow}
                target="_blank"
                rel="noreferrer"
                onClick={() => openLink(CREDIT_LINKS.pawfrolow)}
              >
                github.com
              </a>
            </p>
          </div>

          <button className={styles.startBtn} type="button" onClick={onStart}>
            <img className={styles.startBtnIcon} width="25" src="img/icons/play.svg" alt="Play" />
            <span>{startText}</span>
          </button>
        </div>
      </div>
      <Version />
    </section>
  );
};
