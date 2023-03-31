import { length } from './utils'
import type { RGB } from './types'

export interface MultiColorReplaceFilterOptions {
  replacements?: [RGB, RGB][]
  epsilon?: number
}

export function multiColorReplaceFilter(imageData: ImageData, options: MultiColorReplaceFilterOptions = {}) {
  const { data } = imageData

  const {
    replacements = [
      [[1, 0, 0], [0, 0, 1]],
    ],
    epsilon = 0.5,
  } = options

  const maxColors = replacements.length

  for (let len = data.length, i = 0; i < len; i += 4) {
    const alpha = data[i + 3] / 255
    if (alpha < 0.0001) continue
    const rate = alpha * 255
    const rgb = [
      data[i] / rate,
      data[i + 1] / rate,
      data[i + 2] / rate,
    ]
    for (let ci = 0; ci < maxColors; ci++) {
      const originColor = replacements[ci][0]
      const colorDiff = [
        originColor[0] - rgb[0],
        originColor[1] - rgb[1],
        originColor[2] - rgb[2],
      ]
      if (length(colorDiff) < epsilon) {
        const targetColor = replacements[ci][1]
        data[i] = (targetColor[0] + colorDiff[0]) * rate
        data[i + 1] = (targetColor[1] + colorDiff[1]) * rate
        data[i + 2] = (targetColor[2] + colorDiff[2]) * rate
        break
      }
    }
  }
}
