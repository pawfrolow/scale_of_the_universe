import React, { ReactNode } from 'react';

import styles from './styles.module.scss';

interface IModalDialogProps {
  children: ReactNode;
  className?: string;
  width?: 'sm' | 'md' | 'lg';
  role?: string;
  ariaModal?: boolean;
  ariaLabel?: string;
  theme?: 'light' | 'dark';
}

export const ModalDialog = ({
  children,
  className = '',
  width = 'md',
  role = 'dialog',
  ariaModal = true,
  ariaLabel,
  theme = 'light',
}: IModalDialogProps) => {
  return (
    <div
      className={[styles.modalDialog, styles[width], theme === 'dark' ? styles.dark : '', className]
        .filter(Boolean)
        .join(' ')}
      role={role}
      aria-modal={ariaModal}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};
