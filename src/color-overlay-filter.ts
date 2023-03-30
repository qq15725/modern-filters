import { mix } from './utils'

import type { RGBA } from './types'

export interface ColorOverlayFilterOptions {
  color?: RGBA
}

export function colorOverlayFilter(data: Uint8ClampedArray, options: ColorOverlayFilterOptions = {}) {
  const {
    color = [255, 0, 0, 127],
  } = options

  for (let length = data.length, i = 0; i < length; i += 4) {
    const level = (data[i + 3] / 255) * (color[3] / 255)
    data[i] = ~~mix(data[i], color[0], level)
    data[i + 1] = ~~mix(data[i + 1], color[1], level)
    data[i + 2] = ~~mix(data[i + 2], color[2], level)
  }
}

