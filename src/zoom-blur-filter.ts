import { length } from './utils'

export interface ZoomBlurFilterOptions {
  strength?: number
  center?: [number, number]
  innerRadius?: number
  radius?: number
  maxKernelSize?: number
}

export function zoomBlurFilter(imageData: ImageData, options: ZoomBlurFilterOptions = {}) {
  const {
    width,
    height,
    data,
  } = imageData

  const {
    center = [width / 2, height / 2],
    maxKernelSize = 5,
  } = options

  let {
    innerRadius = 0,
    radius = -1,
    strength = 0.1,
  } = options

  const rawData = data.slice(0)

  const minGradient = innerRadius * 0.3
  innerRadius = (innerRadius + minGradient * 0.5) / width
  const gradient = radius * 0.3
  radius = (radius - gradient * 0.5) / width
  let countLimit = maxKernelSize

  for (let len = data.length, i = 0; i < len; i += 4) {
    const point = i / 4
    const xy = [(point % width) / width, ~~(point / width) / height]

    const dir = [
      center[0] / width - xy[0],
      center[1] / height - xy[1],
    ]
    const dist = length([dir[0], dir[1] * height / width, 0])
    let delta = 0
    let gap = 0
    if (dist < innerRadius) {
      delta = innerRadius - dist
      gap = minGradient
    } else if (radius >= 0.0 && dist > radius) {
      delta = dist - radius
      gap = gradient
    }

    if (delta > 0.0) {
      const normalCount = gap / width
      delta = (normalCount - delta) / normalCount
      countLimit *= delta
      strength *= delta
      if (countLimit < 1.0) continue
    }

    const offset = Math.random()
    dir[0] *= strength
    dir[1] *= strength

    const color = [0, 0, 0, 0]
    let total = 0
    for (let t = 0; t < maxKernelSize; t++) {
      const percent = (t + offset) / maxKernelSize
      const weight = 4.0 * (percent - percent * percent)
      const px = ~~((xy[0] + dir[0] * percent) * width)
      const py = ~~((xy[1] + dir[1] * percent) * height)
      const pi = (py * width + px) * 4
      const rate = 1 / 255 * weight
      color[0] += rawData[pi] * rate
      color[1] += rawData[pi + 1] * rate
      color[2] += rawData[pi + 2] * rate
      color[3] += rawData[pi + 3] * rate
      total += weight

      if (t > countLimit) break
    }

    const rate = 1 / total * 255
    data[i] = color[0] * rate
    data[i + 1] = color[1] * rate
    data[i + 2] = color[2] * rate
    data[i + 3] = color[3] * rate
  }
}
