import { dot, mix } from './utils'

export interface AdjustmentFilterOptions {
  gamma?: number
  saturation?: number
  contrast?: number
  brightness?: number
  red?: number
  green?: number
  blue?: number
  alpha?: number
}

export function adjustmentFilter({ data }: ImageData, options: AdjustmentFilterOptions = {}) {
  const {
    saturation = 1,
    contrast = 1,
    brightness = 1,
    red = 1,
    green = 1,
    blue = 1,
    alpha = 1,
  } = options

  let {
    gamma = 1,
  } = options

  gamma = Math.max(gamma, 0.0001)

  for (let len = data.length, i = 0; i < len; i += 4) {
    let currentAlpha = data[i + 3]
    if (alpha === 1 && currentAlpha === 0) continue
    const rgb = [
      data[i],
      data[i + 1],
      data[i + 2],
    ]
    if (currentAlpha > 0) {
      rgb[0] /= 255
      rgb[1] /= 255
      rgb[2] /= 255
      currentAlpha /= 255
      const exponent = 1 / gamma
      const result = [
        Math.pow(rgb[0] / currentAlpha, exponent),
        Math.pow(rgb[1] / currentAlpha, exponent),
        Math.pow(rgb[2] / currentAlpha, exponent),
      ]
      const dot1 = dot([0.2125, 0.7154, 0.0721], result)
      const rate = brightness * currentAlpha * 255
      rgb[0] = mix(0.5, mix(dot1, result[0], saturation), contrast) * red * rate
      rgb[1] = mix(0.5, mix(dot1, result[1], saturation), contrast) * green * rate
      rgb[2] = mix(0.5, mix(dot1, result[2], saturation), contrast) * blue * rate
    }
    data[i] = rgb[0] * alpha
    data[i + 1] = rgb[1] * alpha
    data[i + 2] = rgb[2] * alpha
  }
}
