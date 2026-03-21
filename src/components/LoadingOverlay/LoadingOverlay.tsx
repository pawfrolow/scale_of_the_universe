import React from 'react';

import styles from './styles.module.scss';

import { Overlay } from '@/components';

interface ILoadingOverlayProps {
  isVisible: boolean;
  progress: number;
  title?: string;
}

export const LoadingOverlay = ({
  isVisible,
  progress,
  title = 'Загрузка текстур...',
}: ILoadingOverlayProps) => {
  return (
    <Overlay isOpen={isVisible}>
      <div className={styles.loadingCard}>
        <div className={styles.loadingTitle}>{title}</div>

        <div className={styles.loadingBar}>
          <div className={styles.loadingBarFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.loadingPercent}>{progress}%</div>
      </div>
    </Overlay>
  );
};
