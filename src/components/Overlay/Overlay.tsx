import React, { ReactNode } from 'react';

import styles from './styles.module.scss';

interface IOverlayProps {
  isOpen: boolean;
  className?: string;
  contentClassName?: string;
  onBackdropClick?: () => void;
  children: ReactNode;
}

export const Overlay = ({
  isOpen,
  className = '',
  contentClassName = '',
  onBackdropClick,
  children,
}: IOverlayProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`${styles.overlay} ${className}`.trim()}>
      <div className={styles.overlayBackdrop} onClick={onBackdropClick} aria-hidden="true" />

      <div className={`${styles.overlayContent} ${contentClassName}`.trim()}>{children}</div>
    </div>
  );
};
