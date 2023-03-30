import { mix } from './utils'

export interface ColorMatrixFilterOptions {
  alpha?: number
}

export function colorMatrixFilter(data: Uint8ClampedArray, options: ColorMatrixFilterOptions = {}) {
  const {
    alpha = 1,
  } = options

  if (!alpha) return

  let matrix: number[] = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
  ]

  for (let length = data.length, i = 0; i < length; i += 4) {
    const a = data[i + 3] / 255
    const a_ = a > 0 ? a : 1
    const r = data[i] / 255 / a_
    const g = data[i + 1] / 255 / a_
    const b = data[i + 2] / 255 / a_
    const result = [
      (matrix[0] * r) + (matrix[1] * g) + (matrix[2] * b) + (matrix[3] * a) + matrix[4],
      (matrix[5] * r) + (matrix[6] * g) + (matrix[7] * b) + (matrix[8] * a) + matrix[9],
      (matrix[10] * r) + (matrix[11] * g) + (matrix[12] * b) + (matrix[13] * a) + matrix[14],
      (matrix[15] * r) + (matrix[16] * g) + (matrix[17] * b) + (matrix[18] * a) + matrix[19],
    ]
    data[i] = mix(r, result[0], alpha) * result[3] * 255
    data[i + 1] = mix(g, result[1], alpha) * result[3] * 255
    data[i + 2] = mix(b, result[2], alpha) * result[3] * 255
  }
}
