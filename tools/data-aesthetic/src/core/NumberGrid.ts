import * as THREE from 'three'
import { FlowField } from './FlowField'

export interface NumberGridConfig {
  columns: number
  rows: number
  color: THREE.Color
  fontSize: number
  opacity: number
  threshold: number  // Motion threshold to show number
  numberType: 'digits' | 'binary' | 'hex' | 'coordinates'
}

const DEFAULT_CONFIG: NumberGridConfig = {
  columns: 30,
  rows: 20,
  color: new THREE.Color(0x00ffaa),
  fontSize: 14,
  opacity: 1.0,
  threshold: 0.02,
  numberType: 'digits',
}

interface GridCell {
  x: number
  y: number
  value: string
  opacity: number
}

/**
 * Grid-based number display that reveals subject silhouette.
 * Numbers appear where motion is detected, forming the shape.
 */
export class NumberGrid {
  private config: NumberGridConfig
  private container: HTMLDivElement | null = null
  private cells: GridCell[] = []
  private frameCount: number = 0

  constructor(config: Partial<NumberGridConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initCells()
  }

  /**
   * Initialize grid cells.
   */
  private initCells(): void {
    this.cells = []
    const { columns, rows } = this.config

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        this.cells.push({
          x: col / (columns - 1),  // 0 to 1
          y: row / (rows - 1),      // 0 to 1
          value: this.generateValue(col, row),
          opacity: 0,
        })
      }
    }
  }

  /**
   * Generate a value for a cell based on numberType.
   */
  private generateValue(col: number, row: number): string {
    switch (this.config.numberType) {
      case 'binary':
        return Math.floor(Math.random() * 2).toString()
      case 'hex':
        return Math.floor(Math.random() * 16).toString(16).toUpperCase()
      case 'coordinates':
        return `${col},${row}`
      case 'digits':
      default:
        return Math.floor(Math.random() * 10).toString()
    }
  }

  /**
   * Mount the grid to a container element.
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
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
      font-size: ${this.config.fontSize}px;
      font-weight: 600;
      letter-spacing: 0.1em;
      z-index: 70;
    `
    container.appendChild(this.container)
  }

  /**
   * Update grid based on flow field motion.
   */
  update(flowField: FlowField): void {
    if (!this.container) return

    this.frameCount++
    const threshold = this.config.threshold

    // Update cell opacities based on motion
    for (const cell of this.cells) {
      const flow = flowField.sampleFlow(cell.x, cell.y)
      const motionStrength = flow.mag

      // Smooth transition
      const targetOpacity = motionStrength > threshold ? Math.min(1, motionStrength * 5) : 0
      cell.opacity = cell.opacity * 0.8 + targetOpacity * 0.2

      // Occasionally change the value for active cells
      if (cell.opacity > 0.3 && Math.random() < 0.02) {
        cell.value = this.generateValue(
          Math.floor(cell.x * this.config.columns),
          Math.floor(cell.y * this.config.rows)
        )
      }
    }

    this.render()
  }

  /**
   * Render the grid to DOM.
   */
  private render(): void {
    if (!this.container) return

    // Clear previous content
    this.container.innerHTML = ''

    const colorHex = '#' + this.config.color.getHexString()
    const baseOpacity = this.config.opacity

    for (const cell of this.cells) {
      if (cell.opacity < 0.05) continue  // Skip invisible cells

      const el = document.createElement('span')
      const screenX = cell.x * 100
      const screenY = cell.y * 100
      const alpha = cell.opacity * baseOpacity

      // Glow intensity based on opacity
      const glowIntensity = cell.opacity

      el.style.cssText = `
        position: absolute;
        left: ${screenX}%;
        top: ${screenY}%;
        transform: translate(-50%, -50%);
        color: ${colorHex};
        opacity: ${alpha};
        text-shadow:
          0 0 ${4 * glowIntensity}px ${colorHex},
          0 0 ${8 * glowIntensity}px ${colorHex},
          0 0 ${16 * glowIntensity}px ${colorHex}40;
        white-space: nowrap;
      `
      el.textContent = cell.value

      this.container.appendChild(el)
    }
  }

  /**
   * Set the grid color.
   */
  setColor(color: THREE.Color): void {
    this.config.color = color
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<NumberGridConfig>): void {
    const needsReinit =
      config.columns !== undefined && config.columns !== this.config.columns ||
      config.rows !== undefined && config.rows !== this.config.rows

    Object.assign(this.config, config)

    if (needsReinit) {
      this.initCells()
    }

    if (this.container && config.fontSize !== undefined) {
      this.container.style.fontSize = `${config.fontSize}px`
    }
  }

  /**
   * Reset the grid.
   */
  reset(): void {
    this.initCells()
  }

  /**
   * Dispose of resources.
   */
  dispose(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }
    this.container = null
    this.cells = []
  }
}
