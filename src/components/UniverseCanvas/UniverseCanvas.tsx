import React, { useRef } from 'react'
import { useUniverse } from '../../hooks/useUniverse'

interface IUniverseCanvasProps {
  isStarted: boolean
  onAssetsLoading: () => void
  onAssetsReady: () => void
  onAssetsProgress?: (progress: number) => void
}

export const UniverseCanvas = ({
  isStarted,
  onAssetsLoading,
  onAssetsReady,
  onAssetsProgress,
}: IUniverseCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useUniverse({
    containerRef,
    isStarted,
    onAssetsLoading,
    onAssetsReady,
    onAssetsProgress,
  })

  return <div className="universeCanvas" id="sotu" ref={containerRef} />
}