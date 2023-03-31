export interface EmbossFilterOptions {
  strength?: number
}

export function embossFilter(imageData: ImageData, options: EmbossFilterOptions = {}) {
  const {
    width,
    height,
    data,
  } = imageData

  const {
    strength = 5,
  } = options

  const rawData = data.slice(0)

  for (let len = data.length, i = 0; i < len; i += 4) {
    const alpha = data[i + 3] / 255
    const point = i / 4
    const xy = [(point % width), ~~(point / width)]
    const prevI = (Math.max(xy[0] - 1, 0) + Math.max(xy[1] - 1, 0) * width) * 4
    const prev = [
      (rawData[prevI] ?? 0) / 255,
      (rawData[prevI + 1] ?? 0) / 255,
      (rawData[prevI + 2] ?? 0) / 255,
    ]
    const nextI = (Math.min(xy[0] + 1, width) + Math.min(xy[1] + 1, height) * width) * 4
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
    data[i] = result
    data[i + 1] = result
    data[i + 2] = result
  }
}
