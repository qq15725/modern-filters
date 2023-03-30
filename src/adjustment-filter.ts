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

  for (let length = data.length, i = 0; i < length; i += 4) {
    const rgba = [
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255,
      data[i + 3] / 255,
    ]
    if (rgba[3] > 0) {
      const alphaRage = data[i + 3] / 255
      const exponent = 1 / gamma
      const result = [
        Math.pow(rgba[0] / alphaRage, exponent),
        Math.pow(rgba[1] / alphaRage, exponent),
        Math.pow(rgba[2] / alphaRage, exponent),
      ]
      const dot1 = dot([0.2125, 0.7154, 0.0721], result)
      result[0] = mix(0.5, mix(dot1, result[0], saturation), contrast)
      result[1] = mix(0.5, mix(dot1, result[1], saturation), contrast)
      result[2] = mix(0.5, mix(dot1, result[2], saturation), contrast)
      rgba[0] = result[0] * red * brightness * alphaRage
      rgba[1] = result[1] * green * brightness * alphaRage
      rgba[2] = result[2] * blue * brightness * alphaRage
    }
    data[i] = rgba[0] * alpha * 255
    data[i + 1] = rgba[1] * alpha * 255
    data[i + 2] = rgba[2] * alpha * 255
  }
}
