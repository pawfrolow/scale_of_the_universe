import React from 'react';

import { Overlay } from '../Overlay/Overlay';

import styles from './styles.module.scss';

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
      <div className={styles.itemDetailsDialog} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.itemDetailsHeader}>
          <h2 className={styles.itemDetailsTitle}>{title}</h2>

          <button
            type="button"
            className={styles.itemDetailsClose}
            onClick={onClose}
            aria-label="Close item details"
          >
            ×
          </button>
        </div>

        <div className={styles.itemDetailsBody}>
          <div className={styles.itemDetailsImageWrap}>
            <img className={styles.itemDetailsImage} src={imageSrc} alt={title} />
          </div>

          <div className={styles.itemDetailsSubtitle}>{subtitle}</div>

          <div className={styles.itemDetailsDescription}>{description}</div>
        </div>
      </div>
    </Overlay>
  );
};
