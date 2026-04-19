import React, { useRef } from 'react';

import styles from './styles.module.scss';

import { useUniverse } from '@/hooks/useUniverse';
import { ItemModalData } from '@/interfaces';

interface IUniverseCanvasProps {
  isStarted: boolean;
  isItemModalOpen: boolean;
  onAssetsLoading: () => void;
  onAssetsReady: () => void;
  onAssetsProgress?: (progress: number) => void;
  onItemModalOpen: (data: ItemModalData) => void;
  onItemModalClose: () => void;
}

export const UniverseCanvas = ({
  isStarted,
  isItemModalOpen,
  onAssetsLoading,
  onAssetsReady,
  onAssetsProgress,
  onItemModalOpen,
  onItemModalClose,
}: IUniverseCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useUniverse({
    containerRef,
    isStarted,
    isItemModalOpen,
    onAssetsLoading,
    onAssetsReady,
    onAssetsProgress,
    onItemModalOpen,
    onItemModalClose,
  });

  return <div className={styles.universeCanvas} id="sotu" ref={containerRef} />;
};
