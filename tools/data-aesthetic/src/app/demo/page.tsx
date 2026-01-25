'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import { FlowField, ParticleSystem, LineTracer } from '@/core'

/**
 * Demo visualization scene - pre-configured for recording.
 */
function DemoScene({
  flowField,
  particleSystem,
  lineTracer,
}: {
  flowField: FlowField
  particleSystem: ParticleSystem
  lineTracer: LineTracer
}) {
  const { camera, gl } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 2)
    camera.lookAt(0, 0, 0)
    gl.setClearColor(0x000000, 0)
  }, [camera, gl])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    particleSystem.update(flowField, dt)
    particleSystem.setTime(state.clock.elapsedTime)
    lineTracer.update(flowField, dt)
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
 * Demo effects - chromatic aberration enabled.
 */
function DemoEffects() {
  return (
    <EffectComposer frameBufferType={THREE.HalfFloatType}>
      <Bloom
        intensity={2.5}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.9}
        radius={1.0}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.003, 0.003)}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  )
}

/**
 * Split screen video display - right side only.
 */
function SplitScreenRight({
  videoElement,
  isPlaying,
}: {
  videoElement: HTMLVideoElement | null
  isPlaying: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!videoElement || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const draw = () => {
      if (videoElement.readyState >= 2) {
        const vw = videoElement.videoWidth || 320
        const vh = videoElement.videoHeight || 240

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

        ctx.clearRect(0, 0, displayWidth, displayHeight)

        // Right side split at 50%
        const splitPosition = 0.5
        const splitX = displayWidth * splitPosition
        ctx.drawImage(
          videoElement,
          vw * splitPosition, 0, vw * (1 - splitPosition), vh,
          splitX, 0, displayWidth - splitX, displayHeight
        )
      }
      if (isPlaying) {
        animationId = requestAnimationFrame(draw)
      }
    }

    if (isPlaying) {
      draw()
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [videoElement, isPlaying])

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
 * Demo page - auto-loads video, auto-plays, flow mode, split screen right, chromatic effects.
 * No Leva panel - clean for recording.
 */
export default function DemoPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const flowFieldRef = useRef<FlowField | null>(null)
  const particleSystemRef = useRef<ParticleSystem | null>(null)
  const lineTracerRef = useRef<LineTracer | null>(null)

  const [isInitialized, setIsInitialized] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize systems
  useEffect(() => {
    const flowField = new FlowField(128, 128)
    const particleSystem = new ParticleSystem({
      count: 50000,
      size: 3.0,
      color: new THREE.Color('#00ffaa'),
      speed: 1.5,
      mode: 'flow',  // Flow mode for demo
      decay: 0.98,
      turbulence: 0.1,
    })
    const lineTracer = new LineTracer({
      count: 500,
      width: 2.0,
      color: new THREE.Color('#00aaff'),
    })

    flowFieldRef.current = flowField
    particleSystemRef.current = particleSystem
    lineTracerRef.current = lineTracer

    setIsInitialized(true)

    return () => {
      particleSystem.dispose()
      lineTracer.dispose()
    }
  }, [])

  // Auto-load and auto-play video
  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/samples/jellyfish.mp4'
    video.loop = true
    video.muted = true
    video.playsInline = true

    video.onloadeddata = () => {
      videoRef.current = video
      // Auto-play after 1 second
      setTimeout(() => {
        video.play()
        setIsPlaying(true)
      }, 1000)
    }

    video.load()

    return () => {
      video.pause()
      video.src = ''
    }
  }, [])

  // Video processing loop
  useEffect(() => {
    if (!isPlaying || !flowFieldRef.current || !videoRef.current) return

    let animationId: number

    const processFrame = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        flowFieldRef.current?.updateFromVideo(videoRef.current)
      }
      animationId = requestAnimationFrame(processFrame)
    }

    processFrame()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isPlaying])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: '#0a0a0f',
        overflow: 'hidden',
      }}
    >
      {/* Split screen video - right side */}
      <SplitScreenRight
        videoElement={videoRef.current}
        isPlaying={isPlaying}
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
          <DemoScene
            flowField={flowFieldRef.current}
            particleSystem={particleSystemRef.current}
            lineTracer={lineTracerRef.current}
          />
          <DemoEffects />
        </Canvas>
      )}
    </div>
  )
}
