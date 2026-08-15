import React, { useRef } from 'react';

import styles from './styles.module.scss';

import { useUniverse } from '@/hooks/useUniverse';
import { ItemModalData } from '@/interfaces';

interface IUniverseCanvasProps {
  initialObjectId?: string;
  isStarted: boolean;
  isItemModalOpen: boolean;
  onAssetsLoading: () => void;
  onAssetsReady: () => void;
  onAssetsProgress?: (progress: number) => void;
  onInitialObjectFocused?: () => void;
  onItemModalOpen: (data: ItemModalData) => void;
  onItemModalClose: () => void;
}

export const UniverseCanvas = ({
  initialObjectId,
  isStarted,
  isItemModalOpen,
  onAssetsLoading,
  onAssetsReady,
  onAssetsProgress,
  onInitialObjectFocused,
  onItemModalOpen,
  onItemModalClose,
}: IUniverseCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useUniverse({
    containerRef,
    initialObjectId,
    isStarted,
    isItemModalOpen,
    onAssetsLoading,
    onAssetsReady,
    onAssetsProgress,
    onInitialObjectFocused,
    onItemModalOpen,
    onItemModalClose,
  });

  return <div className={styles.universeCanvas} id="sotu" ref={containerRef} />;
};
