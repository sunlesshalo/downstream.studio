import * as THREE from 'three'
import { FlowField } from './FlowField'

export interface LineConfig {
  count: number
  maxLength: number
  width: number
  color: THREE.Color
  fadeSpeed: number
  speed: number
  opacity: number
  glow: number
}

const DEFAULT_CONFIG: LineConfig = {
  count: 500,
  maxLength: 50,
  width: 1.5,
  color: new THREE.Color(0x00aaff),
  fadeSpeed: 0.02,
  speed: 0.3,
  opacity: 1.0,
  glow: 1.2,
}

interface TraceLine {
  points: THREE.Vector2[]
  age: number
  active: boolean
}

/**
 * Traces lines through a flow field, creating vector visualization.
 */
export class LineTracer {
  private config: LineConfig
  private lines: TraceLine[]
  private geometry: THREE.BufferGeometry
  private material: THREE.LineBasicMaterial
  private lineSegments: THREE.LineSegments
  private positions: Float32Array
  private colors: Float32Array

  constructor(config: Partial<LineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Initialize lines
    this.lines = []
    for (let i = 0; i < this.config.count; i++) {
      this.lines.push({
        points: [new THREE.Vector2(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        )],
        age: Math.random(),
        active: true,
      })
    }

    // Create geometry for line segments
    // Each line can have maxLength points, meaning maxLength-1 segments
    // Each segment needs 2 vertices
    const maxVertices = this.config.count * (this.config.maxLength - 1) * 2
    this.positions = new Float32Array(maxVertices * 3)
    this.colors = new Float32Array(maxVertices * 4)

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 4))
    this.geometry.setDrawRange(0, 0) // Start with nothing drawn

    this.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      linewidth: this.config.width,
    })

    this.lineSegments = new THREE.LineSegments(this.geometry, this.material)
  }

  /**
   * Update line traces based on flow field.
   */
  update(flowField: FlowField, deltaTime: number): void {
    const speed = this.config.speed
    const maxLength = this.config.maxLength
    const fadeSpeed = this.config.fadeSpeed

    for (const line of this.lines) {
      if (!line.active) continue

      // Age the line
      line.age -= fadeSpeed * deltaTime * 60

      // Respawn if too old
      if (line.age <= 0) {
        line.points = [new THREE.Vector2(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        )]
        line.age = 1.0
        continue
      }

      // Get current head position
      const head = line.points[line.points.length - 1]

      // Sample flow at head position (flip Y for video coordinates)
      const nx = (head.x + 1) / 2
      const ny = 1 - (head.y + 1) / 2
      const flow = flowField.sampleFlow(nx, ny)

      // Move head based on flow (flip dy for coordinate system)
      const newHead = new THREE.Vector2(
        head.x + flow.dx * speed * deltaTime * 60 * 5,
        head.y + -flow.dy * speed * deltaTime * 60 * 5
      )

      // Check bounds
      if (Math.abs(newHead.x) > 1.2 || Math.abs(newHead.y) > 1.2) {
        // Respawn
        line.points = [new THREE.Vector2(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        )]
        line.age = 1.0
        continue
      }

      // Add new point
      line.points.push(newHead)

      // Trim if too long
      if (line.points.length > maxLength) {
        line.points.shift()
      }
    }

    // Rebuild geometry
    this.rebuildGeometry()
  }

  /**
   * Rebuild line segment geometry from current line state.
   */
  private rebuildGeometry(): void {
    let vertexIndex = 0
    const color = this.config.color
    const opacity = this.config.opacity
    const glow = this.config.glow

    for (const line of this.lines) {
      if (!line.active || line.points.length < 2) continue

      for (let i = 0; i < line.points.length - 1; i++) {
        const p1 = line.points[i]
        const p2 = line.points[i + 1]

        // Calculate alpha based on position in line and overall age
        const segmentProgress = i / (line.points.length - 1)
        const alpha = line.age * segmentProgress * 0.8 * opacity

        // Apply glow to color (brighter than 1.0 for bloom effect)
        const glowR = Math.min(color.r * glow, 1.5)
        const glowG = Math.min(color.g * glow, 1.5)
        const glowB = Math.min(color.b * glow, 1.5)

        // First vertex (tail - dimmer)
        this.positions[vertexIndex * 3 + 0] = p1.x
        this.positions[vertexIndex * 3 + 1] = p1.y
        this.positions[vertexIndex * 3 + 2] = 0
        this.colors[vertexIndex * 4 + 0] = color.r
        this.colors[vertexIndex * 4 + 1] = color.g
        this.colors[vertexIndex * 4 + 2] = color.b
        this.colors[vertexIndex * 4 + 3] = alpha
        vertexIndex++

        // Second vertex (head - brighter with glow)
        this.positions[vertexIndex * 3 + 0] = p2.x
        this.positions[vertexIndex * 3 + 1] = p2.y
        this.positions[vertexIndex * 3 + 2] = 0
        this.colors[vertexIndex * 4 + 0] = glowR
        this.colors[vertexIndex * 4 + 1] = glowG
        this.colors[vertexIndex * 4 + 2] = glowB
        this.colors[vertexIndex * 4 + 3] = alpha * glow
        vertexIndex++
      }
    }

    this.geometry.setDrawRange(0, vertexIndex)
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<LineConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * Set line color.
   */
  setColor(color: THREE.Color): void {
    this.config.color = color
  }

  /**
   * Get the Three.js object.
   */
  getObject(): THREE.LineSegments {
    return this.lineSegments
  }

  /**
   * Reset all lines.
   */
  reset(): void {
    for (const line of this.lines) {
      line.points = [new THREE.Vector2(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      )]
      line.age = Math.random()
    }
    this.rebuildGeometry()
  }

  /**
   * Dispose of resources.
   */
  dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
  }
}
