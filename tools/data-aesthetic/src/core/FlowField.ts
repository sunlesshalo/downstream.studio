import * as THREE from 'three'

/**
 * Configuration for subject isolation filters.
 */
export interface FlowFilterConfig {
  // Luminance filter: only track motion in bright areas (0-1, 0 = no filter)
  luminanceMin: number
  luminanceMax: number

  // Motion magnitude threshold (0-1, filters out subtle motion like water ripples)
  magnitudeMin: number

  // Edge weight: boost motion near strong edges (0 = off, 1 = full weighting)
  edgeWeight: number

  // Saturation filter: only track colorful areas (0-1, 0 = no filter)
  saturationMin: number

  // Invert mask: track dark areas instead of bright
  invertLuminance: boolean

  // Temporal coherence: require motion to persist over frames (0 = off, 1 = full)
  // High values filter out oscillating motion like water ripples
  temporalSmooth: number

  // Spatial coherence: group nearby motion together (0 = off, higher = more blur)
  // Helps isolate large moving objects from scattered noise
  spatialSmooth: number
}

const DEFAULT_FILTER: FlowFilterConfig = {
  luminanceMin: 0,
  luminanceMax: 1,
  magnitudeMin: 0,
  edgeWeight: 0,
  saturationMin: 0,
  invertLuminance: false,
  temporalSmooth: 0,
  spatialSmooth: 0,
}

/**
 * FlowField manages velocity field computation from video frames.
 * Uses optical flow approximation via frame differencing.
 * Supports subject isolation filters to separate foreground from background.
 */
export class FlowField {
  private width: number
  private height: number
  private prevFrame: ImageData | null = null
  private flowTexture: THREE.DataTexture
  private flowData: Float32Array
  private accumulatedFlow: Float32Array // For temporal coherence
  private tempFlow: Float32Array // For spatial blur computation
  private canvas: OffscreenCanvas
  private ctx: OffscreenCanvasRenderingContext2D

  // Subject isolation filters
  private filter: FlowFilterConfig

  constructor(width: number = 256, height: number = 256) {
    this.width = width
    this.height = height
    this.filter = { ...DEFAULT_FILTER }

    // Create flow data array (RGBA: dx, dy, magnitude, mask)
    this.flowData = new Float32Array(width * height * 4)
    this.accumulatedFlow = new Float32Array(width * height * 4)
    this.tempFlow = new Float32Array(width * height * 4)

    // Create Three.js texture
    this.flowTexture = new THREE.DataTexture(
      this.flowData as unknown as BufferSource,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    this.flowTexture.needsUpdate = true

    // Create offscreen canvas for frame processing
    this.canvas = new OffscreenCanvas(width, height)
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
  }

  /**
   * Update filter configuration.
   */
  setFilter(config: Partial<FlowFilterConfig>): void {
    Object.assign(this.filter, config)
  }

  /**
   * Get current filter configuration.
   */
  getFilter(): FlowFilterConfig {
    return { ...this.filter }
  }

  /**
   * Update flow field from a video frame.
   * Uses simplified optical flow via frame differencing with spatial gradients.
   */
  updateFromVideo(video: HTMLVideoElement): void {
    // Draw current frame to canvas
    this.ctx.drawImage(video, 0, 0, this.width, this.height)
    const currentFrame = this.ctx.getImageData(0, 0, this.width, this.height)

    if (this.prevFrame) {
      this.computeFlow(this.prevFrame, currentFrame)
    }

    this.prevFrame = currentFrame
    this.flowTexture.needsUpdate = true
  }

  /**
   * Update flow field from an image (for static analysis).
   */
  updateFromImage(image: HTMLImageElement | HTMLCanvasElement): void {
    this.ctx.drawImage(image, 0, 0, this.width, this.height)
    const currentFrame = this.ctx.getImageData(0, 0, this.width, this.height)

    if (this.prevFrame) {
      this.computeFlow(this.prevFrame, currentFrame)
    }

    this.prevFrame = currentFrame
    this.flowTexture.needsUpdate = true
  }

  /**
   * Get RGB values at pixel position.
   */
  private getRGB(data: ImageData, x: number, y: number): { r: number; g: number; b: number } {
    const idx = (y * this.width + x) * 4
    return {
      r: data.data[idx] / 255,
      g: data.data[idx + 1] / 255,
      b: data.data[idx + 2] / 255,
    }
  }

  /**
   * Get luminance (brightness) at pixel position (0-1).
   */
  private getLuminance(data: ImageData, x: number, y: number): number {
    const { r, g, b } = this.getRGB(data, x, y)
    // Perceptual luminance
    return 0.299 * r + 0.587 * g + 0.114 * b
  }

  /**
   * Get saturation at pixel position (0-1).
   */
  private getSaturation(data: ImageData, x: number, y: number): number {
    const { r, g, b } = this.getRGB(data, x, y)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max === 0) return 0
    return (max - min) / max
  }

  /**
   * Get grayscale value at pixel position.
   */
  private getGray(data: ImageData, x: number, y: number): number {
    return this.getLuminance(data, x, y)
  }

  /**
   * Compute edge strength at a pixel using Sobel operator.
   */
  private getEdgeStrength(data: ImageData, x: number, y: number): number {
    if (x <= 0 || x >= this.width - 1 || y <= 0 || y >= this.height - 1) {
      return 0
    }

    // Sobel kernels
    const gx = (
      -1 * this.getGray(data, x - 1, y - 1) +
      1 * this.getGray(data, x + 1, y - 1) +
      -2 * this.getGray(data, x - 1, y) +
      2 * this.getGray(data, x + 1, y) +
      -1 * this.getGray(data, x - 1, y + 1) +
      1 * this.getGray(data, x + 1, y + 1)
    )

    const gy = (
      -1 * this.getGray(data, x - 1, y - 1) +
      -2 * this.getGray(data, x, y - 1) +
      -1 * this.getGray(data, x + 1, y - 1) +
      1 * this.getGray(data, x - 1, y + 1) +
      2 * this.getGray(data, x, y + 1) +
      1 * this.getGray(data, x + 1, y + 1)
    )

    return Math.min(1, Math.sqrt(gx * gx + gy * gy))
  }

  /**
   * Compute subject mask based on filter settings.
   * Returns 0-1 where 1 = include this pixel, 0 = exclude.
   */
  private computeMask(data: ImageData, x: number, y: number): number {
    let mask = 1.0

    // Luminance filter
    if (this.filter.luminanceMin > 0 || this.filter.luminanceMax < 1) {
      let lum = this.getLuminance(data, x, y)
      if (this.filter.invertLuminance) {
        lum = 1 - lum
      }

      if (lum < this.filter.luminanceMin || lum > this.filter.luminanceMax) {
        mask = 0
      } else {
        // Soft falloff at edges
        const range = this.filter.luminanceMax - this.filter.luminanceMin
        if (range > 0) {
          const normalized = (lum - this.filter.luminanceMin) / range
          // Bell curve - strongest in middle of range
          mask *= Math.sin(normalized * Math.PI)
        }
      }
    }

    // Saturation filter
    if (this.filter.saturationMin > 0 && mask > 0) {
      const sat = this.getSaturation(data, x, y)
      if (sat < this.filter.saturationMin) {
        mask *= sat / this.filter.saturationMin
      }
    }

    // Edge weight boost
    if (this.filter.edgeWeight > 0 && mask > 0) {
      const edge = this.getEdgeStrength(data, x, y)
      // Mix between original mask and edge-weighted
      mask = mask * (1 - this.filter.edgeWeight) + mask * edge * this.filter.edgeWeight * 3
    }

    return Math.max(0, Math.min(1, mask))
  }

  /**
   * Compute optical flow between two frames using Lucas-Kanade-like approach.
   * Applies subject isolation filters.
   */
  private computeFlow(prev: ImageData, curr: ImageData): void {
    const w = this.width
    const h = this.height

    // First pass: compute raw flow into tempFlow
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4

        // Compute subject mask
        const mask = this.computeMask(curr, x, y)

        // Skip if masked out
        if (mask < 0.01) {
          this.tempFlow[idx + 0] = 0
          this.tempFlow[idx + 1] = 0
          this.tempFlow[idx + 2] = 0
          this.tempFlow[idx + 3] = 0
          continue
        }

        // Get grayscale values for current and previous
        const prevGray = this.getGray(prev, x, y)
        const currGray = this.getGray(curr, x, y)

        // Temporal derivative (intensity change)
        const It = currGray - prevGray

        // Spatial gradients (Sobel-like)
        const Ix = (
          this.getGray(curr, x + 1, y) - this.getGray(curr, x - 1, y)
        ) / 2
        const Iy = (
          this.getGray(curr, x, y + 1) - this.getGray(curr, x, y - 1)
        ) / 2

        // Solve for velocity (simplified Lucas-Kanade)
        // Ix * u + Iy * v + It = 0
        const gradMag = Ix * Ix + Iy * Iy + 0.0001
        let u = -It * Ix / gradMag
        let v = -It * Iy / gradMag

        // Compute magnitude
        const mag = Math.sqrt(u * u + v * v)
        const maxVel = 10

        // Apply magnitude threshold
        if (mag < this.filter.magnitudeMin * maxVel) {
          this.tempFlow[idx + 0] = 0
          this.tempFlow[idx + 1] = 0
          this.tempFlow[idx + 2] = 0
          this.tempFlow[idx + 3] = 0
          continue
        }

        // Apply mask to velocity
        u *= mask
        v *= mask

        // Store raw flow
        this.tempFlow[idx + 0] = Math.max(-1, Math.min(1, u / maxVel))
        this.tempFlow[idx + 1] = Math.max(-1, Math.min(1, v / maxVel))
        this.tempFlow[idx + 2] = Math.min(1, mag / maxVel) * mask
        this.tempFlow[idx + 3] = mask
      }
    }

    // Second pass: apply spatial blur if enabled
    if (this.filter.spatialSmooth > 0) {
      this.applySpatialBlur()
    } else {
      // Copy tempFlow to flowData
      this.flowData.set(this.tempFlow)
    }

    // Third pass: apply temporal coherence
    if (this.filter.temporalSmooth > 0) {
      this.applyTemporalCoherence()
    }
  }

  /**
   * Apply spatial blur to group nearby motion together.
   * This helps isolate large moving objects from scattered noise.
   */
  private applySpatialBlur(): void {
    const w = this.width
    const h = this.height
    const radius = Math.ceil(this.filter.spatialSmooth * 3) // 0-3 pixel radius

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4

        let sumU = 0, sumV = 0, sumMag = 0, sumMask = 0
        let count = 0

        // Sample neighborhood
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue

            const nidx = (ny * w + nx) * 4
            const weight = 1 / (1 + Math.sqrt(dx * dx + dy * dy)) // Distance weighting

            sumU += this.tempFlow[nidx + 0] * weight
            sumV += this.tempFlow[nidx + 1] * weight
            sumMag += this.tempFlow[nidx + 2] * weight
            sumMask += this.tempFlow[nidx + 3] * weight
            count += weight
          }
        }

        if (count > 0) {
          this.flowData[idx + 0] = sumU / count
          this.flowData[idx + 1] = sumV / count
          this.flowData[idx + 2] = sumMag / count
          this.flowData[idx + 3] = sumMask / count
        }
      }
    }
  }

  /**
   * Apply temporal coherence - blend with accumulated flow.
   * This filters out oscillating motion (like water ripples) while
   * keeping sustained motion (like a jellyfish moving).
   */
  private applyTemporalCoherence(): void {
    const blend = this.filter.temporalSmooth // 0-1

    for (let i = 0; i < this.flowData.length; i += 4) {
      const currU = this.flowData[i + 0]
      const currV = this.flowData[i + 1]
      const currMag = this.flowData[i + 2]
      const currMask = this.flowData[i + 3]

      const accU = this.accumulatedFlow[i + 0]
      const accV = this.accumulatedFlow[i + 1]

      // Check if current flow aligns with accumulated flow
      // Dot product measures alignment (-1 to 1)
      const accMag = Math.sqrt(accU * accU + accV * accV)
      let alignment = 1
      if (accMag > 0.001 && currMag > 0.001) {
        alignment = (currU * accU + currV * accV) / (currMag * accMag)
        alignment = (alignment + 1) / 2 // Normalize to 0-1
      }

      // Boost flow that aligns with history, suppress oscillating flow
      const coherenceBoost = 0.5 + alignment * 0.5 // 0.5-1.0

      // Blend current with accumulated
      this.flowData[i + 0] = currU * coherenceBoost
      this.flowData[i + 1] = currV * coherenceBoost
      this.flowData[i + 2] = currMag * coherenceBoost
      this.flowData[i + 3] = currMask

      // Update accumulated flow (decaying average)
      const accBlend = blend * 0.9 // How much history to keep
      this.accumulatedFlow[i + 0] = accU * accBlend + currU * (1 - accBlend)
      this.accumulatedFlow[i + 1] = accV * accBlend + currV * (1 - accBlend)
    }
  }

  /**
   * Sample flow at normalized coordinates (0-1).
   */
  sampleFlow(nx: number, ny: number): { dx: number; dy: number; mag: number; mask: number } {
    const x = Math.floor(nx * (this.width - 1))
    const y = Math.floor(ny * (this.height - 1))
    const idx = (y * this.width + x) * 4

    return {
      dx: this.flowData[idx + 0],
      dy: this.flowData[idx + 1],
      mag: this.flowData[idx + 2],
      mask: this.flowData[idx + 3],
    }
  }

  /**
   * Get the flow texture for shader use.
   */
  getTexture(): THREE.DataTexture {
    return this.flowTexture
  }

  /**
   * Decay flow field over time (for smooth transitions).
   */
  decay(factor: number = 0.95): void {
    for (let i = 0; i < this.flowData.length; i += 4) {
      this.flowData[i + 0] *= factor
      this.flowData[i + 1] *= factor
      this.flowData[i + 2] *= factor
      this.flowData[i + 3] *= factor
    }
    this.flowTexture.needsUpdate = true
  }

  /**
   * Reset the flow field.
   */
  reset(): void {
    this.flowData.fill(0)
    this.accumulatedFlow.fill(0)
    this.tempFlow.fill(0)
    this.prevFrame = null
    this.flowTexture.needsUpdate = true
  }

  /**
   * Get dimensions.
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height }
  }
}
