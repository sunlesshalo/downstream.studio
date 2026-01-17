import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Segment, ActiveSectionState } from '../types'

interface UseScrollSyncOptions {
  segments: Segment[]
  activeSection: ActiveSectionState | null
  sectionRefs: Map<string, HTMLElement>
}

interface UseScrollSyncReturn {
  /** Current segment ID being displayed */
  currentSegmentId: number
  /** Current frame number within the segment */
  currentFrameNumber: number
  /** Global frame number (1 to totalFrames) */
  globalFrameNumber: number
  /** Progress through current section (0-1) */
  sectionProgress: number
}

/**
 * Hook to sync scroll position to animation frames
 * Maps scroll position within a section to frames within that section's segments
 */
export function useScrollSync({
  segments,
  activeSection,
  sectionRefs
}: UseScrollSyncOptions): UseScrollSyncReturn {
  const [currentSegmentId, setCurrentSegmentId] = useState(1)
  const [currentFrameNumber, setCurrentFrameNumber] = useState(1)
  const [globalFrameNumber, setGlobalFrameNumber] = useState(1)
  const [sectionProgress, setSectionProgress] = useState(0)

  const rafRef = useRef<number | null>(null)

  // Build a map of segment ID to its frame range - cached with useMemo
  const segmentMapCache = useMemo(() => {
    const map = new Map<number, { start: number; end: number; frameCount: number }>()
    let frameOffset = 0

    for (const segment of segments) {
      map.set(segment.id, {
        start: frameOffset + 1,
        end: frameOffset + segment.frameCount,
        frameCount: segment.frameCount
      })
      frameOffset += segment.frameCount
    }

    return map
  }, [segments])

  // Calculate total frames for active section's segments
  const getSectionFrameInfo = useCallback((sectionSegmentIds: number[]) => {
    let totalFrames = 0
    const segmentRanges: Array<{ id: number; start: number; count: number }> = []

    for (const segId of sectionSegmentIds) {
      const info = segmentMapCache.get(segId)
      if (info) {
        segmentRanges.push({
          id: segId,
          start: totalFrames,
          count: info.frameCount
        })
        totalFrames += info.frameCount
      }
    }

    return { totalFrames, segmentRanges }
  }, [segmentMapCache])

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!activeSection) return

    const sectionEl = sectionRefs.get(activeSection.sectionId)
    if (!sectionEl) return

    const rect = sectionEl.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // Calculate how far through the section we've scrolled
    // Section starts when its top reaches bottom of viewport
    // Section ends when its bottom reaches top of viewport
    const sectionHeight = rect.height
    const scrolledIntoSection = viewportHeight - rect.top
    const totalScrollRange = sectionHeight + viewportHeight

    // Clamp progress between 0 and 1
    const progress = Math.max(0, Math.min(1, scrolledIntoSection / totalScrollRange))
    setSectionProgress(progress)

    // Get frame info for this section's segments
    const { totalFrames, segmentRanges } = getSectionFrameInfo(activeSection.segments)

    if (totalFrames === 0) return

    // Calculate which frame we should be on
    const frameIndex = Math.floor(progress * (totalFrames - 1))

    // Find which segment this frame belongs to
    let accumulatedFrames = 0
    for (const range of segmentRanges) {
      if (frameIndex < accumulatedFrames + range.count) {
        const frameInSegment = frameIndex - accumulatedFrames + 1
        setCurrentSegmentId(range.id)
        setCurrentFrameNumber(frameInSegment)

        // Calculate global frame number using cached map
        const segmentInfo = segmentMapCache.get(range.id)
        if (segmentInfo) {
          setGlobalFrameNumber(segmentInfo.start + frameInSegment - 1)
        }
        break
      }
      accumulatedFrames += range.count
    }
  }, [activeSection, sectionRefs, getSectionFrameInfo, segmentMapCache])

  // Throttled scroll handler using RAF
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(handleScroll)
    }

    // Initial calculation
    handleScroll()

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll])

  // Update when active section changes
  useEffect(() => {
    if (activeSection && activeSection.segments.length > 0) {
      // Set initial segment to first in section
      setCurrentSegmentId(activeSection.segments[0])
      setCurrentFrameNumber(1)
      handleScroll()
    }
  }, [activeSection, handleScroll])

  return {
    currentSegmentId,
    currentFrameNumber,
    globalFrameNumber,
    sectionProgress
  }
}
