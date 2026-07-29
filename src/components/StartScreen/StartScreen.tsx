import React, { useCallback, useEffect, useState } from 'react';

import styles from './styles.module.scss';

import { DONATE_LINKS } from '@/config';
import { ymClick } from '@/helpers/ymClick';
import { StartScreenContent } from '@/interfaces';

interface IStartScreenProps {
  content: StartScreenContent;
  isVisible: boolean;
  isStartEnabled: boolean;
  onOpenLanguageModal: () => void;
  onStart: () => void;
}

export const StartScreen = ({
  content,
  isVisible,
  isStartEnabled,
  onOpenLanguageModal,
  onStart,
}: IStartScreenProps) => {
  const [isNavSidebarOpen, setIsNavSidebarOpen] = useState(false);
  const navSidebarId = 'start-screen-nav-sidebar';

  const openLink = (link: string) => {
    ymClick('openLink', { link });
  };

  const closeNavSidebar = useCallback(() => {
    setIsNavSidebarOpen(false);
  }, []);

  const handleLanguageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    closeNavSidebar();
    onOpenLanguageModal();
  };

  useEffect(() => {
    if (!isNavSidebarOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNavSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeNavSidebar, isNavSidebarOpen]);

  if (!isVisible) {
    return null;
  }

  return (
    <section className={styles.startScreen} aria-label={content.title}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brandLink} href={content.homePath}>
            <img
              className={styles.brandIcon}
              src="/img/favicon/favicon.svg"
              width="24"
              height="24"
              alt=""
              aria-hidden="true"
            />
            <span>{content.title}</span>
          </a>

          <nav className={styles.nav} aria-label="Primary">
            <a href={content.aboutPath}>{content.navLabels.about}</a>
            <a href={content.objectIndexPath}>{content.navLabels.objects}</a>
            <a href={`${content.homePath}#language`} onClick={handleLanguageClick}>
              {content.navLabels.language}
            </a>
            <a
              href={DONATE_LINKS[0].href}
              onClick={() => openLink(DONATE_LINKS[0].href)}
              target="_blank"
              rel="noreferrer"
            >
              {content.navLabels.donate}
            </a>
          </nav>

          <button
            className={styles.menuButton}
            type="button"
            aria-label="Open menu"
            aria-controls={navSidebarId}
            aria-expanded={isNavSidebarOpen}
            onClick={() => setIsNavSidebarOpen(true)}
          >
            <img src="/img/icons/menu.svg" width="20" height="20" alt="" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        className={`${styles.navSidebarOverlay} ${isNavSidebarOpen ? styles.navSidebarOverlayOpen : ''}`}
        aria-hidden={!isNavSidebarOpen}
      >
        <button
          className={styles.navSidebarBackdrop}
          type="button"
          aria-label="Close menu"
          tabIndex={isNavSidebarOpen ? 0 : -1}
          onClick={closeNavSidebar}
        />

        <aside id={navSidebarId} className={styles.navSidebar} aria-label="Primary">
          <button
            className={styles.navSidebarClose}
            type="button"
            aria-label="Close menu"
            tabIndex={isNavSidebarOpen ? 0 : -1}
            onClick={closeNavSidebar}
          >
            <span aria-hidden="true">×</span>
          </button>

          <nav className={styles.navSidebarLinks}>
            <a
              href={content.aboutPath}
              tabIndex={isNavSidebarOpen ? 0 : -1}
              onClick={closeNavSidebar}
            >
              {content.navLabels.about}
            </a>
            <a
              href={content.objectIndexPath}
              tabIndex={isNavSidebarOpen ? 0 : -1}
              onClick={closeNavSidebar}
            >
              {content.navLabels.objects}
            </a>
            <a
              href={`${content.homePath}#language`}
              tabIndex={isNavSidebarOpen ? 0 : -1}
              onClick={handleLanguageClick}
            >
              {content.navLabels.language}
            </a>
            <a
              href={DONATE_LINKS[0].href}
              tabIndex={isNavSidebarOpen ? 0 : -1}
              onClick={() => {
                closeNavSidebar();
                openLink(DONATE_LINKS[0].href);
              }}
              target="_blank"
              rel="noreferrer"
            >
              {content.navLabels.donate}
            </a>
          </nav>
        </aside>
      </div>

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

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <nav className={styles.footerLinks} aria-label="Footer">
            <a href={content.aboutPath}>{content.navLabels.about}</a>
            <a href={content.objectIndexPath}>{content.navLabels.objects}</a>
          </nav>

          <div className={styles.footerMeta}>
            <span>v{__APP_VERSION__}</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </section>
  );
};
