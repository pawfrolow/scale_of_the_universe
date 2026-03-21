import React from 'react';

import styles from './styles.module.scss';

import { ModalDialog, ModalHeader, Overlay } from '@/components';

interface IItemDetailsModalProps {
  isOpen: boolean;
  imageSrc: string;
  title: string;
  subtitle: string;
  description: string;
  onClose: () => void;
}

export const ItemDetailsModal = ({
  isOpen,
  imageSrc,
  title,
  subtitle,
  description,
  onClose,
}: IItemDetailsModalProps) => {
  return (
    <Overlay isOpen={isOpen} onBackdropClick={onClose}>
      <ModalDialog width="lg" ariaLabel={title}>
        <ModalHeader
          title={title}
          onClose={onClose}
          closeAriaLabel="Close item details"
          align="start"
          titleClassName={styles.itemDetailsTitle}
        />

        <div className={styles.itemDetailsBody}>
          <div className={styles.itemDetailsImageWrap}>
            <img className={styles.itemDetailsImage} src={imageSrc} alt={title} />
          </div>

          <div className={styles.itemDetailsSubtitle}>{subtitle}</div>

          <div className={styles.itemDetailsDescription}>{description}</div>
        </div>
      </ModalDialog>
    </Overlay>
  );
};
