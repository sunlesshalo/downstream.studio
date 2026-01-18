'use client'

import { useEffect, useCallback } from 'react'
import { NavigationConfig, Section, ThemeConfig } from '../types'

interface NavigationControlsProps {
  config: NavigationConfig
  sections: Section[]
  activeSectionIndex: number
  theme: ThemeConfig
  onNavigate: (sectionIndex: number) => void
}

/**
 * Navigation controls for presentations
 * Supports dots, arrows, progress bar, and keyboard navigation
 */
export function NavigationControls({
  config,
  sections,
  activeSectionIndex,
  theme,
  onNavigate
}: NavigationControlsProps) {
  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!config.keyboard) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      if (activeSectionIndex < sections.length - 1) {
        onNavigate(activeSectionIndex + 1)
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (activeSectionIndex > 0) {
        onNavigate(activeSectionIndex - 1)
      }
    }
  }, [config.keyboard, activeSectionIndex, sections.length, onNavigate])

  useEffect(() => {
    if (config.keyboard) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [config.keyboard, handleKeyDown])

  if (!config.enabled) return null

  const position = config.position || 'bottom'

  return (
    <div className={`ds-nav ds-nav--${position} ds-nav--${config.style}`}>
      <style jsx>{`
        .ds-nav {
          position: fixed;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ds-nav--bottom {
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
        }

        .ds-nav--top {
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
        }

        .ds-nav--side {
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          flex-direction: column;
        }

        /* Dot style */
        .ds-nav__dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--ds-color-muted, ${theme.colors.muted});
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          padding: 0;
        }

        .ds-nav__dot:hover {
          transform: scale(1.2);
        }

        .ds-nav__dot--active {
          background: var(--ds-color-accent, ${theme.colors.accent});
        }

        /* Arrow style */
        .ds-nav--arrows {
          gap: 16px;
        }

        .ds-nav__arrow {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--ds-color-muted, ${theme.colors.muted});
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          color: var(--ds-color-background, ${theme.colors.background});
        }

        .ds-nav__arrow:hover:not(:disabled) {
          background: var(--ds-color-accent, ${theme.colors.accent});
        }

        .ds-nav__arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .ds-nav__counter {
          font-family: var(--ds-font-body, ${theme.fonts.body});
          color: var(--ds-color-text, ${theme.colors.text});
          font-size: 0.9rem;
          min-width: 60px;
          text-align: center;
        }

        /* Progress bar style */
        .ds-nav--progress-bar {
          width: 200px;
          height: 4px;
          background: var(--ds-color-muted, ${theme.colors.muted});
          border-radius: 2px;
          overflow: hidden;
        }

        .ds-nav__progress-fill {
          height: 100%;
          background: var(--ds-color-accent, ${theme.colors.accent});
          transition: width 0.3s ease-out;
        }

        /* Chapters style */
        .ds-nav--chapters {
          flex-direction: column;
          align-items: flex-start;
          background: rgba(0, 0, 0, 0.8);
          padding: 16px;
          border-radius: 8px;
        }

        .ds-nav--chapters.ds-nav--bottom,
        .ds-nav--chapters.ds-nav--top {
          transform: translateX(-50%);
        }

        .ds-nav__chapter {
          background: none;
          border: none;
          color: var(--ds-color-muted, ${theme.colors.muted});
          font-family: var(--ds-font-body, ${theme.fonts.body});
          font-size: 0.9rem;
          padding: 8px 12px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: color 0.2s;
        }

        .ds-nav__chapter:hover {
          color: var(--ds-color-text, ${theme.colors.text});
        }

        .ds-nav__chapter--active {
          color: var(--ds-color-accent, ${theme.colors.accent});
        }

        @media (max-width: 1024px) {
          .ds-nav--side {
            right: 12px;
          }

          .ds-nav__dot {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>

      {config.style === 'dots' && (
        <DotsNavigation
          sections={sections}
          activeSectionIndex={activeSectionIndex}
          onNavigate={onNavigate}
        />
      )}

      {config.style === 'arrows' && (
        <ArrowsNavigation
          sections={sections}
          activeSectionIndex={activeSectionIndex}
          onNavigate={onNavigate}
        />
      )}

      {config.style === 'progress-bar' && (
        <ProgressBarNavigation
          sections={sections}
          activeSectionIndex={activeSectionIndex}
        />
      )}

      {config.style === 'chapters' && (
        <ChaptersNavigation
          sections={sections}
          activeSectionIndex={activeSectionIndex}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}

function DotsNavigation({
  sections,
  activeSectionIndex,
  onNavigate
}: {
  sections: Section[]
  activeSectionIndex: number
  onNavigate: (index: number) => void
}) {
  return (
    <>
      {sections.map((section, index) => (
        <button
          key={section.id}
          className={`ds-nav__dot ${index === activeSectionIndex ? 'ds-nav__dot--active' : ''}`}
          onClick={() => onNavigate(index)}
          aria-label={`Go to section ${index + 1}`}
        />
      ))}
    </>
  )
}

function ArrowsNavigation({
  sections,
  activeSectionIndex,
  onNavigate
}: {
  sections: Section[]
  activeSectionIndex: number
  onNavigate: (index: number) => void
}) {
  return (
    <>
      <button
        className="ds-nav__arrow"
        onClick={() => onNavigate(activeSectionIndex - 1)}
        disabled={activeSectionIndex === 0}
        aria-label="Previous section"
      >
        ←
      </button>
      <span className="ds-nav__counter">
        {activeSectionIndex + 1} / {sections.length}
      </span>
      <button
        className="ds-nav__arrow"
        onClick={() => onNavigate(activeSectionIndex + 1)}
        disabled={activeSectionIndex === sections.length - 1}
        aria-label="Next section"
      >
        →
      </button>
    </>
  )
}

function ProgressBarNavigation({
  sections,
  activeSectionIndex
}: {
  sections: Section[]
  activeSectionIndex: number
}) {
  const progress = ((activeSectionIndex + 1) / sections.length) * 100

  return (
    <div className="ds-nav__progress-fill" style={{ width: `${progress}%` }} />
  )
}

function ChaptersNavigation({
  sections,
  activeSectionIndex,
  onNavigate
}: {
  sections: Section[]
  activeSectionIndex: number
  onNavigate: (index: number) => void
}) {
  return (
    <>
      {sections.map((section, index) => (
        <button
          key={section.id}
          className={`ds-nav__chapter ${index === activeSectionIndex ? 'ds-nav__chapter--active' : ''}`}
          onClick={() => onNavigate(index)}
        >
          {section.content.heading || `Section ${index + 1}`}
        </button>
      ))}
    </>
  )
}
