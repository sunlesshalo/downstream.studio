import * as THREE from 'three'
import { FlowField } from './FlowField'

export interface DataScanLinesConfig {
  count: number
  color: THREE.Color
  opacity: number
  dashLength: number
  gapLength: number
  thickness: number
  animated: boolean
  speed: number
}

const DEFAULT_CONFIG: DataScanLinesConfig = {
  count: 8,
  color: new THREE.Color(0x00ffaa),
  opacity: 0.6,
  dashLength: 10,
  gapLength: 8,
  thickness: 1,
  animated: true,
  speed: 0.5,
}

interface ScanLine {
  y: number           // Y position (0-1)
  offset: number      // Dash offset for animation
  intensity: number   // Based on motion at this Y level
}

/**
 * Horizontal dotted scan lines that connect video to data visualization.
 * Lines brighten where motion is detected.
 */
export class DataScanLines {
  private config: DataScanLinesConfig
  private container: HTMLDivElement | null = null
  private lines: ScanLine[] = []
  private time: number = 0

  constructor(config: Partial<DataScanLinesConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initLines()
  }

  /**
   * Initialize scan lines.
   */
  private initLines(): void {
    this.lines = []
    const { count } = this.config

    for (let i = 0; i < count; i++) {
      this.lines.push({
        y: (i + 0.5) / count,  // Evenly distributed
        offset: Math.random() * 100,
        intensity: 0.3,
      })
    }
  }

  /**
   * Mount to container.
   */
  mount(container: HTMLElement): void {
    this.container = document.createElement('div')
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 65;
    `
    container.appendChild(this.container)
  }

  /**
   * Update scan lines based on flow field.
   */
  update(flowField: FlowField, deltaTime: number): void {
    if (!this.container) return

    this.time += deltaTime

    // Update line intensities based on motion
    for (const line of this.lines) {
      // Sample motion across the horizontal line
      let totalMotion = 0
      const samples = 20
      for (let i = 0; i < samples; i++) {
        const x = i / (samples - 1)
        const flow = flowField.sampleFlow(x, line.y)
        totalMotion += flow.mag
      }
      const avgMotion = totalMotion / samples

      // Smooth transition
      const targetIntensity = 0.2 + avgMotion * 3
      line.intensity = line.intensity * 0.9 + targetIntensity * 0.1

      // Animate dash offset
      if (this.config.animated) {
        line.offset += this.config.speed * deltaTime * 60
      }
    }

    this.render()
  }

  /**
   * Render scan lines to DOM.
   */
  private render(): void {
    if (!this.container) return

    this.container.innerHTML = ''

    const colorHex = '#' + this.config.color.getHexString()
    const { dashLength, gapLength, thickness, opacity } = this.config

    for (const line of this.lines) {
      const el = document.createElement('div')
      const screenY = line.y * 100
      const alpha = Math.min(1, line.intensity) * opacity

      // Create dashed line using CSS
      el.style.cssText = `
        position: absolute;
        left: 0;
        right: 0;
        top: ${screenY}%;
        height: ${thickness}px;
        background: repeating-linear-gradient(
          90deg,
          ${colorHex} 0px,
          ${colorHex} ${dashLength}px,
          transparent ${dashLength}px,
          transparent ${dashLength + gapLength}px
        );
        background-position: ${line.offset}px 0;
        opacity: ${alpha};
        box-shadow: 0 0 ${4 * line.intensity}px ${colorHex};
      `

      this.container.appendChild(el)
    }
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
  setConfig(config: Partial<DataScanLinesConfig>): void {
    const needsReinit = config.count !== undefined && config.count !== this.config.count
    Object.assign(this.config, config)
    if (needsReinit) {
      this.initLines()
    }
  }

  /**
   * Reset lines.
   */
  reset(): void {
    this.initLines()
  }

  /**
   * Dispose.
   */
  dispose(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }
    this.container = null
    this.lines = []
  }
}
