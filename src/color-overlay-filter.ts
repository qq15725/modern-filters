import { mix } from './utils'

import type { RGBA } from './types'

export interface ColorOverlayFilterOptions {
  color?: RGBA
}

export function colorOverlayFilter(data: Uint8ClampedArray, options: ColorOverlayFilterOptions = {}) {
  const {
    color = [1, 0, 0, 0.5],
  } = options

  for (let len = data.length, i = 0; i < len; i += 4) {
    const rgba = [
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255,
      data[i + 3] / 255,
    ]
    const level = rgba[3] * color[3]
    data[i] = mix(rgba[0], color[0], level) * 255
    data[i + 1] = mix(rgba[1], color[1], level) * 255
    data[i + 2] = mix(rgba[2], color[2], level) * 255
  }
}

