import * as THREE from 'three'
import { FlowField } from './FlowField'

export interface NumberConfig {
  count: number
  fontSize: number
  color: THREE.Color
  fadeSpeed: number
  spawnThreshold: number // Minimum flow magnitude to spawn number
  numberType: 'binary' | 'hex' | 'decimal' | 'mixed'
}

const DEFAULT_CONFIG: NumberConfig = {
  count: 200,
  fontSize: 14,
  color: new THREE.Color(0x00ffaa),
  fadeSpeed: 0.01,
  spawnThreshold: 0.1,
  numberType: 'mixed',
}

interface NumberSprite {
  x: number
  y: number
  value: string
  age: number
  rotation: number
  scale: number
  velocityX: number
  velocityY: number
}

/**
 * Renders floating numbers that spawn in areas of high motion.
 * Uses DOM overlay for crisp text rendering.
 */
export class NumberField {
  private config: NumberConfig
  private sprites: NumberSprite[]
  private container: HTMLDivElement | null = null

  constructor(config: Partial<NumberConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sprites = []
  }

  /**
   * Mount the number field to a DOM element.
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
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
      font-size: ${this.config.fontSize}px;
      font-weight: 500;
      letter-spacing: 0.05em;
      font-variant-numeric: tabular-nums slashed-zero;
    `
    container.appendChild(this.container)
  }

  /**
   * Generate a random number string based on config.
   */
  private generateNumber(): string {
    const type = this.config.numberType

    if (type === 'binary') {
      return Math.floor(Math.random() * 256).toString(2).padStart(8, '0')
    } else if (type === 'hex') {
      return '0x' + Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, '0')
    } else if (type === 'decimal') {
      return (Math.random() * 100).toFixed(2)
    } else {
      // Mixed
      const types = ['binary', 'hex', 'decimal', 'scientific']
      const chosen = types[Math.floor(Math.random() * types.length)]

      if (chosen === 'binary') {
        return Math.floor(Math.random() * 256).toString(2)
      } else if (chosen === 'hex') {
        return '0x' + Math.floor(Math.random() * 256).toString(16).toUpperCase()
      } else if (chosen === 'scientific') {
        return (Math.random() * 10).toExponential(2)
      } else {
        return (Math.random() * 1000).toFixed(1)
      }
    }
  }

  /**
   * Update number field based on flow.
   */
  update(flowField: FlowField, deltaTime: number): void {
    if (!this.container) return

    const fadeSpeed = this.config.fadeSpeed
    const spawnThreshold = this.config.spawnThreshold
    const color = this.config.color

    // Update existing sprites
    for (let i = this.sprites.length - 1; i >= 0; i--) {
      const sprite = this.sprites[i]
      sprite.age -= fadeSpeed * deltaTime * 60

      // Sample flow at position
      const nx = (sprite.x + 1) / 2
      const ny = (sprite.y + 1) / 2
      const flow = flowField.sampleFlow(nx, ny)

      // Move with flow
      sprite.x += (flow.dx * 0.02 + sprite.velocityX) * deltaTime * 60
      sprite.y += (flow.dy * 0.02 + sprite.velocityY) * deltaTime * 60
      sprite.rotation += flow.mag * 2 * deltaTime * 60

      // Remove if dead or out of bounds
      if (sprite.age <= 0 || Math.abs(sprite.x) > 1.5 || Math.abs(sprite.y) > 1.5) {
        this.sprites.splice(i, 1)
      }
    }

    // Spawn new numbers in high-motion areas
    if (this.sprites.length < this.config.count) {
      // Sample random positions and spawn if flow is strong enough
      for (let attempt = 0; attempt < 5; attempt++) {
        const x = (Math.random() - 0.5) * 2
        const y = (Math.random() - 0.5) * 2
        const nx = (x + 1) / 2
        const ny = (y + 1) / 2
        const flow = flowField.sampleFlow(nx, ny)

        if (flow.mag > spawnThreshold) {
          this.sprites.push({
            x,
            y,
            value: this.generateNumber(),
            age: 1.0,
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5,
            velocityX: (Math.random() - 0.5) * 0.001,
            velocityY: (Math.random() - 0.5) * 0.001,
          })
          break
        }
      }
    }

    // Render to DOM
    this.render(color)
  }

  /**
   * Render sprites to DOM.
   */
  private render(color: THREE.Color): void {
    if (!this.container) return

    // Clear existing
    this.container.innerHTML = ''

    const colorHex = '#' + color.getHexString()

    for (const sprite of this.sprites) {
      const el = document.createElement('span')

      // Convert normalized coords to screen coords
      const screenX = ((sprite.x + 1) / 2) * 100
      const screenY = ((1 - sprite.y) / 2) * 100

      // Calculate glow intensity based on age
      const glowIntensity = Math.min(1, sprite.age * 1.2)

      el.style.cssText = `
        position: absolute;
        left: ${screenX}%;
        top: ${screenY}%;
        transform: translate(-50%, -50%) rotate(${sprite.rotation}deg) scale(${sprite.scale});
        color: ${colorHex};
        opacity: ${sprite.age * 0.9};
        text-shadow:
          0 0 ${4 * glowIntensity}px ${colorHex},
          0 0 ${8 * glowIntensity}px ${colorHex},
          0 0 ${16 * glowIntensity}px ${colorHex}80,
          0 0 ${32 * glowIntensity}px ${colorHex}40;
        white-space: nowrap;
        font-feature-settings: 'tnum' 1, 'zero' 1;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      `
      el.textContent = sprite.value

      this.container.appendChild(el)
    }
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<NumberConfig>): void {
    Object.assign(this.config, config)
    if (this.container && config.fontSize) {
      this.container.style.fontSize = `${config.fontSize}px`
    }
  }

  /**
   * Set number color.
   */
  setColor(color: THREE.Color): void {
    this.config.color = color
  }

  /**
   * Reset all numbers.
   */
  reset(): void {
    this.sprites = []
    if (this.container) {
      this.container.innerHTML = ''
    }
  }

  /**
   * Unmount and cleanup.
   */
  dispose(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }
    this.container = null
    this.sprites = []
  }
}
