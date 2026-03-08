import React, { useRef } from 'react'
import { useUniverse } from '../../hooks/useUniverse'

interface IUniverseCanvasProps {
  isStarted: boolean
  onAssetsLoading: () => void
  onAssetsReady: () => void
}

export const UniverseCanvas = ({
  isStarted,
  onAssetsLoading,
  onAssetsReady,
}: IUniverseCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useUniverse({
    containerRef,
    isStarted,
    onAssetsLoading,
    onAssetsReady,
  })

  return <div id="sotu" ref={containerRef} />
}