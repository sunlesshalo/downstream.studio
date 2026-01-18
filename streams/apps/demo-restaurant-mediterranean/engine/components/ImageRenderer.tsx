'use client'

import { useMemo } from 'react'

interface ImageRendererProps {
  /** Function to get frame image source URL */
  getFrameSrc: (segmentId: number, frameNumber: number) => string
  /** Current segment ID */
  segmentId: number
  /** Current frame number within segment */
  frameNumber: number
  /** Whether frames are loaded */
  isLoaded: boolean
  /** Optional CSS class name */
  className?: string
  /** Alt text for accessibility */
  alt?: string
}

/**
 * Renders animation frames using an img element (Capsules-style)
 * Swaps src attribute on scroll for frame changes
 */
export function ImageRenderer({
  getFrameSrc,
  segmentId,
  frameNumber,
  isLoaded,
  className = '',
  alt = 'Animation frame'
}: ImageRendererProps) {
  // Compute current frame src
  const src = useMemo(() => {
    return getFrameSrc(segmentId, frameNumber)
  }, [getFrameSrc, segmentId, frameNumber])

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        // Prevent layout shift during src changes
        willChange: 'contents',
        // Hide broken image icon during loading
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.2s ease-out'
      }}
      // Prevent dragging
      draggable={false}
      // Eager loading since we preload anyway
      loading="eager"
      // Decode async for smoother performance
      decoding="async"
    />
  )
}
