import { mix } from './utils'

import type { RGBA } from './types'

export function colorOverlayFilter(rgba1: RGBA, rgba2: RGBA): RGBA {
  const level = (rgba1[3] / 255) * (rgba2[3] / 255)
  return [
    ~~mix(rgba1[0], rgba2[0], level),
    ~~mix(rgba1[1], rgba2[1], level),
    ~~mix(rgba1[2], rgba2[2], level),
    rgba1[3],
  ]
}

