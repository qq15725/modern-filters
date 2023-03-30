export interface EmbossFilterOptions {
  strength?: number
}

export function embossFilter(data: Uint8ClampedArray, options: EmbossFilterOptions = {}) {
  const {
    strength = 5,
  } = options

  let prevRgb = [0, 0, 0]
  for (let len = data.length, i = 0; i < len; i += 4) {
    const angle = data[i + 3] / 255
    const nextRgb = [
      (data[i + 4] ?? 0) / 255,
      (data[i + 5] ?? 0) / 255,
      (data[i + 6] ?? 0) / 255,
    ]
    const result = (
      (0.5 - prevRgb[0] * strength + nextRgb[0] * strength)
      + (0.5 - prevRgb[1] * strength + nextRgb[1] * strength)
      + 0.5 - prevRgb[2] * strength + nextRgb[2] * strength
    ) / 3 * angle * 255
    prevRgb = [
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255,
    ]
    data[i] = result
    data[i + 1] = result
    data[i + 2] = result
  }
}
