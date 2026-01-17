'use client'

import { ReactNode } from 'react'

interface CenteredLayoutProps {
  animation: ReactNode
  content: ReactNode
  /** Animation size relative to viewport (0-1), default 0.6 */
  animationSize?: number
  className?: string
}

/**
 * Centered layout with animation above, content below
 * Good for presentations and focused content
 */
export function CenteredLayout({
  animation,
  content,
  animationSize = 0.6,
  className = ''
}: CenteredLayoutProps) {
  return (
    <div className={`ds-layout-centered ${className}`}>
      <style jsx>{`
        .ds-layout-centered {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: var(--ds-color-background, #0a0a0f);
        }

        .ds-layout-centered__animation {
          width: 100%;
          max-width: ${animationSize * 100}vw;
          max-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
        }

        .ds-layout-centered__animation canvas {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .ds-layout-centered__content {
          max-width: 800px;
          text-align: center;
        }

        /* Mobile adjustments */
        @media (max-width: 1024px) {
          .ds-layout-centered {
            padding: 20px;
          }

          .ds-layout-centered__animation {
            max-height: 35vh;
            margin-bottom: 24px;
          }
        }
      `}</style>

      <div className="ds-layout-centered__animation">
        {animation}
      </div>
      <div className="ds-layout-centered__content">
        {content}
      </div>
    </div>
  )
}
