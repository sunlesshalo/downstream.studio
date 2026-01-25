import * as THREE from 'three'
import { FlowField } from './FlowField'

export type ParticleMode = 'flow' | 'reveal'
export type ParticleShape = 'circle' | 'soft' | 'square' | 'ring' | 'star'

export interface ParticleConfig {
  count: number
  size: number
  color: THREE.Color
  colorVariation: number
  speed: number
  decay: number
  turbulence: number
  respawnThreshold: number
  mode: ParticleMode
  shape: ParticleShape
  opacity: number
  glow: number
  additive: boolean
}

const DEFAULT_CONFIG: ParticleConfig = {
  count: 50000,
  size: 2.0,
  color: new THREE.Color(0x00ffaa),
  colorVariation: 0.2,
  speed: 0.5,
  decay: 0.98,
  turbulence: 0.1,
  respawnThreshold: 0.01,
  mode: 'reveal', // 'flow' = drift with motion, 'reveal' = appear where motion is
  shape: 'circle',
  opacity: 1.0,
  glow: 0.5,
  additive: true,
}

/**
 * GPU-accelerated particle system that follows a flow field.
 */
export class ParticleSystem {
  private geometry: THREE.BufferGeometry
  private material: THREE.ShaderMaterial
  private points: THREE.Points
  private config: ParticleConfig

  // Particle state (CPU side for updates)
  private positions: Float32Array
  private velocities: Float32Array
  private ages: Float32Array
  private sizes: Float32Array
  private colors: Float32Array

  constructor(config: Partial<ParticleConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    const count = this.config.count

    // Initialize arrays
    this.positions = new Float32Array(count * 3)
    this.velocities = new Float32Array(count * 3)
    this.ages = new Float32Array(count)
    this.sizes = new Float32Array(count)
    this.colors = new Float32Array(count * 3)

    // Randomize initial positions
    for (let i = 0; i < count; i++) {
      this.respawnParticle(i)
    }

    // Create geometry
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1))
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3))

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uBaseSize: { value: this.config.size },
        uShape: { value: 0 }, // 0=circle, 1=soft, 2=square, 3=ring, 4=star
        uOpacity: { value: this.config.opacity },
        uGlow: { value: this.config.glow },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uBaseSize;

        attribute float aSize;
        attribute vec3 aColor;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = aColor;

          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;

          gl_Position = projectedPosition;

          // Size attenuation
          gl_PointSize = uBaseSize * aSize * uPixelRatio;
          gl_PointSize *= (1.0 / -viewPosition.z);

          // Fade based on depth
          vAlpha = smoothstep(0.0, 0.5, aSize);
        }
      `,
      fragmentShader: `
        uniform int uShape;
        uniform float uOpacity;
        uniform float uGlow;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          float alpha = 0.0;
          vec3 finalColor = vColor;

          // Shape 0: Circle (sharp edge)
          if (uShape == 0) {
            if (dist > 0.5) discard;
            alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));
          }
          // Shape 1: Soft glow
          else if (uShape == 1) {
            alpha = vAlpha * exp(-dist * dist * 8.0);
          }
          // Shape 2: Square
          else if (uShape == 2) {
            vec2 absCoord = abs(center);
            if (absCoord.x > 0.4 || absCoord.y > 0.4) discard;
            float edgeDist = max(absCoord.x, absCoord.y);
            alpha = vAlpha * (1.0 - smoothstep(0.3, 0.4, edgeDist));
          }
          // Shape 3: Ring
          else if (uShape == 3) {
            if (dist > 0.5) discard;
            float ring = abs(dist - 0.35);
            alpha = vAlpha * (1.0 - smoothstep(0.0, 0.15, ring));
          }
          // Shape 4: Star (4-point)
          else if (uShape == 4) {
            float angle = atan(center.y, center.x);
            float star = abs(cos(angle * 2.0)) * 0.3 + 0.2;
            if (dist > star) discard;
            alpha = vAlpha * (1.0 - dist / star);
          }

          // Apply glow
          finalColor = vColor * (1.0 + uGlow * (1.0 - dist * 2.0));

          // Apply opacity
          alpha *= uOpacity;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: this.config.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    })

    this.points = new THREE.Points(this.geometry, this.material)
  }

  /**
   * Respawn a particle at a random position.
   * If flowField is provided, tries to spawn in high-motion areas.
   */
  private respawnParticle(index: number, flowField?: FlowField): void {
    const i3 = index * 3

    if (flowField) {
      // Try to spawn in a high-motion area
      let bestX = 0, bestY = 0, bestMag = 0

      // Sample random positions and pick the one with highest motion
      for (let attempt = 0; attempt < 10; attempt++) {
        const testX = Math.random()
        const testY = Math.random()
        const flow = flowField.sampleFlow(testX, testY)

        if (flow.mag > bestMag) {
          bestMag = flow.mag
          bestX = testX
          bestY = testY
        }
      }

      // Only spawn if we found motion, otherwise hide the particle
      if (bestMag > 0.05) {
        // Convert from 0-1 to -1 to 1 coordinate space
        this.positions[i3 + 0] = bestX * 2 - 1
        this.positions[i3 + 1] = (1 - bestY) * 2 - 1 // Flip Y
        this.positions[i3 + 2] = (Math.random() - 0.5) * 0.1
        this.ages[index] = 0.5 + Math.random() * 0.5
        this.sizes[index] = bestMag * 2 // Size based on motion strength
      } else {
        // No motion found - hide particle off-screen
        this.positions[i3 + 0] = 10
        this.positions[i3 + 1] = 10
        this.positions[i3 + 2] = 0
        this.ages[index] = 0
        this.sizes[index] = 0
      }
    } else {
      // Fallback: random position
      this.positions[i3 + 0] = (Math.random() - 0.5) * 2
      this.positions[i3 + 1] = (Math.random() - 0.5) * 2
      this.positions[i3 + 2] = (Math.random() - 0.5) * 0.5
      this.ages[index] = 1.0
      this.sizes[index] = 0.5 + Math.random() * 0.5
    }

    // Reset velocity
    this.velocities[i3 + 0] = 0
    this.velocities[i3 + 1] = 0
    this.velocities[i3 + 2] = 0

    // Color with variation
    const baseColor = this.config.color
    const variation = this.config.colorVariation
    this.colors[i3 + 0] = baseColor.r + (Math.random() - 0.5) * variation
    this.colors[i3 + 1] = baseColor.g + (Math.random() - 0.5) * variation
    this.colors[i3 + 2] = baseColor.b + (Math.random() - 0.5) * variation
  }

  /**
   * Update particles based on flow field.
   * Mode 'flow': particles drift WITH motion (scattered everywhere)
   * Mode 'reveal': particles appear WHERE motion is (form the shape)
   */
  update(flowField: FlowField, deltaTime: number): void {
    const count = this.config.count
    const speed = this.config.speed
    const decay = this.config.decay
    const turbulence = this.config.turbulence
    const respawnThreshold = this.config.respawnThreshold
    const mode = this.config.mode

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      if (mode === 'reveal') {
        // REVEAL MODE: particles spread across screen, only visible where motion is
        // Particles don't chase motion - they reveal it like a "magic window"

        // Sample motion at particle's current position
        const nx = (this.positions[i3 + 0] + 1) / 2
        const ny = 1 - (this.positions[i3 + 1] + 1) / 2
        const flow = flowField.sampleFlow(nx, ny)

        // Size is PURELY based on motion at this location
        // No motion = size 0 = invisible
        const motionStrength = flow.mag
        this.sizes[i] = motionStrength * 3 * this.ages[i]

        // Very slow random drift to keep particles moving
        this.velocities[i3 + 0] += (Math.random() - 0.5) * turbulence * 0.05 * deltaTime
        this.velocities[i3 + 1] += (Math.random() - 0.5) * turbulence * 0.05 * deltaTime

        this.positions[i3 + 0] += this.velocities[i3 + 0]
        this.positions[i3 + 1] += this.velocities[i3 + 1]

        this.velocities[i3 + 0] *= 0.95
        this.velocities[i3 + 1] *= 0.95
        this.ages[i] *= 0.999 // Very slow age decay

        // Respawn when aged out or out of bounds
        if (
          this.ages[i] < 0.1 ||
          Math.abs(this.positions[i3 + 0]) > 1.1 ||
          Math.abs(this.positions[i3 + 1]) > 1.1
        ) {
          // Respawn at random position (spread across screen)
          this.positions[i3 + 0] = (Math.random() - 0.5) * 2
          this.positions[i3 + 1] = (Math.random() - 0.5) * 2
          this.positions[i3 + 2] = (Math.random() - 0.5) * 0.1
          this.ages[i] = 0.5 + Math.random() * 0.5
          this.velocities[i3 + 0] = 0
          this.velocities[i3 + 1] = 0
          this.velocities[i3 + 2] = 0
        }

      } else {
        // FLOW MODE: particles drift with motion (original behavior)

        const nx = (this.positions[i3 + 0] + 1) / 2
        const ny = 1 - (this.positions[i3 + 1] + 1) / 2
        const flow = flowField.sampleFlow(nx, ny)

        // Strong drift with flow
        this.velocities[i3 + 0] += flow.dx * speed * 50 * deltaTime
        this.velocities[i3 + 1] += -flow.dy * speed * 50 * deltaTime
        this.velocities[i3 + 0] += (Math.random() - 0.5) * turbulence * deltaTime
        this.velocities[i3 + 1] += (Math.random() - 0.5) * turbulence * deltaTime

        this.positions[i3 + 0] += this.velocities[i3 + 0]
        this.positions[i3 + 1] += this.velocities[i3 + 1]
        this.positions[i3 + 2] += this.velocities[i3 + 2]

        this.velocities[i3 + 0] *= decay
        this.velocities[i3 + 1] *= decay
        this.velocities[i3 + 2] *= decay
        this.ages[i] *= decay
        this.sizes[i] = this.ages[i]

        if (
          this.ages[i] < respawnThreshold ||
          Math.abs(this.positions[i3 + 0]) > 1.2 ||
          Math.abs(this.positions[i3 + 1]) > 1.2
        ) {
          this.respawnParticle(i) // No flowField = random spawn
        }
      }
    }

    // Update GPU buffers
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.aSize.needsUpdate = true
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<ParticleConfig>): void {
    if (config.mode !== undefined) {
      console.log('[ParticleSystem] Mode set to:', config.mode)
    }
    Object.assign(this.config, config)
    if (config.size !== undefined) {
      this.material.uniforms.uBaseSize.value = config.size
    }
    if (config.shape !== undefined) {
      const shapeMap: Record<ParticleShape, number> = {
        circle: 0,
        soft: 1,
        square: 2,
        ring: 3,
        star: 4,
      }
      this.material.uniforms.uShape.value = shapeMap[config.shape]
    }
    if (config.opacity !== undefined) {
      this.material.uniforms.uOpacity.value = config.opacity
    }
    if (config.glow !== undefined) {
      this.material.uniforms.uGlow.value = config.glow
    }
    if (config.additive !== undefined) {
      this.material.blending = config.additive ? THREE.AdditiveBlending : THREE.NormalBlending
      this.material.needsUpdate = true
    }
  }

  /**
   * Set particle color.
   */
  setColor(color: THREE.Color): void {
    this.config.color = color
    // Update all particle colors gradually (they'll get new colors on respawn)
  }

  /**
   * Get the Three.js Points object.
   */
  getObject(): THREE.Points {
    return this.points
  }

  /**
   * Update shader time uniform.
   */
  setTime(time: number): void {
    this.material.uniforms.uTime.value = time
  }

  /**
   * Reset all particles.
   */
  reset(): void {
    for (let i = 0; i < this.config.count; i++) {
      this.respawnParticle(i)
    }
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.aSize.needsUpdate = true
    this.geometry.attributes.aColor.needsUpdate = true
  }

  /**
   * Dispose of resources.
   */
  dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
  }
}
