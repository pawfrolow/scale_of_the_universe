import React from 'react';

import styles from './styles.module.scss';

import { Version } from '@/components';
import { CREDIT_LINKS } from '@/config';
import { ymClick } from '@/helpers/ymClick';
import { StartScreenContent } from '@/interfaces';

interface IStartScreenProps {
  content: StartScreenContent;
  isVisible: boolean;
  isStartEnabled: boolean;
  onStart: () => void;
}

export const StartScreen = ({ content, isVisible, isStartEnabled, onStart }: IStartScreenProps) => {
  const openLink = (link: string) => {
    ymClick('openLink', { link });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section className={styles.startScreen} aria-label={content.title}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{content.title}</h1>
        </div>
        <section className={styles.summaryCard}>
          {content.introParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <img src="/img/slider.png" alt="" aria-hidden="true" />
            <p>{content.zoomHint}</p>
          </div>

          <div className={styles.infoItem}>
            <img src="/img/object.png" alt="" aria-hidden="true" />
            <p>{content.objectHint}</p>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.credits}>
            <p>{content.credits.createdBy}</p>
            <p>
              {content.credits.webDev}{' '}
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
              {content.credits.copyright}{' '}
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
              {content.credits.translationAndDev}{' '}
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

          <button
            className={styles.startBtn}
            type="button"
            onClick={onStart}
            disabled={!isStartEnabled}
          >
            <img className={styles.startBtnIcon} width="25" src="/img/icons/play.svg" alt="Play" />
            <span>{isStartEnabled ? content.startText : content.startLoadingText}</span>
          </button>
        </div>
      </div>
      <Version />
    </section>
  );
};
