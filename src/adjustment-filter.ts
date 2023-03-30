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

export function adjustmentFilter(data: Uint8ClampedArray, options: AdjustmentFilterOptions = {}) {
  const {
    gamma = 1,
    saturation = 1,
    contrast = 1,
    brightness = 1,
    red = 1,
    green = 1,
    blue = 1,
    alpha = 1,
  } = options

  for (let length = data.length, i = 0; i < length; i += 4) {
    if (data[i + 3] > 0) {
      const alphaRage = data[i + 3] / 255
      const exponent = 1 / gamma
      const rgb = [
        Math.pow(data[i] / alphaRage, exponent),
        Math.pow(data[i + 1] / alphaRage, exponent),
        Math.pow(data[i + 2] / alphaRage, exponent),
      ]
      const dot1 = dot([0.2125, 0.7154, 0.0721], rgb)
      rgb[0] = mix(dot1, rgb[0], saturation)
      rgb[1] = mix(dot1, rgb[1], saturation)
      rgb[2] = mix(dot1, rgb[2], saturation)
      rgb[0] = mix(0.5, rgb[0], contrast)
      rgb[1] = mix(0.5, rgb[1], contrast)
      rgb[2] = mix(0.5, rgb[2], contrast)
      data[i] = rgb[0] * red * brightness * alphaRage
      data[i + 1] = rgb[1] * green * brightness * alphaRage
      data[i + 2] = rgb[2] * blue * brightness * alphaRage
    }
    data[i] *= alpha
    data[i + 1] *= alpha
    data[i + 2] *= alpha
  }
}
