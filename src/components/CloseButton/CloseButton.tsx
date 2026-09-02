import React from 'react';

import styles from './styles.module.scss';

interface ICloseButtonProps {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
  theme?: 'light' | 'dark';
}

export const CloseButton = ({
  onClick,
  ariaLabel,
  className = '',
  theme = 'light',
}: ICloseButtonProps) => {
  return (
    <button
      type="button"
      className={[styles.closeButton, theme === 'dark' ? styles.dark : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      ×
    </button>
  );
};
