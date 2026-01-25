'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
  Glitch,
  DotScreen,
  Pixelation,
  HueSaturation,
} from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import { useControls, folder, button } from 'leva'
import * as THREE from 'three'

import { FlowField, ParticleSystem, LineTracer, NumberField, NumberGrid, DataScanLines, LoopTracer } from '@/core'
import type { ParticleMode, ParticleShape } from '@/core'
import { useVideoSource } from '@/hooks/useVideoSource'

/**
 * Main visualization scene component.
 */
function VisualizationScene({
  flowField,
  particleSystem,
  lineTracer,
}: {
  flowField: FlowField
  particleSystem: ParticleSystem
  lineTracer: LineTracer
}) {
  const { camera, gl } = useThree()

  // Set up orthographic-like perspective and transparent background
  useEffect(() => {
    camera.position.set(0, 0, 2)
    camera.lookAt(0, 0, 0)
    // Set clear color to transparent
    gl.setClearColor(0x000000, 0)
  }, [camera, gl])

  // Animation loop
  useFrame((state, delta) => {
    // Clamp delta to avoid huge jumps
    const dt = Math.min(delta, 0.1)

    // Update systems
    particleSystem.update(flowField, dt)
    particleSystem.setTime(state.clock.elapsedTime)
    lineTracer.update(flowField, dt)

    // Decay flow field slightly
    flowField.decay(0.98)
  })

  return (
    <>
      <primitive object={particleSystem.getObject()} />
      <primitive object={lineTracer.getObject()} />
    </>
  )
}

/**
 * Post-processing effects.
 */
function Effects({
  bloomIntensity,
  bloomThreshold,
  bloomRadius,
  chromaticAberration,
  vignetteIntensity,
  vignetteDarkness,
  noiseIntensity,
  glitchEnabled,
  glitchStrength,
  dotScreenEnabled,
  dotScreenScale,
  pixelationEnabled,
  pixelationGranularity,
  hueSaturation,
}: {
  bloomIntensity: number
  bloomThreshold: number
  bloomRadius: number
  chromaticAberration: number
  vignetteIntensity: number
  vignetteDarkness: number
  noiseIntensity: number
  glitchEnabled: boolean
  glitchStrength: number
  dotScreenEnabled: boolean
  dotScreenScale: number
  pixelationEnabled: boolean
  pixelationGranularity: number
  hueSaturation: number
}) {
  return (
    <EffectComposer frameBufferType={THREE.HalfFloatType}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        radius={bloomRadius}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(
          chromaticAberration > 0 ? chromaticAberration * 0.002 : 0,
          chromaticAberration > 0 ? chromaticAberration * 0.002 : 0
        )}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette
        offset={vignetteIntensity > 0 ? vignetteIntensity * 0.3 : 0}
        darkness={vignetteIntensity > 0 ? vignetteDarkness : 0}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={noiseIntensity > 0 ? noiseIntensity * 0.5 : 0}
      />
      <Glitch
        delay={new THREE.Vector2(1.5, 3.5)}
        duration={new THREE.Vector2(0.1, 0.3)}
        strength={new THREE.Vector2(
          glitchEnabled ? glitchStrength * 0.1 : 0,
          glitchEnabled ? glitchStrength * 0.2 : 0
        )}
        mode={GlitchMode.SPORADIC}
        active={glitchEnabled}
        ratio={0.85}
      />
      <DotScreen
        blendFunction={dotScreenEnabled ? BlendFunction.NORMAL : BlendFunction.SKIP}
        angle={Math.PI * 0.5}
        scale={dotScreenScale}
      />
      <Pixelation
        granularity={pixelationEnabled ? pixelationGranularity : 0}
      />
      <HueSaturation
        blendFunction={BlendFunction.NORMAL}
        hue={0}
        saturation={hueSaturation}
      />
    </EffectComposer>
  )
}

/**
 * Scanlines overlay for CRT effect.
 */
function ScanlinesOverlay({ opacity, density }: { opacity: number; density: number }) {
  if (opacity <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${density}px,
          rgba(0, 0, 0, ${opacity * 0.5}) ${density}px,
          rgba(0, 0, 0, ${opacity * 0.5}) ${density * 2}px
        )`,
        zIndex: 100,
      }}
    />
  )
}

/**
 * Grid overlay for tech aesthetic.
 */
function GridOverlay({ opacity, size }: { opacity: number; size: number }) {
  if (opacity <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0, 255, 170, ${opacity * 0.1}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 170, ${opacity * 0.1}) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        zIndex: 99,
      }}
    />
  )
}

/**
 * HUD overlay with fake data readouts.
 */
function HUDOverlay({
  show,
  particleCount,
  flowMagnitude,
  primaryColor,
}: {
  show: boolean
  particleCount: number
  flowMagnitude: number
  primaryColor: string
}) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!show) return
    const interval = setInterval(() => setFrame(f => f + 1), 100)
    return () => clearInterval(interval)
  }, [show])

  if (!show) return null

  const randomHex = () => Math.random().toString(16).substring(2, 8).toUpperCase()
  const randomBinary = () => Math.floor(Math.random() * 256).toString(2).padStart(8, '0')

  return (
    <>
      {/* Top left corner */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          fontFamily: 'monospace',
          fontSize: 10,
          color: primaryColor,
          opacity: 0.7,
          textShadow: `0 0 10px ${primaryColor}`,
          zIndex: 101,
        }}
      >
        <div>SYS.INIT: ACTIVE</div>
        <div>FRAME: {String(frame).padStart(6, '0')}</div>
        <div>PARTICLES: {particleCount.toLocaleString()}</div>
        <div>FLOW.MAG: {flowMagnitude.toFixed(4)}</div>
        <div style={{ marginTop: 8 }}>
          <div>0x{randomHex()}</div>
          <div>0x{randomHex()}</div>
        </div>
      </div>

      {/* Top right corner */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          fontFamily: 'monospace',
          fontSize: 10,
          color: primaryColor,
          opacity: 0.7,
          textAlign: 'right',
          textShadow: `0 0 10px ${primaryColor}`,
          zIndex: 101,
        }}
      >
        <div>DATA.STREAM</div>
        <div>{randomBinary()}</div>
        <div>{randomBinary()}</div>
        <div>{randomBinary()}</div>
        <div style={{ marginTop: 8 }}>
          <div>NEURAL.PROC: OK</div>
          <div>VIS.ENGINE: v2.1</div>
        </div>
      </div>

      {/* Corner brackets */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        width: 30,
        height: 30,
        borderTop: `2px solid ${primaryColor}`,
        borderLeft: `2px solid ${primaryColor}`,
        opacity: 0.5,
        zIndex: 101,
      }} />
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderTop: `2px solid ${primaryColor}`,
        borderRight: `2px solid ${primaryColor}`,
        opacity: 0.5,
        zIndex: 101,
      }} />
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        width: 30,
        height: 30,
        borderBottom: `2px solid ${primaryColor}`,
        borderLeft: `2px solid ${primaryColor}`,
        opacity: 0.5,
        zIndex: 101,
      }} />
      <div style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 30,
        height: 30,
        borderBottom: `2px solid ${primaryColor}`,
        borderRight: `2px solid ${primaryColor}`,
        opacity: 0.5,
        zIndex: 101,
      }} />
    </>
  )
}

/**
 * Split screen video display.
 */
function SplitScreenVideo({
  videoElement,
  isPlaying,
  splitMode,
  splitPosition,
}: {
  videoElement: HTMLVideoElement | null
  isPlaying: boolean
  splitMode: string
  splitPosition: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!videoElement || !canvasRef.current || splitMode === 'none') return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const draw = () => {
      if (videoElement.readyState >= 2) {
        const vw = videoElement.videoWidth || 320
        const vh = videoElement.videoHeight || 240

        // Calculate display dimensions maintaining aspect ratio
        const containerWidth = window.innerWidth
        const containerHeight = window.innerHeight
        const videoAspect = vw / vh
        const containerAspect = containerWidth / containerHeight

        let displayWidth, displayHeight
        if (videoAspect > containerAspect) {
          displayWidth = containerWidth
          displayHeight = containerWidth / videoAspect
        } else {
          displayHeight = containerHeight
          displayWidth = containerHeight * videoAspect
        }

        canvas.width = displayWidth
        canvas.height = displayHeight

        // Clear canvas to transparent
        ctx.clearRect(0, 0, displayWidth, displayHeight)

        // Draw video based on split mode
        if (splitMode === 'left') {
          const splitX = displayWidth * splitPosition
          ctx.drawImage(videoElement, 0, 0, vw * splitPosition, vh, 0, 0, splitX, displayHeight)
        } else if (splitMode === 'right') {
          const splitX = displayWidth * splitPosition
          ctx.drawImage(videoElement, vw * splitPosition, 0, vw * (1 - splitPosition), vh, splitX, 0, displayWidth - splitX, displayHeight)
        } else if (splitMode === 'diagonal') {
          // Draw full video then mask
          ctx.drawImage(videoElement, 0, 0, displayWidth, displayHeight)
          ctx.globalCompositeOperation = 'destination-in'
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(displayWidth * splitPosition, 0)
          ctx.lineTo(0, displayHeight)
          ctx.closePath()
          ctx.fill()
          ctx.globalCompositeOperation = 'source-over'
        }
      }
      if (isPlaying) {
        animationId = requestAnimationFrame(draw)
      }
    }

    if (isPlaying || splitMode !== 'none') {
      draw()
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [videoElement, isPlaying, splitMode, splitPosition])

  if (splitMode === 'none') return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '100%',
        maxHeight: '100%',
        zIndex: 50,
        background: 'transparent',
      }}
    />
  )
}

/**
 * Main app component.
 */
export default function DataAestheticApp() {
  const containerRef = useRef<HTMLDivElement>(null)
  const flowFieldRef = useRef<FlowField | null>(null)
  const particleSystemRef = useRef<ParticleSystem | null>(null)
  const lineTracerRef = useRef<LineTracer | null>(null)
  const numberFieldRef = useRef<NumberField | null>(null)
  const numberGridRef = useRef<NumberGrid | null>(null)
  const dataScanLinesRef = useRef<DataScanLines | null>(null)
  const loopTracerRef = useRef<LoopTracer | null>(null)

  const [isInitialized, setIsInitialized] = useState(false)
  const [flowMagnitude, setFlowMagnitude] = useState(0)

  const {
    isPlaying,
    isLoaded,
    currentTime,
    duration,
    loadVideo,
    play,
    pause,
    seek,
    getVideoElement,
  } = useVideoSource()

  // Leva controls
  const {
    // Visual style
    colorPreset,
    splitMode,
    splitPosition,
    showHUD,
    scanlineOpacity,
    scanlineDensity,
    gridOpacity,
    gridSize,
    // Subject isolation
    luminanceMin,
    luminanceMax,
    magnitudeMin,
    edgeWeight,
    saturationMin,
    invertLuminance,
    temporalSmooth,
    spatialSmooth,
    // Particles
    particleMode,
    particleShape,
    particleCount,
    particleSize,
    particleSpeed,
    particleTrails,
    particleOpacity,
    particleGlow,
    particleAdditive,
    // Lines
    lineCount,
    lineWidth,
    lineLength,
    lineSpeed,
    lineOpacity,
    lineGlow,
    // Data Aesthetic (FB style)
    showNumberGrid,
    numberGridColumns,
    numberGridRows,
    numberGridType,
    numberGridFontSize,
    showDataScanLines,
    dataScanLineCount,
    showLoopTracer,
    loopTracerCount,
    loopTracerShowMarkers,
    // Effects
    bloomIntensity,
    bloomThreshold,
    bloomRadius,
    chromaticAberration,
    vignetteIntensity,
    vignetteDarkness,
    noiseIntensity,
    glitchEnabled,
    glitchStrength,
    dotScreenEnabled,
    dotScreenScale,
    pixelationEnabled,
    pixelationGranularity,
    hueSaturation,
  } = useControls({
    'Visual Style': folder({
      colorPreset: {
        value: 'cyberpunk',
        options: ['cyberpunk', 'matrix', 'synthwave', 'ice', 'fire', 'custom'],
        label: 'Color Preset',
      },
      splitMode: {
        value: 'none',
        options: ['none', 'left', 'right', 'diagonal'],
        label: 'Split Screen',
      },
      splitPosition: { value: 0.5, min: 0.2, max: 0.8, step: 0.05, label: 'Split Position' },
      showHUD: { value: true, label: 'Show HUD' },
      scanlineOpacity: { value: 0, min: 0, max: 1, step: 0.1, label: 'Scanlines' },
      scanlineDensity: { value: 2, min: 1, max: 4, step: 1, label: 'Scanline Density' },
      gridOpacity: { value: 0, min: 0, max: 1, step: 0.1, label: 'Grid' },
      gridSize: { value: 50, min: 20, max: 100, step: 10, label: 'Grid Size' },
    }, { collapsed: false }),
    'Subject Isolation': folder({
      luminanceMin: { value: 0, min: 0, max: 1, step: 0.01, label: 'Brightness Min' },
      luminanceMax: { value: 1.0, min: 0, max: 1, step: 0.01, label: 'Brightness Max' },
      magnitudeMin: { value: 0, min: 0, max: 0.3, step: 0.005, label: 'Motion Threshold' },
      edgeWeight: { value: 0, min: 0, max: 1, step: 0.05, label: 'Edge Focus' },
      saturationMin: { value: 0, min: 0, max: 1, step: 0.05, label: 'Color Min' },
      invertLuminance: { value: false, label: 'Invert (dark subject)' },
      temporalSmooth: { value: 0, min: 0, max: 1, step: 0.05, label: 'Temporal' },
      spatialSmooth: { value: 0, min: 0, max: 1, step: 0.05, label: 'Spatial' },
    }, { collapsed: true }),
    'Particles': folder({
      particleMode: {
        value: 'reveal',
        options: ['flow', 'reveal'],
        label: 'Mode',
      },
      particleShape: {
        value: 'circle',
        options: ['circle', 'soft', 'square', 'ring', 'star'],
        label: 'Shape',
      },
      particleCount: { value: 50000, min: 1000, max: 100000, step: 1000 },
      particleSize: { value: 3.0, min: 0.5, max: 10, step: 0.1 },
      particleSpeed: { value: 1.5, min: 0.1, max: 5.0, step: 0.1 },
      particleTrails: { value: 0.5, min: 0, max: 1, step: 0.05, label: 'Trail Persistence' },
      particleOpacity: { value: 1.0, min: 0, max: 1, step: 0.05, label: 'Opacity' },
      particleGlow: { value: 0.5, min: 0, max: 2, step: 0.1, label: 'Glow' },
      particleAdditive: { value: true, label: 'Additive Blend' },
    }, { collapsed: false }),
    'Lines': folder({
      lineCount: { value: 500, min: 50, max: 1000, step: 50 },
      lineWidth: { value: 2.0, min: 0.5, max: 5, step: 0.5 },
      lineLength: { value: 50, min: 10, max: 100, step: 5, label: 'Trail Length' },
      lineSpeed: { value: 0.3, min: 0.1, max: 1.0, step: 0.05, label: 'Speed' },
      lineOpacity: { value: 1.0, min: 0, max: 1, step: 0.05, label: 'Opacity' },
      lineGlow: { value: 1.2, min: 0.5, max: 3, step: 0.1, label: 'Glow' },
    }, { collapsed: false }),
    'Data Aesthetic': folder({
      showNumberGrid: { value: false, label: 'Number Grid' },
      numberGridColumns: { value: 30, min: 10, max: 60, step: 5, label: 'Columns' },
      numberGridRows: { value: 20, min: 5, max: 40, step: 5, label: 'Rows' },
      numberGridType: {
        value: 'digits',
        options: ['digits', 'binary', 'hex', 'coordinates'],
        label: 'Number Type',
      },
      numberGridFontSize: { value: 14, min: 8, max: 24, step: 1, label: 'Font Size' },
      showDataScanLines: { value: false, label: 'Scan Lines' },
      dataScanLineCount: { value: 8, min: 3, max: 20, step: 1, label: 'Line Count' },
      showLoopTracer: { value: false, label: 'Loop Tracer' },
      loopTracerCount: { value: 5, min: 1, max: 10, step: 1, label: 'Loop Count' },
      loopTracerShowMarkers: { value: true, label: 'Show Markers' },
    }, { collapsed: false }),
    'Effects': folder({
      bloomIntensity: { value: 2.0, min: 0, max: 5, step: 0.1, label: 'Bloom' },
      bloomThreshold: { value: 0.1, min: 0, max: 1, step: 0.05, label: 'Bloom Threshold' },
      bloomRadius: { value: 1.0, min: 0, max: 2, step: 0.1, label: 'Bloom Radius' },
      chromaticAberration: { value: 0.5, min: 0, max: 2, step: 0.1, label: 'Chromatic' },
      vignetteIntensity: { value: 0, min: 0, max: 1, step: 0.05, label: 'Vignette' },
      vignetteDarkness: { value: 0.5, min: 0, max: 1, step: 0.05, label: 'Vignette Dark' },
      noiseIntensity: { value: 0, min: 0, max: 1, step: 0.05, label: 'Film Grain' },
      glitchEnabled: { value: false, label: 'Glitch' },
      glitchStrength: { value: 0.5, min: 0.1, max: 2, step: 0.1, label: 'Glitch Strength' },
      dotScreenEnabled: { value: false, label: 'Halftone' },
      dotScreenScale: { value: 1.5, min: 0.5, max: 5, step: 0.1, label: 'Halftone Scale' },
      pixelationEnabled: { value: false, label: 'Pixelate' },
      pixelationGranularity: { value: 5, min: 1, max: 20, step: 1, label: 'Pixel Size' },
      hueSaturation: { value: 0, min: -1, max: 1, step: 0.05, label: 'Saturation' },
    }, { collapsed: false }),
  })

  // Color presets
  const colorPresets: Record<string, { primary: string; secondary: string; bg: string }> = {
    cyberpunk: { primary: '#00ffaa', secondary: '#00aaff', bg: '#0a0a0f' },
    matrix: { primary: '#00ff00', secondary: '#00aa00', bg: '#000a00' },
    synthwave: { primary: '#ff00ff', secondary: '#00ffff', bg: '#1a0020' },
    ice: { primary: '#88ccff', secondary: '#ffffff', bg: '#0a1020' },
    fire: { primary: '#ff6600', secondary: '#ffaa00', bg: '#100500' },
    custom: { primary: '#00ffaa', secondary: '#00aaff', bg: '#0a0a0f' },
  }

  const currentColors = colorPresets[colorPreset] || colorPresets.cyberpunk

  // Action buttons
  useControls({
    'Actions': folder({
      'Load Sample Video': button(() => {
        loadVideo('/samples/jellyfish.mp4')
      }),
      'Reset': button(() => {
        flowFieldRef.current?.reset()
        particleSystemRef.current?.reset()
        lineTracerRef.current?.reset()
        numberFieldRef.current?.reset()
      }),
    }),
  })

  // Initialize systems
  useEffect(() => {
    const flowField = new FlowField(128, 128)
    const particleSystem = new ParticleSystem({
      count: particleCount,
      size: particleSize,
      color: new THREE.Color(currentColors.primary),
      speed: particleSpeed,
      mode: 'reveal',  // Default to reveal mode
    })
    const lineTracer = new LineTracer({
      count: lineCount,
      width: lineWidth,
      color: new THREE.Color(currentColors.secondary),
    })
    const numberField = new NumberField({
      color: new THREE.Color(currentColors.primary),
    })
    const numberGrid = new NumberGrid({
      color: new THREE.Color(currentColors.primary),
    })
    const dataScanLines = new DataScanLines({
      color: new THREE.Color(currentColors.primary),
    })
    const loopTracer = new LoopTracer({
      color: new THREE.Color(currentColors.secondary),
    })

    flowFieldRef.current = flowField
    particleSystemRef.current = particleSystem
    lineTracerRef.current = lineTracer
    numberFieldRef.current = numberField
    numberGridRef.current = numberGrid
    dataScanLinesRef.current = dataScanLines
    loopTracerRef.current = loopTracer

    // Mount DOM-based visualizations to container
    if (containerRef.current) {
      numberField.mount(containerRef.current)
      numberGrid.mount(containerRef.current)
      dataScanLines.mount(containerRef.current)
      loopTracer.mount(containerRef.current)
    }

    setIsInitialized(true)

    return () => {
      particleSystem.dispose()
      lineTracer.dispose()
      numberField.dispose()
      numberGrid.dispose()
      dataScanLines.dispose()
      loopTracer.dispose()
    }
  }, []) // Only run once on mount

  // Update particle system when controls change
  useEffect(() => {
    if (particleSystemRef.current) {
      // Calculate decay from trail persistence (0 = fast decay, 1 = slow decay)
      // decay of 0.98 = short trails, 0.998 = long trails
      const decay = 0.96 + particleTrails * 0.035

      particleSystemRef.current.setConfig({
        size: particleSize,
        color: new THREE.Color(currentColors.primary),
        speed: particleSpeed,
        decay: decay,
        mode: particleMode as ParticleMode,
        shape: particleShape as ParticleShape,
        opacity: particleOpacity,
        glow: particleGlow,
        additive: particleAdditive,
      })
    }
  }, [particleSize, currentColors.primary, particleSpeed, particleTrails, particleMode, particleShape, particleOpacity, particleGlow, particleAdditive])

  // Update line tracer when controls change
  useEffect(() => {
    if (lineTracerRef.current) {
      lineTracerRef.current.setConfig({
        width: lineWidth,
        color: new THREE.Color(currentColors.secondary),
        maxLength: lineLength,
        speed: lineSpeed,
        opacity: lineOpacity,
        glow: lineGlow,
      })
    }
  }, [lineWidth, currentColors.secondary, lineLength, lineSpeed, lineOpacity, lineGlow])

  useEffect(() => {
    if (numberFieldRef.current) {
      numberFieldRef.current.setColor(new THREE.Color(currentColors.primary))
    }
    if (numberGridRef.current) {
      numberGridRef.current.setColor(new THREE.Color(currentColors.primary))
    }
    if (dataScanLinesRef.current) {
      dataScanLinesRef.current.setColor(new THREE.Color(currentColors.primary))
    }
    if (loopTracerRef.current) {
      loopTracerRef.current.setColor(new THREE.Color(currentColors.secondary))
    }
  }, [currentColors.primary, currentColors.secondary])

  // Update Data Aesthetic components when controls change
  useEffect(() => {
    if (numberGridRef.current) {
      numberGridRef.current.setConfig({
        columns: numberGridColumns,
        rows: numberGridRows,
        numberType: numberGridType as 'digits' | 'binary' | 'hex' | 'coordinates',
        fontSize: numberGridFontSize,
      })
    }
  }, [numberGridColumns, numberGridRows, numberGridType, numberGridFontSize])

  useEffect(() => {
    if (dataScanLinesRef.current) {
      dataScanLinesRef.current.setConfig({
        count: dataScanLineCount,
      })
    }
  }, [dataScanLineCount])

  useEffect(() => {
    if (loopTracerRef.current) {
      loopTracerRef.current.setConfig({
        count: loopTracerCount,
        showMarkers: loopTracerShowMarkers,
      })
    }
  }, [loopTracerCount, loopTracerShowMarkers])

  // Apply subject isolation filter changes
  useEffect(() => {
    if (flowFieldRef.current) {
      flowFieldRef.current.setFilter({
        luminanceMin,
        luminanceMax,
        magnitudeMin,
        edgeWeight,
        saturationMin,
        invertLuminance,
        temporalSmooth,
        spatialSmooth,
      })
    }
  }, [luminanceMin, luminanceMax, magnitudeMin, edgeWeight, saturationMin, invertLuminance, temporalSmooth, spatialSmooth])

  // Video processing loop
  useEffect(() => {
    if (!isPlaying || !flowFieldRef.current) return

    let animationId: number
    const videoElement = getVideoElement()

    const processFrame = () => {
      if (videoElement && videoElement.readyState >= 2) {
        flowFieldRef.current?.updateFromVideo(videoElement)

        const dt = 1 / 60

        // Update number field if visible
        if (numberFieldRef.current) {
          numberFieldRef.current.update(flowFieldRef.current!, dt)
        }

        // Update Data Aesthetic components
        if (showNumberGrid && numberGridRef.current && flowFieldRef.current) {
          numberGridRef.current.update(flowFieldRef.current)
        }

        if (showDataScanLines && dataScanLinesRef.current && flowFieldRef.current) {
          dataScanLinesRef.current.update(flowFieldRef.current, dt)
        }

        if (showLoopTracer && loopTracerRef.current && flowFieldRef.current) {
          loopTracerRef.current.update(flowFieldRef.current, dt)
        }

        // Sample flow magnitude for HUD
        const sample = flowFieldRef.current?.sampleFlow(0.5, 0.5)
        if (sample) {
          setFlowMagnitude(sample.mag)
        }
      }
      animationId = requestAnimationFrame(processFrame)
    }

    processFrame()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isPlaying, getVideoElement])

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      loadVideo(file)
    }
  }, [loadVideo])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: currentColors.bg,
        overflow: 'hidden',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Split screen video */}
      <SplitScreenVideo
        videoElement={getVideoElement()}
        isPlaying={isPlaying}
        splitMode={splitMode}
        splitPosition={splitPosition}
      />

      {/* Particle visualization */}
      {isInitialized && flowFieldRef.current && particleSystemRef.current && lineTracerRef.current && (
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 100 }}
          gl={{ alpha: true, antialias: true }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 60,
            background: 'transparent',
          }}
        >

          <VisualizationScene
            flowField={flowFieldRef.current}
            particleSystem={particleSystemRef.current}
            lineTracer={lineTracerRef.current}
          />

          <Effects
            bloomIntensity={bloomIntensity}
            bloomThreshold={bloomThreshold}
            bloomRadius={bloomRadius}
            chromaticAberration={chromaticAberration}
            vignetteIntensity={vignetteIntensity}
            vignetteDarkness={vignetteDarkness}
            noiseIntensity={noiseIntensity}
            glitchEnabled={glitchEnabled}
            glitchStrength={glitchStrength}
            dotScreenEnabled={dotScreenEnabled}
            dotScreenScale={dotScreenScale}
            pixelationEnabled={pixelationEnabled}
            pixelationGranularity={pixelationGranularity}
            hueSaturation={hueSaturation}
          />
        </Canvas>
      )}

      {/* Visual overlays */}
      <GridOverlay opacity={gridOpacity} size={gridSize} />
      <ScanlinesOverlay opacity={scanlineOpacity} density={scanlineDensity} />

      {/* HUD */}
      <HUDOverlay
        show={showHUD}
        particleCount={particleCount}
        flowMagnitude={flowMagnitude}
        primaryColor={currentColors.primary}
      />

      {/* Drop zone indicator when no video loaded */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: currentColors.primary,
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 200,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⬆</div>
          <div style={{ fontSize: 16, fontFamily: 'monospace' }}>DROP VIDEO FILE</div>
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6, fontFamily: 'monospace' }}>
            or click &quot;Load Sample Video&quot; in controls
          </div>
        </div>
      )}

      {/* Playback controls */}
      {isLoaded && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '10px 20px',
            borderRadius: 8,
            border: `1px solid ${currentColors.primary}40`,
            zIndex: 200,
          }}
        >
          <button
            onClick={isPlaying ? pause : play}
            style={{
              background: `${currentColors.primary}33`,
              border: `1px solid ${currentColors.primary}80`,
              color: currentColors.primary,
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            style={{
              width: 200,
              accentColor: currentColors.primary,
            }}
          />

          <span style={{
            color: currentColors.primary,
            fontFamily: 'monospace',
            fontSize: 10,
            opacity: 0.7,
          }}>
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  )
}
