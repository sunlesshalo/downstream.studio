import { useState, useEffect, useRef, useCallback } from 'react'
import { Segment, ActiveSectionState, Section } from '../types'

/**
 * Pixels of scroll per word of text.
 * Lower = tighter gaps between sections.
 * Tuned for ~180 word sections.
 */
export const PIXELS_PER_WORD = 3

/**
 * Extra scroll space at the start of first section.
 */
const FIRST_SECTION_LEADIN = 100

/**
 * Extra scroll space at end of last section (percentage of viewport).
 */
const LAST_SECTION_TAIL = 0.3

interface UseScrollSyncWordCountOptions {
  segments: Segment[]
  sections: Section[]
  activeSection: ActiveSectionState | null
  sectionRefs: Map<string, HTMLElement>
}

interface UseScrollSyncWordCountReturn {
  /** Current segment ID being displayed */
  currentSegmentId: number
  /** Current frame number within the segment */
  currentFrameNumber: number
  /** Global frame number (1 to totalFrames) */
  globalFrameNumber: number
  /** Progress through current section (0-1) */
  sectionProgress: number
  /** Calculate the scroll height for a section */
  getSectionScrollHeight: (sectionId: string, sectionIndex: number) => number
  /** Pixels per frame constant */
  pixelsPerFrame: number
}

/** Batched scroll state to prevent multiple re-renders */
interface ScrollState {
  currentSegmentId: number
  currentFrameNumber: number
  globalFrameNumber: number
  sectionProgress: number
}

/**
 * Hook to sync scroll position to animation frames using global scroll + word count.
 *
 * Key principles:
 * 1. Section height based on word count (PIXELS_PER_WORD)
 * 2. Animation frames distributed across total scroll (never stops)
 * 3. Longer text = more scroll = slower animation in that region
 *
 * Best for: Stories and text-heavy content where animation should pace with reading.
 *
 * Note: Sections should have a `wordCount` property for accurate timing.
 * If not provided, defaults to 180 words.
 */
export function useScrollSyncWordCount({
  segments,
  sections,
  activeSection,
  sectionRefs
}: UseScrollSyncWordCountOptions): UseScrollSyncWordCountReturn {
  // Batch all scroll-related state into single object to prevent multiple re-renders
  const [scrollState, setScrollState] = useState<ScrollState>({
    currentSegmentId: segments[0]?.id ?? 1,
    currentFrameNumber: 1,
    globalFrameNumber: 1,
    sectionProgress: 0
  })
  const [viewportHeight, setViewportHeight] = useState(900)

  // Track last computed values to avoid unnecessary state updates
  const lastComputedRef = useRef<ScrollState | null>(null)
  const rafRef = useRef<number | null>(null)

  // Track viewport height changes
  useEffect(() => {
    // Set actual viewport height on mount (client-side only)
    setViewportHeight(window.innerHeight)

    const handleResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /**
   * Get scroll height for a section based on word count.
   */
  const getSectionScrollHeight = useCallback((
    sectionId: string,
    sectionIndex: number
  ): number => {
    const section = sections[sectionIndex]
    if (!section) return 800 // Fallback

    // Base height from word count
    const wordCount = section.wordCount ?? 180 // Default to average
    const baseScrollHeight = wordCount * PIXELS_PER_WORD

    const isFirstSection = sectionIndex === 0
    const isLastSection = sectionIndex === sections.length - 1

    // First section: small lead-in
    if (isFirstSection) {
      return baseScrollHeight + FIRST_SECTION_LEADIN
    }

    // Last section: tail to allow scrolling to final frame
    if (isLastSection) {
      return baseScrollHeight + viewportHeight * LAST_SECTION_TAIL
    }

    return baseScrollHeight
  }, [viewportHeight, sections])

  // Handle scroll - animation tied to global scroll progress (never stops while scrolling)
  useEffect(() => {
    const handleScroll = () => {
      // Guard against empty data
      if (segments.length === 0 || sections.length === 0) {
        console.warn('useScrollSyncWordCount: No segments or sections provided')
        return
      }

      const scrollY = window.scrollY

      // Calculate total frames
      const totalFrameCount = segments.reduce((sum, seg) => sum + seg.frameCount, 0)

      // Get total document scroll range
      const docHeight = document.documentElement.scrollHeight
      const currentViewportHeight = window.innerHeight
      const maxScroll = docHeight - currentViewportHeight

      // Global progress through entire document (0-1)
      const globalProgress = Math.max(0, Math.min(1, scrollY / Math.max(maxScroll, 1)))

      // Map global progress to global frame number (1 to totalFrameCount)
      const globalFrame = Math.max(1, Math.min(totalFrameCount,
        Math.floor(globalProgress * (totalFrameCount - 1)) + 1
      ))

      // Find which segment this global frame belongs to
      let frameCounter = 0
      let targetSegmentIndex = 0
      let frameInSegment = 1

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        if (globalFrame <= frameCounter + seg.frameCount) {
          targetSegmentIndex = i
          frameInSegment = globalFrame - frameCounter
          break
        }
        frameCounter += seg.frameCount
        targetSegmentIndex = i
        frameInSegment = seg.frameCount
      }

      const activeSegment = segments[targetSegmentIndex]

      // Compute new state
      const newState: ScrollState = {
        currentSegmentId: activeSegment.id,
        currentFrameNumber: frameInSegment,
        globalFrameNumber: globalFrame,
        sectionProgress: globalProgress
      }

      // Only update if frame values actually changed (prevents unnecessary re-renders)
      const last = lastComputedRef.current
      if (!last ||
          last.currentSegmentId !== newState.currentSegmentId ||
          last.currentFrameNumber !== newState.currentFrameNumber ||
          last.globalFrameNumber !== newState.globalFrameNumber) {
        lastComputedRef.current = newState
        // Single batched state update instead of 4 separate updates
        setScrollState(newState)
      }
    }

    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(handleScroll)
    }

    // Initial calculation
    handleScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [segments, sections, sectionRefs])

  // Calculate pixels per frame for debug/reference
  const totalFrameCount = segments.reduce((sum, seg) => sum + seg.frameCount, 0)
  const pixelsPerFrame = totalFrameCount > 0
    ? (typeof document !== 'undefined'
        ? (document.documentElement.scrollHeight - window.innerHeight) / totalFrameCount
        : 9)
    : 9

  return {
    currentSegmentId: scrollState.currentSegmentId,
    currentFrameNumber: scrollState.currentFrameNumber,
    globalFrameNumber: scrollState.globalFrameNumber,
    sectionProgress: scrollState.sectionProgress,
    getSectionScrollHeight,
    pixelsPerFrame
  }
}
