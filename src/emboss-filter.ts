export interface EmbossFilterOptions {
  strength?: number
}

export function embossFilter(imageData: ImageData, options: EmbossFilterOptions = {}) {
  const { width, height, data } = imageData

  const {
    strength = 5,
  } = options

  const rawData = data.slice(0)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (x + y * width) * 4
      const alpha = data[p + 3] / 255
      const prevI = (Math.max(x - 1, 0) + Math.max(y - 1, 0) * width) * 4
      const prev = [
        (rawData[prevI] ?? 0) / 255,
        (rawData[prevI + 1] ?? 0) / 255,
        (rawData[prevI + 2] ?? 0) / 255,
      ]
      const nextI = (Math.min(x + 1, width - 1) + Math.min(y + 1, height - 1) * width) * 4
      const next = [
        (rawData[nextI] ?? 0) / 255,
        (rawData[nextI + 1] ?? 0) / 255,
        (rawData[nextI + 2] ?? 0) / 255,
      ]
      const result = (
        (0.5 - prev[0] * strength + next[0] * strength)
        + (0.5 - prev[1] * strength + next[1] * strength)
        + 0.5 - prev[2] * strength + next[2] * strength
      ) / 3 * alpha * 255
      data[p] = result
      data[p + 1] = result
      data[p + 2] = result
    }
  }
}
