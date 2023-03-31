export interface BlurFilterOptions {
  strength?: number
  quality?: number
}

export function blurFilter(imageData: ImageData, options: BlurFilterOptions = {}) {
  const { width, height, data } = imageData

  const {
    strength = 6,
    quality = 1,
  } = options

  const strengthX = (1 / width) * strength / quality
  const strengthY = (1 / height) * strength / quality
  const kernelSize = 5
  const halfLength = Math.ceil(kernelSize / 2)
  const gaussianList = [0.153388, 0.221461, 0.250301]
  const cache: { x: number; y: number; p: number }[] = []

  let rawData = data.slice()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rgb = [0, 0, 0, 0]
      const startY = y * width * 4
      for (let i = 0; i < kernelSize; i++) {
        const sampleIndex = i - (halfLength - 1)
        let value = i
        if (i >= halfLength) value = kernelSize - i - 1
        const gaussian = gaussianList[value]
        let newX = x + ~~((sampleIndex * strengthX) * width)
        newX = Math.min(width - 1, Math.max(0, newX))
        const p = newX * 4 + startY
        rgb[0] += rawData[p] * gaussian
        rgb[1] += rawData[p + 1] * gaussian
        rgb[2] += rawData[p + 2] * gaussian
        rgb[3] += rawData[p + 3] * gaussian
      }
      const p = x * 4 + startY
      data[p] = rgb[0]
      data[p + 1] = rgb[1]
      data[p + 2] = rgb[2]
      data[p + 3] = rgb[3]
      cache.push({ x, y, p })
    }
  }

  rawData = data.slice()

  for (let len = cache.length, i = 0; i < len; i++) {
    const { x, y, p } = cache[i]
    const rgb = [0, 0, 0, 0]
    for (let i = 0; i < kernelSize; i++) {
      const sampleIndex = i - (halfLength - 1)
      let value = i
      if (i >= halfLength) value = kernelSize - i - 1
      const gaussian = gaussianList[value]
      let newY = y + ~~((sampleIndex * strengthY) * height)
      newY = Math.min(height - 1, Math.max(0, newY))
      const p = (x + newY * width) * 4
      rgb[0] += rawData[p] * gaussian
      rgb[1] += rawData[p + 1] * gaussian
      rgb[2] += rawData[p + 2] * gaussian
      rgb[3] += rawData[p + 3] * gaussian
    }
    data[p] = rgb[0]
    data[p + 1] = rgb[1]
    data[p + 2] = rgb[2]
    data[p + 3] = rgb[3]
  }
}
