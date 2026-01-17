'use client'

import { useCallback, useEffect, useState } from 'react'
import { StreamConfig } from '../types'
import { useFrameLoader } from '../hooks/useFrameLoader'
import { useSectionObserver } from '../hooks/useSectionObserver'
import { useScrollSync } from '../hooks/useScrollSync'
import { CanvasRenderer } from './CanvasRenderer'
import { ContentRenderer } from './ContentRenderer'
import { NavigationControls } from './NavigationControls'

interface StreamEngineProps {
  config: StreamConfig
}

interface DebugInfo {
  scrollY: number
  viewportHeight: number
  documentHeight: number
  sectionTops: { id: string; top: number; height: number }[]
}

/**
 * Main StreamEngine component
 * Architecture: Single fixed animation + scrollable sections
 */
export function StreamEngine({ config }: StreamEngineProps) {
  const { segments, sections, theme, navigation } = config

  // Layout config with defaults
  const layout = {
    breakpoint: theme.layout?.breakpoint ?? '768px',
    desktopAnimationWidth: theme.layout?.desktopAnimationWidth ?? 55,
    mobileAnimationHeight: theme.layout?.mobileAnimationHeight ?? '45vh',
    contentMaxWidth: theme.layout?.contentMaxWidth ?? '540px',
    desktopSectionPadding: theme.layout?.desktopSectionPadding ?? '60px 48px',
    mobileSectionPadding: theme.layout?.mobileSectionPadding ?? '32px 24px',
    animationFit: theme.layout?.animationFit ?? 'cover',
    edgeFade: theme.layout?.edgeFade ?? true,
    edgeFadeWidth: theme.layout?.edgeFadeWidth ?? 80,
  }

  // Reset scroll position on mount (streams always start from beginning)
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  // Track desktop vs mobile for centering offset
  const [isDesktop, setIsDesktop] = useState(true)

  // Debug mode - enabled via ?debug=true URL param
  const [debugMode, setDebugMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    scrollY: 0,
    viewportHeight: 0,
    documentHeight: 0,
    sectionTops: []
  })

  // Check for debug mode on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setDebugMode(params.get('debug') === 'true')
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${layout.breakpoint})`)
    setIsDesktop(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [layout.breakpoint])

  // Calculate centering offset for desktop (shift image to center in visible area)
  // On desktop with edge fade, visible center is offset from container center
  const centerOffsetX = isDesktop && layout.edgeFade ? layout.edgeFadeWidth / 2 : 0

  // Load all frames
  const { isLoaded, isFullyLoaded, progress, getFrame, totalFrames } = useFrameLoader({
    segments,
    basePath: '/frames'
  })

  // Preload first frame via link tag (like Capsules)
  useEffect(() => {
    if (segments.length === 0) return

    const firstSegment = segments[0]
    const firstFrameSrc = `/frames/${firstSegment.id}/frame_0001.webp`

    // Check if preload link already exists
    const existingLink = document.querySelector(`link[href="${firstFrameSrc}"]`)
    if (existingLink) return

    // Create preload link
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = firstFrameSrc
    link.as = 'image'
    link.type = 'image/webp'
    document.head.appendChild(link)

    return () => {
      // Cleanup on unmount
      if (link.parentNode) {
        link.parentNode.removeChild(link)
      }
    }
  }, [segments])

  // Observe which section is in view
  const { activeSection, setSectionRef, sectionRefs } = useSectionObserver({
    sections,
    threshold: 0.3
  })

  // Sync scroll to frame
  const { currentSegmentId, currentFrameNumber, globalFrameNumber, getSectionScrollHeight, pixelsPerFrame } = useScrollSync({
    segments,
    sections,
    activeSection,
    sectionRefs
  })

  // Track scroll position and section info for debug mode
  useEffect(() => {
    if (!debugMode) return

    const updateDebugInfo = () => {
      const sectionTops: DebugInfo['sectionTops'] = []
      sectionRefs.forEach((el, id) => {
        const rect = el.getBoundingClientRect()
        sectionTops.push({
          id,
          top: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height)
        })
      })
      sectionTops.sort((a, b) => a.top - b.top)

      setDebugInfo({
        scrollY: Math.round(window.scrollY),
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        sectionTops
      })
    }

    updateDebugInfo()
    window.addEventListener('scroll', updateDebugInfo, { passive: true })
    window.addEventListener('resize', updateDebugInfo)

    return () => {
      window.removeEventListener('scroll', updateDebugInfo)
      window.removeEventListener('resize', updateDebugInfo)
    }
  }, [debugMode, sectionRefs])

  // Navigate to section (for presentations)
  const handleNavigate = useCallback((sectionIndex: number) => {
    const section = sections[sectionIndex]
    if (!section) return

    const sectionEl = sectionRefs.get(section.id)
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth' })
    }
  }, [sections, sectionRefs])

  // Apply theme as CSS variables
  const themeStyle = {
    '--ds-color-background': theme.colors.background,
    '--ds-color-text': theme.colors.text,
    '--ds-color-accent': theme.colors.accent,
    '--ds-color-muted': theme.colors.muted,
    '--ds-font-heading': theme.fonts.heading,
    '--ds-font-body': theme.fonts.body,
    '--ds-layout-breakpoint': layout.breakpoint,
    '--ds-layout-desktop-animation-width': `${layout.desktopAnimationWidth}%`,
    '--ds-layout-desktop-text-width': `${100 - layout.desktopAnimationWidth}%`,
    '--ds-layout-mobile-animation-height': layout.mobileAnimationHeight,
    '--ds-layout-content-max-width': layout.contentMaxWidth,
    '--ds-layout-desktop-section-padding': layout.desktopSectionPadding,
    '--ds-layout-mobile-section-padding': layout.mobileSectionPadding,
    ...theme.customVars
  } as React.CSSProperties

  return (
    <div className="ds-stream" style={themeStyle}>
      <style jsx global>{`
        .ds-stream {
          background: var(--ds-color-background);
          color: var(--ds-color-text);
          font-family: var(--ds-font-body);
          min-height: 100vh;
        }

        /* Fixed animation container - left side on desktop */
        .ds-animation-container {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--ds-layout-desktop-animation-width);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ds-color-background);
          z-index: 1;
        }

        .ds-canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: contents;
        }

        /* Edge fade gradient - blur/fade at animation edge */
        .ds-edge-fade {
          position: absolute;
          top: 0;
          right: 0;
          width: var(--ds-edge-fade-width, 80px);
          height: 100%;
          background: linear-gradient(
            to right,
            transparent 0%,
            var(--ds-color-background) 100%
          );
          pointer-events: none;
          z-index: 2;
        }

        /* Scrollable sections container - right side on desktop */
        .ds-sections-container {
          margin-left: var(--ds-layout-desktop-animation-width);
          width: var(--ds-layout-desktop-text-width);
          min-height: 100vh;
          position: relative;
          z-index: 2;
        }

        /* Section layout - height determined by word count via inline style */
        .ds-section {
          padding: var(--ds-layout-desktop-section-padding);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-top: 20vh;
        }

        .ds-section:first-child {
          padding-top: 15vh;
        }

        .ds-section:last-child {
          padding-bottom: 30vh;
        }

        /* Typography for custom content - readable and spacious */
        .ds-content {
          max-width: var(--ds-layout-content-max-width);
        }

        .ds-content h1 {
          font-family: var(--ds-font-heading);
          font-size: clamp(2.25rem, 4vw, 3rem);
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 1.5rem 0;
          letter-spacing: -0.02em;
        }

        .ds-content h2 {
          font-family: var(--ds-font-heading);
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 600;
          line-height: 1.25;
          margin: 2rem 0 1.25rem 0;
          letter-spacing: -0.01em;
        }

        .ds-content h2:first-child {
          margin-top: 0;
        }

        .ds-content p {
          font-size: clamp(0.95rem, 1.25vw, 1.0625rem);
          line-height: 1.85;
          margin: 0 0 1.25rem 0;
          letter-spacing: 0.005em;
        }

        .ds-content p:last-child {
          margin-bottom: 0;
        }

        .ds-content em {
          font-style: italic;
        }

        /* Loading screen */
        .ds-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--ds-color-background);
          z-index: 1000;
        }

        .ds-loading__bar {
          width: 200px;
          height: 4px;
          background: var(--ds-color-muted);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 16px;
        }

        .ds-loading__fill {
          height: 100%;
          background: var(--ds-color-accent);
          transition: width 0.1s;
        }

        .ds-loading__text {
          color: var(--ds-color-muted);
          font-size: 0.9rem;
        }

        /* Debug indicator */
        .ds-progress-indicator {
          position: fixed;
          bottom: 16px;
          left: 16px;
          font-size: 0.75rem;
          color: var(--ds-color-muted);
          font-family: monospace;
          z-index: 50;
          opacity: 0.6;
        }

        /* Debug overlay */
        .ds-debug-overlay {
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.9);
          color: #00ff00;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 10000;
          max-width: 320px;
          line-height: 1.6;
          border: 1px solid #00ff00;
        }

        .ds-debug-overlay h4 {
          margin: 0 0 8px 0;
          color: #00ff00;
          font-size: 13px;
          border-bottom: 1px solid #00ff00;
          padding-bottom: 4px;
        }

        .ds-debug-overlay .ds-debug-row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }

        .ds-debug-overlay .ds-debug-label {
          color: #888;
        }

        .ds-debug-overlay .ds-debug-value {
          color: #00ff00;
          font-weight: bold;
        }

        .ds-debug-overlay .ds-debug-section {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #333;
        }

        .ds-debug-overlay .ds-debug-active {
          color: #ffff00;
          background: rgba(255, 255, 0, 0.1);
          padding: 2px 4px;
          border-radius: 3px;
        }

        /* Background loading indicator */
        .ds-background-loader {
          position: fixed;
          bottom: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: color-mix(in srgb, var(--ds-color-background) 90%, var(--ds-color-text));
          border-radius: 20px;
          font-size: 0.75rem;
          color: var(--ds-color-muted);
          z-index: 50;
          opacity: 0;
          animation: ds-fade-in 0.3s ease forwards;
        }

        .ds-background-loader.ds-hidden {
          animation: ds-fade-out 0.5s ease forwards;
        }

        @keyframes ds-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ds-fade-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(10px); }
        }

        .ds-background-loader__bar {
          width: 60px;
          height: 3px;
          background: var(--ds-color-muted);
          border-radius: 2px;
          overflow: hidden;
        }

        .ds-background-loader__fill {
          height: 100%;
          background: var(--ds-color-accent);
          transition: width 0.2s;
        }

        /* Mobile: Stack vertically - fixed animation at top, content scrolls below */
        /* Note: breakpoint value (768px) can't use CSS vars in media queries */
        @media (max-width: 768px) {
          .ds-animation-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: var(--ds-layout-mobile-animation-height);
            z-index: 100;
          }

          .ds-sections-container {
            margin-left: 0;
            width: 100%;
            min-height: 100vh;
            padding-top: var(--ds-layout-mobile-animation-height);
            position: relative;
            z-index: 1;
          }

          .ds-section {
            padding: var(--ds-layout-mobile-section-padding);
            padding-top: 15vh;
            background: var(--ds-color-background);
          }

          .ds-section:first-child {
            padding-top: 10vh;
          }

          .ds-section:last-child {
            padding-bottom: 20vh;
          }

          .ds-content {
            max-width: 100%;
          }

          /* Edge fade on mobile - on animation */
          .ds-edge-fade {
            top: auto;
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 80px;
            background: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.5) 60%,
              rgba(0, 0, 0, 1) 100%
            );
          }

          /* Mobile transition overlay - extends BELOW animation over text */
          .ds-mobile-transition {
            position: fixed;
            top: var(--ds-layout-mobile-animation-height);
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0.6) 40%,
              rgba(0, 0, 0, 0) 100%
            );
            z-index: 99;
            pointer-events: none;
          }
        }
      `}</style>

      {/* No loading screen - content shows immediately with first frame */}

      {/* Fixed animation container */}
      <div className="ds-animation-container">
        <CanvasRenderer
          getFrame={getFrame}
          segmentId={currentSegmentId}
          frameNumber={currentFrameNumber}
          isLoaded={isLoaded}
          className="ds-canvas"
          fit={layout.animationFit}
          centerOffsetX={centerOffsetX}
        />
        {layout.edgeFade && (
          <div
            className="ds-edge-fade"
            style={{ '--ds-edge-fade-width': `${layout.edgeFadeWidth}px` } as React.CSSProperties}
          />
        )}
      </div>

      {/* Mobile transition overlay - extends below animation over text */}
      {!isDesktop && layout.edgeFade && (
        <div className="ds-mobile-transition" />
      )}

      {/* Scrollable sections */}
      <div className="ds-sections-container">
        {sections.map((section, index) => (
          <section
            key={section.id}
            ref={setSectionRef(section.id)}
            className="ds-section"
            data-section-id={section.id}
            data-section-index={index}
            style={{ minHeight: `${getSectionScrollHeight(section.id, index)}px` }}
          >
            <ContentRenderer
              content={section.content}
              theme={theme}
            />
          </section>
        ))}
      </div>

      {/* Navigation (for presentations) */}
      {navigation && (
        <NavigationControls
          config={navigation}
          sections={sections}
          activeSectionIndex={activeSection?.sectionIndex ?? 0}
          theme={theme}
          onNavigate={handleNavigate}
        />
      )}

      {/* Background loading indicator - shows while remaining frames load */}
      {isLoaded && !isFullyLoaded && (
        <div className="ds-background-loader">
          <span>Loading</span>
          <div className="ds-background-loader__bar">
            <div
              className="ds-background-loader__fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Debug overlay - enabled via ?debug=true */}
      {debugMode && (
        <div className="ds-debug-overlay">
          <h4>DEBUG MODE</h4>

          <div className="ds-debug-row">
            <span className="ds-debug-label">Scroll Y:</span>
            <span className="ds-debug-value">{debugInfo.scrollY}px</span>
          </div>

          <div className="ds-debug-row">
            <span className="ds-debug-label">Viewport:</span>
            <span className="ds-debug-value">{debugInfo.viewportHeight}px</span>
          </div>

          <div className="ds-debug-row">
            <span className="ds-debug-label">Doc Height:</span>
            <span className="ds-debug-value">{debugInfo.documentHeight}px</span>
          </div>

          <div className="ds-debug-section">
            <div className="ds-debug-row">
              <span className="ds-debug-label">Segment:</span>
              <span className="ds-debug-value">{currentSegmentId}</span>
            </div>

            <div className="ds-debug-row">
              <span className="ds-debug-label">Frame:</span>
              <span className="ds-debug-value">{globalFrameNumber} / {totalFrames}</span>
            </div>

            <div className="ds-debug-row">
              <span className="ds-debug-label">In Segment:</span>
              <span className="ds-debug-value">frame {currentFrameNumber}</span>
            </div>

            <div className="ds-debug-row">
              <span className="ds-debug-label">Px/Frame:</span>
              <span className="ds-debug-value">{pixelsPerFrame}px</span>
            </div>
          </div>

          <div className="ds-debug-section">
            <div className="ds-debug-row">
              <span className="ds-debug-label">Active Section:</span>
              <span className="ds-debug-value ds-debug-active">
                {activeSection?.sectionId ?? 'none'}
              </span>
            </div>
          </div>

          <div className="ds-debug-section">
            <div style={{ fontSize: '11px', marginBottom: '4px', color: '#888' }}>
              Section positions:
            </div>
            {debugInfo.sectionTops.map((s, i) => (
              <div key={s.id} style={{
                fontSize: '10px',
                color: activeSection?.sectionId === s.id ? '#ffff00' : '#666',
                marginLeft: '8px'
              }}>
                {i + 1}. {s.id}: {s.top}px (h:{s.height}px)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
