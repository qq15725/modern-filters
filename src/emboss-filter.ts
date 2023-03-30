export interface EmbossFilterOptions {
  strength?: number
}

export function embossFilter(data: Uint8ClampedArray, options: EmbossFilterOptions = {}) {
  const {
    strength = 5,
  } = options

  let prevRgab = [0, 0, 0, 0]
  for (let length = data.length, i = 0; i < length; i += 4) {
    const rgba = [
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255,
      data[i + 3] / 255,
    ]
    const nextRgba = [
      (data[i + 4] ?? 0) / 255,
      (data[i + 5] ?? 0) / 255,
      (data[i + 6] ?? 0) / 255,
    ]
    const result = (
      (0.5 - prevRgab[0] * strength + nextRgba[0] * strength)
      + (0.5 - prevRgab[1] * strength + nextRgba[1] * strength)
      + 0.5 - prevRgab[2] * strength + nextRgba[2] * strength
    ) / 3
    data[i] = result * rgba[3] * 255
    data[i + 1] = result * rgba[3] * 255
    data[i + 2] = result * rgba[3] * 255
    prevRgab = rgba
  }
}
