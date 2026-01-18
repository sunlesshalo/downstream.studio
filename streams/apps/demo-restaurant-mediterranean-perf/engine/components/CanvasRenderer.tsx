'use client'

import { useRef, useEffect, useCallback } from 'react'

interface CanvasRendererProps {
  /** Function to get frame image */
  getFrame: (segmentId: number, frameNumber: number) => HTMLImageElement | null
  /** Current segment ID */
  segmentId: number
  /** Current frame number within segment */
  frameNumber: number
  /** Whether frames are loaded */
  isLoaded: boolean
  /** Optional CSS class name */
  className?: string
  /** How the image fills the container: 'cover' (crop to fill) or 'contain' (fit inside) */
  fit?: 'cover' | 'contain'
  /** Horizontal offset for centering adjustment (positive = shift image left, showing more of right side) */
  centerOffsetX?: number
}

/**
 * Renders animation frames to a canvas element
 * Supports both cover and contain rendering modes
 */
export function CanvasRenderer({
  getFrame,
  segmentId,
  frameNumber,
  isLoaded,
  className = '',
  fit = 'cover',
  centerOffsetX = 0
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastDrawnRef = useRef<string>('')
  const lastFitRef = useRef<string>(fit)
  const lastValidFrameRef = useRef<{ segmentId: number; frameNumber: number } | null>(null)
  // Cache container bounds to avoid getBoundingClientRect on every frame
  const boundsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })

  // Draw image with cover behavior (crop to fill, like object-fit: cover)
  const drawCover = useCallback((
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const imgRatio = img.width / img.height
    const canvasRatio = canvasWidth / canvasHeight

    let drawWidth: number
    let drawHeight: number
    let offsetX: number
    let offsetY: number

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas ratio - fit height, crop sides
      drawHeight = canvasHeight
      drawWidth = img.width * (canvasHeight / img.height)
      // Center horizontally, then apply offset to adjust for edge fade
      // Positive centerOffsetX shifts image left (shows more of right side)
      offsetX = (canvasWidth - drawWidth) / 2 - centerOffsetX
      offsetY = 0
    } else {
      // Image is taller than canvas ratio - fit width, crop top/bottom
      drawWidth = canvasWidth
      drawHeight = img.height * (canvasWidth / img.width)
      offsetX = 0
      offsetY = (canvasHeight - drawHeight) / 2
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  }, [centerOffsetX])

  // Draw image with contain behavior (fit inside, like object-fit: contain)
  const drawContain = useCallback((
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const imgRatio = img.width / img.height
    const canvasRatio = canvasWidth / canvasHeight

    let drawWidth: number
    let drawHeight: number
    let offsetX: number
    let offsetY: number

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas ratio - fit width, letterbox top/bottom
      drawWidth = canvasWidth
      drawHeight = img.height * (canvasWidth / img.width)
      offsetX = 0
      offsetY = (canvasHeight - drawHeight) / 2
    } else {
      // Image is taller than canvas ratio - fit height, pillarbox sides
      drawHeight = canvasHeight
      drawWidth = img.width * (canvasHeight / img.height)
      offsetX = (canvasWidth - drawWidth) / 2
      offsetY = 0
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  }, [])

  // Draw based on fit mode
  const draw = useCallback((
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (fit === 'contain') {
      drawContain(ctx, img, canvasWidth, canvasHeight)
    } else {
      drawCover(ctx, img, canvasWidth, canvasHeight)
    }
  }, [fit, drawCover, drawContain])

  // Resize canvas to match container and cache bounds
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    const rect = container.getBoundingClientRect()

    // Use device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    const width = rect.width
    const height = rect.height

    // Cache bounds to avoid getBoundingClientRect on every frame
    boundsRef.current = { width, height }

    // Set canvas size (accounting for DPR)
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Scale context for DPR
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    // Clear the last drawn ref to force redraw
    lastDrawnRef.current = ''
  }, [])

  // Handle resize
  useEffect(() => {
    resizeCanvas()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [resizeCanvas])

  // Redraw when fit mode changes
  useEffect(() => {
    if (lastFitRef.current !== fit) {
      lastFitRef.current = fit
      lastDrawnRef.current = '' // Force redraw
    }
  }, [fit])

  // Draw frame when it changes
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !isLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Skip if we already drew this frame with same fit and offset
    const frameKey = `${segmentId}-${frameNumber}-${fit}-${centerOffsetX}`
    if (lastDrawnRef.current === frameKey) return

    // Try to get the requested frame
    let img = getFrame(segmentId, frameNumber)

    // If frame not loaded yet, try to find closest available frame
    if (!img) {
      // Try frames before the current one (in same segment)
      for (let i = frameNumber - 1; i >= 1; i--) {
        const fallbackImg = getFrame(segmentId, i)
        if (fallbackImg) {
          img = fallbackImg
          break
        }
      }
      // If still nothing, try last valid frame from any segment
      if (!img && lastValidFrameRef.current) {
        img = getFrame(lastValidFrameRef.current.segmentId, lastValidFrameRef.current.frameNumber)
      }
    }

    if (!img) return // Still nothing available

    // Use cached bounds instead of getBoundingClientRect (updated on resize)
    const { width, height } = boundsRef.current
    if (width === 0 || height === 0) return // Bounds not yet initialized

    // Clear and draw
    ctx.clearRect(0, 0, width, height)
    draw(ctx, img, width, height)
    lastDrawnRef.current = frameKey

    // Remember this frame as the last valid one
    if (getFrame(segmentId, frameNumber)) {
      lastValidFrameRef.current = { segmentId, frameNumber }
    }
  }, [segmentId, frameNumber, isLoaded, getFrame, draw, fit, centerOffsetX])

  // Draw first frame immediately when loaded
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current) return
    if (lastDrawnRef.current) return // Already drawn something

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = getFrame(segmentId, frameNumber)
    if (!img) return

    // Use cached bounds
    const { width, height } = boundsRef.current
    if (width === 0 || height === 0) return // Bounds not yet initialized

    draw(ctx, img, width, height)
    lastDrawnRef.current = `${segmentId}-${frameNumber}-${fit}-${centerOffsetX}`
  }, [isLoaded, segmentId, frameNumber, getFrame, draw, fit, centerOffsetX])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}
