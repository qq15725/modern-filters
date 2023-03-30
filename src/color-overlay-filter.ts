import { mix } from './utils'

import type { RGBA } from './types'

export interface ColorOverlayFilterOptions {
  color?: RGBA
}

export function colorOverlayFilter(data: Uint8ClampedArray, options: ColorOverlayFilterOptions = {}) {
  const {
    color = [255, 0, 0, 127],
  } = options

  const colorRgba = [
    color[0] / 255,
    color[1] / 255,
    color[2] / 255,
    color[3] / 255,
  ]

  for (let length = data.length, i = 0; i < length; i += 4) {
    const rgba = [
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255,
      data[i + 3] / 255,
    ]
    const level = rgba[3] * colorRgba[3]
    data[i] = mix(rgba[0], colorRgba[0], level) * 255
    data[i + 1] = mix(rgba[1], colorRgba[1], level) * 255
    data[i + 2] = mix(rgba[2], colorRgba[2], level) * 255
  }
}

