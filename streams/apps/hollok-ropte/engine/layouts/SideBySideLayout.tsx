'use client'

import { ReactNode } from 'react'

interface SideBySideLayoutProps {
  animation: ReactNode
  content: ReactNode
  reverse?: boolean
  className?: string
}

/**
 * Side-by-side layout with animation on one side, content on the other
 * Default: animation left (60%), content right (40%)
 * Reverse: content left (40%), animation right (60%)
 */
export function SideBySideLayout({
  animation,
  content,
  reverse = false,
  className = ''
}: SideBySideLayoutProps) {
  return (
    <div className={`ds-layout-sidebyside ${reverse ? 'ds-layout-sidebyside--reverse' : ''} ${className}`}>
      <style jsx>{`
        .ds-layout-sidebyside {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        .ds-layout-sidebyside__animation {
          position: sticky;
          top: 0;
          width: 60%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ds-color-background, #0a0a0f);
        }

        .ds-layout-sidebyside__content {
          width: 40%;
          min-height: 100vh;
          padding: 60px 40px;
          background: var(--ds-color-background, #0a0a0f);
        }

        .ds-layout-sidebyside--reverse .ds-layout-sidebyside__animation {
          order: 2;
        }

        .ds-layout-sidebyside--reverse .ds-layout-sidebyside__content {
          order: 1;
        }

        /* Mobile: Stack vertically */
        @media (max-width: 1024px) {
          .ds-layout-sidebyside {
            flex-direction: column;
          }

          .ds-layout-sidebyside__animation {
            width: 100%;
            height: 40vh;
            position: sticky;
            top: 0;
            z-index: 1;
          }

          .ds-layout-sidebyside__content {
            width: 100%;
            padding: 40px 20px;
            position: relative;
            z-index: 2;
          }

          .ds-layout-sidebyside--reverse .ds-layout-sidebyside__animation,
          .ds-layout-sidebyside--reverse .ds-layout-sidebyside__content {
            order: unset;
          }
        }
      `}</style>

      <div className="ds-layout-sidebyside__animation">
        {animation}
      </div>
      <div className="ds-layout-sidebyside__content">
        {content}
      </div>
    </div>
  )
}
