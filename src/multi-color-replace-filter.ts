import { length } from './utils'
import type { RGB } from './types'

export interface MultiColorReplaceFilterOptions {
  replacements?: [RGB, RGB][]
  epsilon?: number
}

export function multiColorReplaceFilter(data: Uint8ClampedArray, options: MultiColorReplaceFilterOptions = {}) {
  const {
    replacements = [
      [[1, 0, 0], [0, 0, 1]],
    ],
    epsilon = 0.5,
  } = options

  const maxColors = replacements.length

  for (let len = data.length, i = 0; i < len; i += 4) {
    const rgba = [
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255,
      data[i + 3] / 255,
    ]
    if (rgba[3] < 0.0001) continue
    const color = [
      rgba[0] / rgba[3],
      rgba[1] / rgba[3],
      rgba[2] / rgba[3],
    ]
    for (let ci = 0; ci < maxColors; ci++) {
      const originColor = replacements[ci][0]
      const colorDiff = [
        originColor[0] - color[0],
        originColor[1] - color[1],
        originColor[2] - color[2],
      ]
      if (length(colorDiff) < epsilon) {
        const targetColor = replacements[ci][1]
        data[i] = (targetColor[0] + colorDiff[0]) * rgba[3] * 255
        data[i + 1] = (targetColor[1] + colorDiff[1]) * rgba[3] * 255
        data[i + 2] = (targetColor[2] + colorDiff[2]) * rgba[3] * 255
        break
      }
    }
  }
}
