'use client'

import { ReactNode } from 'react'

interface FullBleedLayoutProps {
  animation: ReactNode
  content: ReactNode
  /** Overlay darkness (0-1), default 0.4 */
  overlayOpacity?: number
  /** Content position */
  contentPosition?: 'center' | 'bottom' | 'top'
  className?: string
}

/**
 * Full-bleed layout with animation covering the entire viewport
 * Content overlays on top with configurable positioning
 */
export function FullBleedLayout({
  animation,
  content,
  overlayOpacity = 0.4,
  contentPosition = 'center',
  className = ''
}: FullBleedLayoutProps) {
  const positionStyles = {
    center: 'align-items: center; justify-content: center;',
    bottom: 'align-items: flex-end; justify-content: center; padding-bottom: 10vh;',
    top: 'align-items: flex-start; justify-content: center; padding-top: 10vh;'
  }

  return (
    <div className={`ds-layout-fullbleed ds-layout-fullbleed--${contentPosition} ${className}`}>
      <style jsx>{`
        .ds-layout-fullbleed {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        .ds-layout-fullbleed__animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ds-layout-fullbleed__animation canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ds-layout-fullbleed__overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, ${overlayOpacity});
          pointer-events: none;
        }

        .ds-layout-fullbleed__content {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          width: 100%;
          display: flex;
          ${positionStyles[contentPosition]}
          padding: 40px;
          text-align: center;
        }

        .ds-layout-fullbleed__content-inner {
          max-width: 800px;
        }

        /* Mobile adjustments */
        @media (max-width: 1024px) {
          .ds-layout-fullbleed__content {
            padding: 20px;
          }
        }
      `}</style>

      <div className="ds-layout-fullbleed__animation">
        {animation}
      </div>
      <div className="ds-layout-fullbleed__overlay" />
      <div className="ds-layout-fullbleed__content">
        <div className="ds-layout-fullbleed__content-inner">
          {content}
        </div>
      </div>
    </div>
  )
}
