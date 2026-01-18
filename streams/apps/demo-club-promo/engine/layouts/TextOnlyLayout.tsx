'use client'

import { ReactNode } from 'react'

interface TextOnlyLayoutProps {
  content: ReactNode
  /** Max width of content */
  maxWidth?: string
  /** Horizontal alignment */
  align?: 'left' | 'center' | 'right'
  className?: string
}

/**
 * Text-only layout with no animation
 * Good for intro text, credits, or text-heavy sections
 */
export function TextOnlyLayout({
  content,
  maxWidth = '800px',
  align = 'center',
  className = ''
}: TextOnlyLayoutProps) {
  const alignStyles = {
    left: 'align-items: flex-start; text-align: left;',
    center: 'align-items: center; text-align: center;',
    right: 'align-items: flex-end; text-align: right;'
  }

  return (
    <div className={`ds-layout-textonly ds-layout-textonly--${align} ${className}`}>
      <style jsx>{`
        .ds-layout-textonly {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          ${alignStyles[align]}
          padding: 60px 40px;
          background: var(--ds-color-background, #0a0a0f);
        }

        .ds-layout-textonly__content {
          max-width: ${maxWidth};
          width: 100%;
        }

        /* Mobile adjustments */
        @media (max-width: 1024px) {
          .ds-layout-textonly {
            padding: 40px 20px;
          }
        }
      `}</style>

      <div className="ds-layout-textonly__content">
        {content}
      </div>
    </div>
  )
}
