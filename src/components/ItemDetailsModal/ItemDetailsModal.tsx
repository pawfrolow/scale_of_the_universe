import React from 'react'
import { Overlay } from '../Overlay/Overlay'

interface IItemDetailsModalProps {
  isOpen: boolean
  imageSrc: string
  title: string
  subtitle: string
  description: string
  onClose: () => void
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
      <div
        className="itemDetailsDialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="itemDetailsHeader">
          <h2 className="itemDetailsTitle">{title}</h2>

          <button
            type="button"
            className="itemDetailsClose"
            onClick={onClose}
            aria-label="Close item details"
          >
            ×
          </button>
        </div>

        <div className="itemDetailsBody">
          <div className="itemDetailsImageWrap">
            <img
              className="itemDetailsImage"
              src={imageSrc}
              alt={title}
            />
          </div>

          <div className="itemDetailsSubtitle">{subtitle}</div>

          <div className="itemDetailsDescription">
            {description}
          </div>
        </div>
      </div>
    </Overlay>
  )
}