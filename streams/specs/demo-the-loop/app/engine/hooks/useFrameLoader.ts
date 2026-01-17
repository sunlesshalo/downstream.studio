import { useState, useEffect, useRef, useCallback } from 'react'
import { Segment } from '../types'

interface UseFrameLoaderOptions {
  segments: Segment[]
  basePath?: string
}

interface UseFrameLoaderReturn {
  /** Whether enough frames are loaded to start (first frame ready) */
  isLoaded: boolean
  /** Whether all frames are fully loaded */
  isFullyLoaded: boolean
  /** Loading progress 0-1 */
  progress: number
  /** Get an image element for a specific segment and frame (for canvas rendering) */
  getFrame: (segmentId: number, frameNumber: number) => HTMLImageElement | null
  /** Get the src URL for a specific segment and frame (for img rendering) */
  getFrameSrc: (segmentId: number, frameNumber: number) => string
  /** Total number of frames across all segments */
  totalFrames: number
}

/**
 * Hook to preload and cache all animation frames
 * Strategy: Show content after first frame, load all segments in parallel
 */
export function useFrameLoader({
  segments,
  basePath = '/frames'
}: UseFrameLoaderOptions): UseFrameLoaderReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFullyLoaded, setIsFullyLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const loadedCountRef = useRef(0)

  // Calculate total frames
  const totalFrames = segments.reduce((sum, seg) => sum + seg.frameCount, 0)

  // Generate frame key for cache
  const getFrameKey = useCallback((segmentId: number, frameNumber: number) => {
    return `${segmentId}-${frameNumber}`
  }, [])

  // Generate frame path
  const getFramePath = useCallback((segment: Segment, frameNumber: number) => {
    if (segment.framePath) {
      // Custom path pattern - replace {n} with frame number
      return segment.framePath.replace('{n}', String(frameNumber).padStart(4, '0'))
    }
    // Default pattern
    return `${basePath}/${segment.id}/frame_${String(frameNumber).padStart(4, '0')}.webp`
  }, [basePath])

  // Load a single frame and return promise
  const loadFrame = useCallback((segment: Segment, frameNumber: number, mounted: { current: boolean }): Promise<void> => {
    const key = getFrameKey(segment.id, frameNumber)
    const src = getFramePath(segment, frameNumber)

    return new Promise<void>((resolve) => {
      const img = new Image()

      img.onload = () => {
        if (mounted.current) {
          imagesRef.current.set(key, img)
          loadedCountRef.current++
          setProgress(loadedCountRef.current / totalFrames)
        }
        resolve()
      }

      img.onerror = () => {
        console.warn(`Failed to load frame: ${src}`)
        loadedCountRef.current++
        setProgress(loadedCountRef.current / totalFrames)
        resolve()
      }

      img.src = src
    })
  }, [getFrameKey, getFramePath, totalFrames])

  // Load frames - show immediately after first frame, load all in parallel
  useEffect(() => {
    const mounted = { current: true }
    loadedCountRef.current = 0

    const loadAllImages = async () => {
      if (segments.length === 0) {
        setIsLoaded(true)
        setIsFullyLoaded(true)
        return
      }

      // Load ONLY first frame of first segment - show content immediately
      const firstSegment = segments[0]
      await loadFrame(firstSegment, 1, mounted)

      if (mounted.current) {
        setIsLoaded(true)
      }

      // Load ALL remaining frames in parallel for maximum speed
      const allPromises: Promise<void>[] = []

      for (const segment of segments) {
        const startFrame = segment === firstSegment ? 2 : 1 // Skip first frame of first segment
        for (let i = startFrame; i <= segment.frameCount; i++) {
          allPromises.push(loadFrame(segment, i, mounted))
        }
      }

      await Promise.all(allPromises)

      if (mounted.current) {
        setIsFullyLoaded(true)
        setProgress(1)
      }
    }

    loadAllImages()

    return () => {
      mounted.current = false
    }
  }, [segments, loadFrame])

  // Get frame from cache
  const getFrame = useCallback((segmentId: number, frameNumber: number) => {
    const key = getFrameKey(segmentId, frameNumber)
    return imagesRef.current.get(key) || null
  }, [getFrameKey])

  // Get frame src URL (for img element rendering)
  const getFrameSrc = useCallback((segmentId: number, frameNumber: number) => {
    const segment = segments.find(s => s.id === segmentId)
    if (!segment) {
      return `${basePath}/${segmentId}/frame_${String(frameNumber).padStart(4, '0')}.webp`
    }
    return getFramePath(segment, frameNumber)
  }, [segments, basePath, getFramePath])

  return {
    isLoaded,
    isFullyLoaded,
    progress,
    getFrame,
    getFrameSrc,
    totalFrames
  }
}
