import React, { useRef } from 'react'
import { ItemModalData } from '../../interfaces'
import { useUniverse } from '../../hooks/useUniverse'

interface IUniverseCanvasProps {
  isStarted: boolean
  onAssetsLoading: () => void
  onAssetsReady: () => void
  onAssetsProgress?: (progress: number) => void
  onItemModalOpen: (data: ItemModalData) => void
  onItemModalClose: () => void
}

export const UniverseCanvas = ({
  isStarted,
  onAssetsLoading,
  onAssetsReady,
  onAssetsProgress,
  onItemModalOpen,
  onItemModalClose,
}: IUniverseCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useUniverse({
    containerRef,
    isStarted,
    onAssetsLoading,
    onAssetsReady,
    onAssetsProgress,
    onItemModalOpen,
    onItemModalClose,
  })

  return <div className="universeCanvas" id="sotu" ref={containerRef} />
}