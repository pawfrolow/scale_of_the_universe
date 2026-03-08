import React, { ReactNode } from 'react'

interface IOverlayProps {
  isOpen: boolean
  className?: string
  contentClassName?: string
  onBackdropClick?: () => void
  children: ReactNode
}

export const Overlay = ({
  isOpen,
  className = '',
  contentClassName = '',
  onBackdropClick,
  children,
}: IOverlayProps) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className={`overlay ${className}`.trim()}>
      <div
        className="overlayBackdrop"
        onClick={onBackdropClick}
        aria-hidden="true"
      />

      <div className={`overlayContent ${contentClassName}`.trim()}>
        {children}
      </div>
    </div>
  )
}