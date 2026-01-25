import * as THREE from 'three'
import { FlowField } from './FlowField'

export interface LoopTracerConfig {
  count: number
  color: THREE.Color
  opacity: number
  lineWidth: number
  showMarkers: boolean
  markerSize: number
  smoothing: number
}

const DEFAULT_CONFIG: LoopTracerConfig = {
  count: 5,
  color: new THREE.Color(0xffffff),
  opacity: 0.8,
  lineWidth: 1.5,
  showMarkers: true,
  markerSize: 6,
  smoothing: 0.3,
}

interface LoopPath {
  points: THREE.Vector2[]
  age: number
  active: boolean
  targetCenter: THREE.Vector2
  currentCenter: THREE.Vector2
  radius: number
  angle: number
  angularSpeed: number
}

/**
 * Creates curved loop lines that trace around motion boundaries.
 * Each loop orbits around detected motion centers.
 */
export class LoopTracer {
  private config: LoopTracerConfig
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private loops: LoopPath[] = []
  private motionCenters: THREE.Vector2[] = []

  constructor(config: Partial<LoopTracerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initLoops()
  }

  /**
   * Initialize loop paths.
   */
  private initLoops(): void {
    this.loops = []
    for (let i = 0; i < this.config.count; i++) {
      this.loops.push({
        points: [],
        age: Math.random(),
        active: false,
        targetCenter: new THREE.Vector2(0.5, 0.5),
        currentCenter: new THREE.Vector2(0.5, 0.5),
        radius: 0.05 + Math.random() * 0.1,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: 0.5 + Math.random() * 1.0,
      })
    }
  }

  /**
   * Mount to container.
   */
  mount(container: HTMLElement): void {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 68;
    `
    container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.resize()

    // Handle resize
    window.addEventListener('resize', () => this.resize())
  }

  /**
   * Resize canvas to match container.
   */
  private resize(): void {
    if (!this.canvas) return
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  /**
   * Find motion centers from flow field.
   */
  private findMotionCenters(flowField: FlowField): THREE.Vector2[] {
    const centers: THREE.Vector2[] = []
    const gridSize = 10
    const threshold = 0.05

    // Find regions with high motion
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const nx = (x + 0.5) / gridSize
        const ny = (y + 0.5) / gridSize
        const flow = flowField.sampleFlow(nx, ny)

        if (flow.mag > threshold) {
          centers.push(new THREE.Vector2(nx, ny))
        }
      }
    }

    // Cluster nearby centers
    const clustered: THREE.Vector2[] = []
    const clusterDist = 0.15

    for (const center of centers) {
      let merged = false
      for (const existing of clustered) {
        if (center.distanceTo(existing) < clusterDist) {
          existing.lerp(center, 0.5)
          merged = true
          break
        }
      }
      if (!merged && clustered.length < this.config.count) {
        clustered.push(center.clone())
      }
    }

    return clustered
  }

  /**
   * Update loop tracers.
   */
  update(flowField: FlowField, deltaTime: number): void {
    if (!this.canvas || !this.ctx) return

    // Find current motion centers
    this.motionCenters = this.findMotionCenters(flowField)

    // Update each loop
    for (let i = 0; i < this.loops.length; i++) {
      const loop = this.loops[i]

      // Assign to a motion center if available
      if (i < this.motionCenters.length) {
        loop.active = true
        loop.targetCenter.copy(this.motionCenters[i])
      } else {
        loop.active = false
      }

      if (loop.active) {
        // Smoothly move toward target center
        loop.currentCenter.lerp(loop.targetCenter, this.config.smoothing)

        // Rotate around center
        loop.angle += loop.angularSpeed * deltaTime

        // Build path points (elliptical orbit)
        loop.points = []
        const segments = 32
        for (let j = 0; j <= segments; j++) {
          const t = (j / segments) * Math.PI * 2
          const rx = loop.radius * (1 + 0.3 * Math.sin(t * 2))  // Slightly elliptical
          const ry = loop.radius * (1 + 0.2 * Math.cos(t * 3))
          const x = loop.currentCenter.x + Math.cos(t + loop.angle) * rx
          const y = loop.currentCenter.y + Math.sin(t + loop.angle) * ry
          loop.points.push(new THREE.Vector2(x, y))
        }

        // Age decay
        loop.age = Math.min(1, loop.age + deltaTime * 2)
      } else {
        loop.age *= 0.95
      }
    }

    this.render()
  }

  /**
   * Render loops to canvas.
   */
  private render(): void {
    if (!this.canvas || !this.ctx) return

    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    // Clear
    ctx.clearRect(0, 0, w, h)

    const colorHex = '#' + this.config.color.getHexString()

    for (const loop of this.loops) {
      if (loop.points.length < 2 || loop.age < 0.1) continue

      const alpha = loop.age * this.config.opacity

      // Draw path
      ctx.beginPath()
      ctx.strokeStyle = colorHex
      ctx.lineWidth = this.config.lineWidth
      ctx.globalAlpha = alpha

      const first = loop.points[0]
      ctx.moveTo(first.x * w, first.y * h)

      for (let i = 1; i < loop.points.length; i++) {
        const p = loop.points[i]
        ctx.lineTo(p.x * w, p.y * h)
      }

      ctx.stroke()

      // Draw markers at key points
      if (this.config.showMarkers) {
        const markerIndices = [0, Math.floor(loop.points.length / 4), Math.floor(loop.points.length / 2), Math.floor(loop.points.length * 3 / 4)]

        for (const idx of markerIndices) {
          if (idx < loop.points.length) {
            const p = loop.points[idx]
            const ms = this.config.markerSize

            // Draw small square marker
            ctx.fillStyle = colorHex
            ctx.globalAlpha = alpha
            ctx.fillRect(p.x * w - ms / 2, p.y * h - ms / 2, ms, ms)

            // Draw marker outline
            ctx.strokeStyle = colorHex
            ctx.lineWidth = 1
            ctx.globalAlpha = alpha * 0.5
            ctx.strokeRect(p.x * w - ms, p.y * h - ms, ms * 2, ms * 2)
          }
        }
      }

      // Draw data labels near markers
      if (this.config.showMarkers && loop.points.length > 0) {
        ctx.font = '10px monospace'
        ctx.fillStyle = colorHex
        ctx.globalAlpha = alpha * 0.7

        const labelPoint = loop.points[Math.floor(loop.points.length / 4)]
        if (labelPoint) {
          const labelX = labelPoint.x * w + 15
          const labelY = labelPoint.y * h
          ctx.fillText((loop.age * 10).toFixed(2), labelX, labelY)
        }
      }
    }

    ctx.globalAlpha = 1
  }

  /**
   * Set color.
   */
  setColor(color: THREE.Color): void {
    this.config.color = color
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<LoopTracerConfig>): void {
    const needsReinit = config.count !== undefined && config.count !== this.config.count
    Object.assign(this.config, config)
    if (needsReinit) {
      this.initLoops()
    }
  }

  /**
   * Reset.
   */
  reset(): void {
    this.initLoops()
  }

  /**
   * Dispose.
   */
  dispose(): void {
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas)
    }
    this.canvas = null
    this.ctx = null
    this.loops = []
  }
}
