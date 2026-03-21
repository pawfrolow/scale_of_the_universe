import React from 'react';

import styles from './styles.module.scss';

interface ICloseButtonProps {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}

export const CloseButton = ({ onClick, ariaLabel, className = '' }: ICloseButtonProps) => {
  return (
    <button
      type="button"
      className={`${styles.closeButton} ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      ×
    </button>
  );
};
