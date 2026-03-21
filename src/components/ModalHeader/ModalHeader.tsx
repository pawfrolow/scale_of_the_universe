import React, { ReactNode } from 'react';

import styles from './styles.module.scss';

import { CloseButton } from '@/components';

interface IModalHeaderProps {
  title: ReactNode;
  onClose: () => void;
  closeAriaLabel: string;
  className?: string;
  titleClassName?: string;
  align?: 'center' | 'start';
  headingLevel?: 'h1' | 'h2';
}

export const ModalHeader = ({
  title,
  onClose,
  closeAriaLabel,
  className = '',
  titleClassName = '',
  align = 'center',
  headingLevel = 'h2',
}: IModalHeaderProps) => {
  const HeadingTag = headingLevel;

  return (
    <div
      className={[styles.modalHeader, align === 'start' ? styles.start : styles.center, className]
        .filter(Boolean)
        .join(' ')}
    >
      <HeadingTag className={[styles.modalTitle, titleClassName].filter(Boolean).join(' ')}>
        {title}
      </HeadingTag>

      <CloseButton onClick={onClose} ariaLabel={closeAriaLabel} />
    </div>
  );
};
