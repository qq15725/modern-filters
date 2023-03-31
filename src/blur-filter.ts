export interface BlurFilterOptions {
  strength?: number
  quality?: number
}

export function blurFilter(imageData: ImageData, options: BlurFilterOptions = {}) {
  const {
    width,
    height,
    data,
  } = imageData

  const {
    strength = 6,
  } = options

  const {
    quality = 1,
  } = options

  const strengthX = (1 / width) * strength / quality
  const strengthY = (1 / height) * strength / quality

  const kernelSize = 5
  const halfLength = Math.ceil(kernelSize / 2)
  const gaussians = [0.153388, 0.221461, 0.250301]

  let rawData = data.slice()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (x + y * width) * 4
      const rgbX = [0, 0, 0, 0]
      for (let i = 0; i < kernelSize; i++) {
        const sampleIndex = i - (halfLength - 1)
        const newX = ~~((x / width + sampleIndex * strengthX) * width)
        if (newX > width) continue
        const ip = (newX + y * width) * 4
        let value = i
        if (i >= halfLength) value = kernelSize - i - 1
        const gaussian = gaussians[value]
        rgbX[0] += (rawData[ip] ?? 0) / 255 * gaussian
        rgbX[1] += (rawData[ip + 1] ?? 0) / 255 * gaussian
        rgbX[2] += (rawData[ip + 2] ?? 0) / 255 * gaussian
        rgbX[3] += (rawData[ip + 3] ?? 0) / 255 * gaussian
      }
      data[p] = rgbX[0] * 255
      data[p + 1] = rgbX[1] * 255
      data[p + 2] = rgbX[2] * 255
      data[p + 3] = rgbX[3] * 255
    }
  }

  rawData = data.slice()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (x + y * width) * 4
      const rgbY = [0, 0, 0, 0]
      for (let i = 0; i < kernelSize; i++) {
        const sampleIndex = i - (halfLength - 1)
        const newY = ~~((y / height + sampleIndex * strengthY) * height)
        const ip = (x + newY * width) * 4
        let value = i
        if (i >= halfLength) value = kernelSize - i - 1
        const gaussian = gaussians[value]
        rgbY[0] += (rawData[ip] ?? 0) / 255 * gaussian
        rgbY[1] += (rawData[ip + 1] ?? 0) / 255 * gaussian
        rgbY[2] += (rawData[ip + 2] ?? 0) / 255 * gaussian
        rgbY[3] += (rawData[ip + 3] ?? 0) / 255 * gaussian
      }
      data[p] = rgbY[0] * 255
      data[p + 1] = rgbY[1] * 255
      data[p + 2] = rgbY[2] * 255
      data[p + 3] = rgbY[3] * 255
    }
  }
}
