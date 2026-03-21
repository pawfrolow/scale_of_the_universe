import React from 'react';

import styles from './styles.module.scss';

interface IIconButtonProps {
  onClick: () => void;
  iconSrc: string;
  alt: string;
  ariaLabel: string;
  className?: string;
  imageClassName?: string;
  size?: 'md' | 'lg';
  round?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const IconButton = ({
  onClick,
  iconSrc,
  alt,
  ariaLabel,
  className = '',
  imageClassName = '',
  size = 'md',
  round = false,
  type = 'button',
}: IIconButtonProps) => {
  return (
    <button
      type={type}
      className={[styles.iconButton, styles[size], round ? styles.round : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <img className={imageClassName} src={iconSrc} alt={alt} />
    </button>
  );
};
