export interface CanvasEffect {
  id: string
  name: string
  intensity: number
  enabled: boolean
}

export interface VideoFilter {
  id: string
  type: 'brightness' | 'contrast' | 'saturation' | 'hue' | 'blur' | 'zoom'
  value: number
  enabled: boolean
}

export class EffectsEngine {
  private effects: Map<string, CanvasEffect> = new Map()
  private filters: Map<string, VideoFilter> = new Map()

  // Built-in effects
  private effectDefinitions = {
    blur: { name: 'Blur', maxIntensity: 20 },
    pixelate: { name: 'Pixelate', maxIntensity: 50 },
    sepia: { name: 'Sepia Tone', maxIntensity: 1 },
    grayscale: { name: 'Grayscale', maxIntensity: 1 },
    invert: { name: 'Invert', maxIntensity: 1 },
    posterize: { name: 'Posterize', maxIntensity: 256 },
    solarize: { name: 'Solarize', maxIntensity: 1 },
    vignette: { name: 'Vignette', maxIntensity: 1 },
  }

  addEffect(effectId: keyof typeof this.effectDefinitions, intensity: number = 0.5): void {
    const definition = this.effectDefinitions[effectId]
    if (!definition) return

    this.effects.set(effectId, {
      id: effectId,
      name: definition.name,
      intensity: Math.min(intensity, definition.maxIntensity),
      enabled: true,
    })
  }

  removeEffect(effectId: string): void {
    this.effects.delete(effectId)
  }

  updateEffect(effectId: string, intensity: number): void {
    const effect = this.effects.get(effectId)
    if (effect) {
      effect.intensity = intensity
    }
  }

  toggleEffect(effectId: string): void {
    const effect = this.effects.get(effectId)
    if (effect) {
      effect.enabled = !effect.enabled
    }
  }

  addFilter(type: VideoFilter['type'], value: number = 0): void {
    const filterId = `${type}-${Date.now()}`
    this.filters.set(filterId, {
      id: filterId,
      type,
      value: this.clampValue(type, value),
      enabled: true,
    })
  }

  updateFilter(filterId: string, value: number): void {
    const filter = this.filters.get(filterId)
    if (filter) {
      filter.value = this.clampValue(filter.type, value)
    }
  }

  removeFilter(filterId: string): void {
    this.filters.delete(filterId)
  }

  toggleFilter(filterId: string): void {
    const filter = this.filters.get(filterId)
    if (filter) {
      filter.enabled = !filter.enabled
    }
  }

  private clampValue(type: VideoFilter['type'], value: number): number {
    const ranges: Record<VideoFilter['type'], [number, number]> = {
      brightness: [-100, 100],
      contrast: [-100, 100],
      saturation: [-100, 100],
      hue: [-180, 180],
      blur: [0, 20],
      zoom: [0.5, 3],
    }
    const [min, max] = ranges[type]
    return Math.max(min, Math.min(max, value))
  }

  applyEffectsToCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement
  ): void {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Apply each enabled filter
    this.filters.forEach((filter) => {
      if (!filter.enabled) return

      switch (filter.type) {
        case 'brightness':
          this.applyBrightness(data, filter.value)
          break
        case 'contrast':
          this.applyContrast(data, filter.value)
          break
        case 'saturation':
          this.applySaturation(data, filter.value)
          break
        case 'hue':
          this.applyHue(data, filter.value)
          break
      }
    })

    ctx.putImageData(imageData, 0, 0)
  }

  private applyBrightness(data: Uint8ClampedArray, value: number): void {
    const adjusted = value / 100
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + adjusted * 255)
      data[i + 1] = Math.min(255, data[i + 1] + adjusted * 255)
      data[i + 2] = Math.min(255, data[i + 2] + adjusted * 255)
    }
  }

  private applyContrast(data: Uint8ClampedArray, value: number): void {
    const factor = (259 * (value + 255)) / (255 * (259 - value))
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, factor * (data[i] - 128) + 128)
      data[i + 1] = Math.min(255, factor * (data[i + 1] - 128) + 128)
      data[i + 2] = Math.min(255, factor * (data[i + 2] - 128) + 128)
    }
  }

  private applySaturation(data: Uint8ClampedArray, value: number): void {
    const factor = 1 + value / 100
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      data[i] = Math.min(255, gray + (data[i] - gray) * factor)
      data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * factor)
      data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * factor)
    }
  }

  private applyHue(data: Uint8ClampedArray, value: number): void {
    const angle = (value * Math.PI) / 180
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255

      data[i] = Math.min(255, (r * cos + (g * -sin * 0.169 + b * sin * 0.949)) * 255)
      data[i + 1] = Math.min(255, (g * cos + (r * sin * 0.213 + b * sin * 0.143)) * 255)
      data[i + 2] = Math.min(255, (b * cos + (r * sin * 0.988 + g * -sin * 0.203)) * 255)
    }
  }

  getEffects(): CanvasEffect[] {
    return Array.from(this.effects.values())
  }

  getFilters(): VideoFilter[] {
    return Array.from(this.filters.values())
  }

  getAvailableEffects() {
    return Object.entries(this.effectDefinitions).map(([id, def]) => ({
      id,
      ...def,
    }))
  }

  reset(): void {
    this.effects.clear()
    this.filters.clear()
  }
}

export const createEffectsEngine = () => new EffectsEngine()
