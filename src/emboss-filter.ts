export interface EmbossFilterOptions {
  strength?: number
}

export function embossFilter(data: Uint8ClampedArray, options: EmbossFilterOptions = {}) {
  const {
    strength = 5,
  } = options

  const rawData = data.slice(0)
  for (let length = data.length, i = 0; i < length; i += 4) {
    const color = [
      127 - (rawData[i - 4] ?? 0) * strength + (rawData[i + 4] ?? 0) * strength,
      127 - (rawData[i - 3] ?? 0) * strength + (rawData[i + 5] ?? 0) * strength,
      127 - (rawData[i - 2] ?? 0) * strength + (rawData[i + 6] ?? 0) * strength,
    ]
    const rgb = (color[0] + color[1] + color[2]) / 3
    const alpha = rawData[i + 3] / 255
    data[i] = rgb * alpha
    data[i + 1] = rgb * alpha
    data[i + 2] = rgb * alpha
  }
}
