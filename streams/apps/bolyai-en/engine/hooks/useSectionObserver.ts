import { useState, useEffect, useRef, useCallback } from 'react'
import { Section, ActiveSectionState } from '../types'

interface UseSectionObserverOptions {
  sections: Section[]
  /** Threshold for considering a section "active" (0-1) */
  threshold?: number
}

interface UseSectionObserverReturn {
  /** Currently active section state */
  activeSection: ActiveSectionState | null
  /** Ref callback to attach to section elements */
  setSectionRef: (sectionId: string) => (el: HTMLElement | null) => void
  /** All section refs for external use */
  sectionRefs: Map<string, HTMLElement>
}

/**
 * Hook to observe which section is currently in view using Intersection Observer
 * This is responsive and works on all screen sizes
 */
export function useSectionObserver({
  sections,
  threshold = 0.3
}: UseSectionObserverOptions): UseSectionObserverReturn {
  const [activeSection, setActiveSection] = useState<ActiveSectionState | null>(null)
  const sectionRefsMap = useRef<Map<string, HTMLElement>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Track which sections are currently intersecting and by how much
  const intersectingRef = useRef<Map<string, number>>(new Map())

  // Determine the most visible section
  const updateActiveSection = useCallback(() => {
    let maxRatio = 0
    let mostVisibleId: string | null = null

    intersectingRef.current.forEach((ratio, sectionId) => {
      if (ratio > maxRatio) {
        maxRatio = ratio
        mostVisibleId = sectionId
      }
    })

    // For tall sections, the intersection ratio stays low even when filling the viewport
    // So we use a lower effective threshold, or just pick the most visible section
    // as long as something is intersecting
    if (mostVisibleId && maxRatio > 0) {
      const sectionIndex = sections.findIndex(s => s.id === mostVisibleId)
      const section = sections[sectionIndex]

      if (section) {
        setActiveSection((prev) => {
          // Only update if section changed
          if (prev?.sectionId === mostVisibleId) return prev
          return {
            sectionId: mostVisibleId,
            sectionIndex,
            segments: section.segments,
            progress: 0 // Will be updated by scroll sync
          }
        })
      }
    }
  }, [sections])

  // Create observer on mount
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute('data-section-id')
          if (!sectionId) return

          if (entry.isIntersecting) {
            intersectingRef.current.set(sectionId, entry.intersectionRatio)
          } else {
            intersectingRef.current.delete(sectionId)
          }
        })

        updateActiveSection()
      },
      {
        // Multiple thresholds for smoother tracking
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        // Root margin to trigger slightly before section enters
        rootMargin: '-10% 0px -10% 0px'
      }
    )

    // Observe all registered sections
    sectionRefsMap.current.forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [updateActiveSection])

  // Ref callback factory for sections
  const setSectionRef = useCallback((sectionId: string) => {
    return (el: HTMLElement | null) => {
      if (el) {
        el.setAttribute('data-section-id', sectionId)
        sectionRefsMap.current.set(sectionId, el)
        observerRef.current?.observe(el)
      } else {
        const existing = sectionRefsMap.current.get(sectionId)
        if (existing) {
          observerRef.current?.unobserve(existing)
          sectionRefsMap.current.delete(sectionId)
        }
      }
    }
  }, [])

  // Set initial active section (first one)
  useEffect(() => {
    if (sections.length > 0 && !activeSection) {
      setActiveSection({
        sectionId: sections[0].id,
        sectionIndex: 0,
        segments: sections[0].segments,
        progress: 0
      })
    }
  }, [sections, activeSection])

  return {
    activeSection,
    setSectionRef,
    sectionRefs: sectionRefsMap.current
  }
}
