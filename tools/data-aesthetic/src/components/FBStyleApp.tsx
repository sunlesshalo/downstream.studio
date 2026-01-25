'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useControls, folder } from 'leva'

/**
 * FB-Style Data Aesthetic
 *
 * Split screen layout with draggable divider:
 * - LEFT portion: Numbers/digits showing the LEFT portion of the video
 * - RIGHT portion: Actual video showing the RIGHT portion
 * - Draggable divider to adjust the split position
 */

// ============================================================================
// NUMBER GRID - Shows LEFT portion of video as digits (Canvas-optimized)
// ============================================================================

interface NumberGridProps {
  videoElement: HTMLVideoElement | null
  color: string
  splitPosition: number
  columns?: number
  rows?: number
  fontSize?: number
  brightnessThreshold?: number
}

function NumberGrid({
  videoElement,
  color,
  splitPosition,
  columns = 50,
  rows = 35,
  fontSize = 14,
  brightnessThreshold = 0.1,
}: NumberGridProps) {
  const renderCanvasRef = useRef<HTMLCanvasElement>(null)
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const sampleCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const cellDataRef = useRef<{ value: string; opacity: number }[]>([])
  const animationRef = useRef<number>()
  const splitPositionRef = useRef(splitPosition)

  // Keep split position ref updated
  useEffect(() => {
    splitPositionRef.current = splitPosition
  }, [splitPosition])

  // Initialize cell data and sampling canvas
  useEffect(() => {
    cellDataRef.current = []
    for (let i = 0; i < rows * columns; i++) {
      cellDataRef.current.push({
        value: Math.floor(Math.random() * 10).toString(),
        opacity: 0,
      })
    }

    const canvas = document.createElement('canvas')
    canvas.width = columns
    canvas.height = rows
    sampleCanvasRef.current = canvas
    sampleCtxRef.current = canvas.getContext('2d', { willReadFrequently: true })
  }, [columns, rows])

  // Animation loop
  useEffect(() => {
    if (!renderCanvasRef.current || !videoElement) return

    const renderCanvas = renderCanvasRef.current
    const renderCtx = renderCanvas.getContext('2d', { alpha: true })
    if (!renderCtx) return

    const update = () => {
      if (!sampleCanvasRef.current || !sampleCtxRef.current) {
        animationRef.current = requestAnimationFrame(update)
        return
      }

      const sampleCtx = sampleCtxRef.current
      const sampleCanvas = sampleCanvasRef.current
      const split = splitPositionRef.current

      // Resize render canvas to window
      if (renderCanvas.width !== window.innerWidth || renderCanvas.height !== window.innerHeight) {
        renderCanvas.width = window.innerWidth
        renderCanvas.height = window.innerHeight
      }

      // Clear render canvas
      renderCtx.clearRect(0, 0, renderCanvas.width, renderCanvas.height)

      if (videoElement.readyState >= 2) {
        const vw = videoElement.videoWidth
        const vh = videoElement.videoHeight

        // Sample the LEFT portion of the video (based on split position)
        sampleCtx.drawImage(
          videoElement,
          0, 0, vw * split, vh,
          0, 0, sampleCanvas.width, sampleCanvas.height
        )

        const imageData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height)
        const pixels = imageData.data

        // Update cell data based on brightness
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            const cellIndex = row * columns + col
            const cell = cellDataRef.current[cellIndex]
            if (!cell) continue

            const pixelIndex = cellIndex * 4
            const r = pixels[pixelIndex] / 255
            const g = pixels[pixelIndex + 1] / 255
            const b = pixels[pixelIndex + 2] / 255

            const luminance = 0.299 * r + 0.587 * g + 0.114 * b

            const targetOpacity = luminance > brightnessThreshold
              ? Math.min(1, (luminance - brightnessThreshold) * 2)
              : 0

            cell.opacity = cell.opacity * 0.75 + targetOpacity * 0.25

            if (cell.opacity > 0.2 && Math.random() < 0.03) {
              cell.value = Math.floor(Math.random() * 10).toString()
            }
          }
        }
      }

      // Render to canvas - render in left portion based on split
      renderCtx.font = `600 ${fontSize}px 'JetBrains Mono', 'Fira Code', monospace`
      renderCtx.textAlign = 'center'
      renderCtx.textBaseline = 'middle'

      const splitWidth = renderCanvas.width * split
      const cellWidth = splitWidth / columns
      const cellHeight = renderCanvas.height / rows

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const cell = cellDataRef.current[row * columns + col]
          if (!cell || cell.opacity < 0.05) continue

          const x = col * cellWidth + cellWidth / 2
          const y = row * cellHeight + cellHeight / 2
          const glowRadius = cell.opacity * 12

          renderCtx.shadowColor = color
          renderCtx.shadowBlur = glowRadius
          renderCtx.fillStyle = color
          renderCtx.globalAlpha = cell.opacity

          renderCtx.fillText(cell.value, x, y)
        }
      }

      renderCtx.shadowBlur = 0
      renderCtx.globalAlpha = 1

      animationRef.current = requestAnimationFrame(update)
    }

    update()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [videoElement, color, fontSize, brightnessThreshold, columns, rows])

  return (
    <canvas
      ref={renderCanvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 70,
      }}
    />
  )
}

// ============================================================================
// SCAN LINES - Horizontal dotted lines across full width (Canvas-optimized)
// ============================================================================

interface ScanLinesProps {
  videoElement: HTMLVideoElement | null
  color: string
  splitPosition: number
  count?: number
  dashLength?: number
  gapLength?: number
  thickness?: number
}

function ScanLines({
  videoElement,
  color,
  splitPosition,
  count = 15,
  dashLength = 6,
  gapLength = 4,
  thickness = 1,
}: ScanLinesProps) {
  const renderCanvasRef = useRef<HTMLCanvasElement>(null)
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const sampleCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const linesRef = useRef<{ y: number; offset: number; intensity: number }[]>([])
  const animationRef = useRef<number>()
  const splitPositionRef = useRef(splitPosition)

  useEffect(() => {
    splitPositionRef.current = splitPosition
  }, [splitPosition])

  useEffect(() => {
    linesRef.current = []
    for (let i = 0; i < count; i++) {
      linesRef.current.push({
        y: (i + 0.5) / count,
        offset: Math.random() * 100,
        intensity: 0.15,
      })
    }

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = count
    sampleCanvasRef.current = canvas
    sampleCtxRef.current = canvas.getContext('2d', { willReadFrequently: true })
  }, [count])

  useEffect(() => {
    if (!renderCanvasRef.current || !videoElement) return

    const renderCanvas = renderCanvasRef.current
    const renderCtx = renderCanvas.getContext('2d', { alpha: true })
    if (!renderCtx) return

    const update = () => {
      if (!sampleCanvasRef.current || !sampleCtxRef.current) {
        animationRef.current = requestAnimationFrame(update)
        return
      }

      const sampleCtx = sampleCtxRef.current
      const sampleCanvas = sampleCanvasRef.current
      const split = splitPositionRef.current

      if (renderCanvas.width !== window.innerWidth || renderCanvas.height !== window.innerHeight) {
        renderCanvas.width = window.innerWidth
        renderCanvas.height = window.innerHeight
      }

      renderCtx.clearRect(0, 0, renderCanvas.width, renderCanvas.height)

      if (videoElement.readyState >= 2) {
        // Sample brightness from LEFT portion only
        sampleCtx.drawImage(
          videoElement,
          0, 0, videoElement.videoWidth * split, videoElement.videoHeight,
          0, 0, sampleCanvas.width, sampleCanvas.height
        )
        const imageData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height)
        const pixels = imageData.data

        for (let i = 0; i < linesRef.current.length; i++) {
          const line = linesRef.current[i]
          const row = Math.min(Math.floor(line.y * sampleCanvas.height), sampleCanvas.height - 1)

          let totalBrightness = 0
          for (let x = 0; x < sampleCanvas.width; x++) {
            const pixelIndex = (row * sampleCanvas.width + x) * 4
            const r = pixels[pixelIndex] / 255
            const g = pixels[pixelIndex + 1] / 255
            const b = pixels[pixelIndex + 2] / 255
            totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b
          }

          const targetIntensity = 0.08 + (totalBrightness / sampleCanvas.width) * 1.2
          line.intensity = line.intensity * 0.92 + targetIntensity * 0.08
          line.offset += 0.5
        }
      }

      // Render scan lines - only on left portion
      const patternLength = dashLength + gapLength
      const splitX = renderCanvas.width * split

      for (const line of linesRef.current) {
        const y = line.y * renderCanvas.height
        const alpha = Math.min(0.8, line.intensity) * 0.5
        const glowSize = line.intensity * 6

        renderCtx.save()
        renderCtx.globalAlpha = alpha
        renderCtx.shadowColor = color
        renderCtx.shadowBlur = glowSize
        renderCtx.fillStyle = color

        // Draw dashed line only up to split position
        const offsetX = line.offset % patternLength
        for (let x = -offsetX; x < splitX; x += patternLength) {
          const drawWidth = Math.min(dashLength, splitX - x)
          if (drawWidth > 0) {
            renderCtx.fillRect(x, y, drawWidth, thickness)
          }
        }

        renderCtx.restore()
      }

      animationRef.current = requestAnimationFrame(update)
    }

    update()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [videoElement, color, dashLength, gapLength, thickness, count])

  return (
    <canvas
      ref={renderCanvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 65,
      }}
    />
  )
}

// ============================================================================
// SPLIT SCREEN VIDEO - Shows RIGHT portion of video on RIGHT side of screen
// ============================================================================

interface SplitScreenVideoProps {
  videoElement: HTMLVideoElement | null
  isPlaying: boolean
  splitPosition: number
}

function SplitScreenVideo({ videoElement, isPlaying, splitPosition }: SplitScreenVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const splitPositionRef = useRef(splitPosition)

  useEffect(() => {
    splitPositionRef.current = splitPosition
  }, [splitPosition])

  useEffect(() => {
    if (!videoElement || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const split = splitPositionRef.current

      if (videoElement.readyState >= 2) {
        const vw = videoElement.videoWidth
        const vh = videoElement.videoHeight

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Calculate video scaling to cover the screen
        const screenAspect = canvas.width / canvas.height
        const videoAspect = vw / vh

        let drawWidth: number, drawHeight: number, offsetY: number

        if (videoAspect > screenAspect) {
          drawHeight = canvas.height
          drawWidth = drawHeight * videoAspect
          offsetY = 0
        } else {
          drawWidth = canvas.width
          drawHeight = drawWidth / videoAspect
          offsetY = (canvas.height - drawHeight) / 2
        }

        // Draw RIGHT portion of video on RIGHT portion of screen
        const splitScreenX = canvas.width * split
        const splitVideoX = vw * split
        const rightVideoWidth = vw * (1 - split)
        const rightScreenWidth = canvas.width * (1 - split)

        ctx.drawImage(
          videoElement,
          splitVideoX, 0, rightVideoWidth, vh,
          splitScreenX, offsetY, rightScreenWidth * (drawWidth / canvas.width), drawHeight
        )
      }
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    if (isPlaying) {
      draw()
    }

    window.addEventListener('resize', draw)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', draw)
    }
  }, [videoElement, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
      }}
    />
  )
}

// ============================================================================
// DRAGGABLE DIVIDER
// ============================================================================

interface DraggableDividerProps {
  splitPosition: number
  onSplitChange: (position: number) => void
  color: string
  visible: boolean
}

function DraggableDivider({ splitPosition, onSplitChange, color, visible }: DraggableDividerProps) {
  const isDragging = useRef(false)
  const dividerRef = useRef<HTMLDivElement>(null)

  const handleStart = useCallback((clientX: number) => {
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current) return
    const newPosition = Math.max(0.1, Math.min(0.9, clientX / window.innerWidth))
    onSplitChange(newPosition)
  }, [onSplitChange])

  const handleEnd = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX)
  }, [handleStart])

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    handleStart(e.touches[0].clientX)
  }, [handleStart])

  // Global event listeners
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const onMouseUp = () => handleEnd()
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current) {
        e.preventDefault()
        handleMove(e.touches[0].clientX)
      }
    }
    const onTouchEnd = () => handleEnd()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [handleMove, handleEnd])

  if (!visible) return null

  return (
    <div
      ref={dividerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'absolute',
        top: 0,
        left: `${splitPosition * 100}%`,
        transform: 'translateX(-50%)',
        width: '20px',
        height: '100%',
        cursor: 'col-resize',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Visible line */}
      <div
        style={{
          width: '2px',
          height: '100%',
          background: `linear-gradient(to bottom, transparent, ${color}60, ${color}, ${color}60, transparent)`,
          boxShadow: `0 0 10px ${color}80, 0 0 20px ${color}40`,
        }}
      />
      {/* Drag handle indicator */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '24px',
          height: '48px',
          borderRadius: '12px',
          background: `${color}30`,
          border: `1px solid ${color}60`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        {/* Grip lines */}
        <div style={{ width: '8px', height: '2px', background: color, borderRadius: '1px' }} />
        <div style={{ width: '8px', height: '2px', background: color, borderRadius: '1px' }} />
        <div style={{ width: '8px', height: '2px', background: color, borderRadius: '1px' }} />
      </div>
    </div>
  )
}

// ============================================================================
// MAIN APP
// ============================================================================

const COLOR_PRESETS: Record<string, string> = {
  cyberpunk: '#00ffaa',
  matrix: '#00ff00',
  synthwave: '#ff00ff',
  ice: '#88ccff',
  fire: '#ff6600',
  gold: '#ffaa00',
}

export default function FBStyleApp() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [cycleColor, setCycleColor] = useState('#00ffaa')
  const [splitPosition, setSplitPosition] = useState(0.5)

  // Leva controls
  const {
    colorPreset,
    customColor,
    autoCycleColors,
    cycleSpeed,
    // Number Grid
    gridColumns,
    gridRows,
    gridFontSize,
    brightnessThreshold,
    showGrid,
    // Scan Lines
    showScanLines,
    scanLineCount,
    dashLength,
    gapLength,
    lineThickness,
    // Visual
    showDivider,
    showVignette,
  } = useControls({
    'Color': folder({
      colorPreset: {
        value: 'cyberpunk',
        options: ['cyberpunk', 'matrix', 'synthwave', 'ice', 'fire', 'gold', 'custom'],
        label: 'Preset',
      },
      customColor: { value: '#00ffaa', label: 'Custom Color' },
      autoCycleColors: { value: false, label: 'Auto Cycle' },
      cycleSpeed: { value: 8, min: 2, max: 20, step: 1, label: 'Cycle Speed (s)' },
    }),
    'Number Grid': folder({
      showGrid: { value: true, label: 'Enabled' },
      gridColumns: { value: 80, min: 20, max: 120, step: 5, label: 'Columns' },
      gridRows: { value: 55, min: 15, max: 80, step: 5, label: 'Rows' },
      gridFontSize: { value: 9, min: 6, max: 18, step: 1, label: 'Font Size' },
      brightnessThreshold: { value: 0.08, min: 0, max: 0.5, step: 0.02, label: 'Brightness Threshold' },
    }),
    'Scan Lines': folder({
      showScanLines: { value: true, label: 'Enabled' },
      scanLineCount: { value: 15, min: 5, max: 30, step: 1, label: 'Count' },
      dashLength: { value: 6, min: 2, max: 20, step: 1, label: 'Dash Length' },
      gapLength: { value: 4, min: 2, max: 15, step: 1, label: 'Gap Length' },
      lineThickness: { value: 1, min: 1, max: 4, step: 1, label: 'Thickness' },
    }),
    'Visual': folder({
      showDivider: { value: true, label: 'Divider' },
      showVignette: { value: true, label: 'Vignette' },
    }),
  })

  // Determine current color
  const currentColor = autoCycleColors
    ? cycleColor
    : colorPreset === 'custom'
      ? customColor
      : COLOR_PRESETS[colorPreset]

  // Auto-load and auto-play video
  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/samples/jellyfish.mp4'
    video.loop = true
    video.muted = true
    video.playsInline = true

    video.onloadeddata = () => {
      videoRef.current = video
      setTimeout(() => {
        video.play()
        setIsPlaying(true)
      }, 500)
    }

    video.load()

    return () => {
      video.pause()
      video.src = ''
    }
  }, [])

  // Color cycling
  useEffect(() => {
    if (!autoCycleColors) return

    const colors = Object.values(COLOR_PRESETS)
    let colorIndex = 0

    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length
      setCycleColor(colors[colorIndex])
    }, cycleSpeed * 1000)

    return () => clearInterval(interval)
  }, [autoCycleColors, cycleSpeed])

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = url
        videoRef.current.load()
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: '#0a0a0f',
        overflow: 'hidden',
      }}
    >
      {/* RIGHT portion: actual video */}
      <SplitScreenVideo
        videoElement={videoRef.current}
        isPlaying={isPlaying}
        splitPosition={splitPosition}
      />

      {/* Data visualization layers */}
      {isPlaying && videoRef.current && (
        <>
          {/* Horizontal scan lines */}
          {showScanLines && (
            <ScanLines
              videoElement={videoRef.current}
              color={currentColor}
              splitPosition={splitPosition}
              count={scanLineCount}
              dashLength={dashLength}
              gapLength={gapLength}
              thickness={lineThickness}
            />
          )}

          {/* LEFT portion: number grid */}
          {showGrid && (
            <NumberGrid
              videoElement={videoRef.current}
              color={currentColor}
              splitPosition={splitPosition}
              columns={gridColumns}
              rows={gridRows}
              fontSize={gridFontSize}
              brightnessThreshold={brightnessThreshold}
            />
          )}
        </>
      )}

      {/* Draggable divider */}
      <DraggableDivider
        splitPosition={splitPosition}
        onSplitChange={setSplitPosition}
        color={currentColor}
        visible={showDivider}
      />

      {/* Subtle vignette */}
      {showVignette && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none',
            zIndex: 80,
          }}
        />
      )}

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
          fontSize: 11,
          zIndex: 90,
        }}
      >
        Drag divider to adjust • Drop video to change source
      </div>
    </div>
  )
}
