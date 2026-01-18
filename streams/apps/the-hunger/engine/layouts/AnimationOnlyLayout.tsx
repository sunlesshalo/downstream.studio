'use client'

import { ReactNode } from 'react'

interface AnimationOnlyLayoutProps {
  animation: ReactNode
  /** How to fit the animation */
  fit?: 'contain' | 'cover' | 'fill'
  className?: string
}

/**
 * Animation-only layout with no content overlay
 * Good for cinematic moments or visual breaks
 */
export function AnimationOnlyLayout({
  animation,
  fit = 'contain',
  className = ''
}: AnimationOnlyLayoutProps) {
  return (
    <div className={`ds-layout-animationonly ds-layout-animationonly--${fit} ${className}`}>
      <style jsx>{`
        .ds-layout-animationonly {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ds-color-background, #0a0a0f);
        }

        .ds-layout-animationonly__animation {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ds-layout-animationonly--contain .ds-layout-animationonly__animation canvas {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .ds-layout-animationonly--cover .ds-layout-animationonly__animation canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ds-layout-animationonly--fill .ds-layout-animationonly__animation canvas {
          width: 100%;
          height: 100%;
          object-fit: fill;
        }
      `}</style>

      <div className="ds-layout-animationonly__animation">
        {animation}
      </div>
    </div>
  )
}
