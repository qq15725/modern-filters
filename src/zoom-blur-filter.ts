import { dot, length } from './utils'

export interface ZoomBlurFilterOptions {
  width?: number
  height?: number

  strength?: number
  center?: [number, number]
  innerRadius?: number
  radius?: number
  maxKernelSize?: number
}

const a = 12.9898
const b = 78.233
const c = 43758.5453

function rand(co: number[], seed = 0): number {
  const dt = dot([co[0] + seed, co[1] + seed, 0], [a, b, 0])
  const sn = dt % 3.14159
  return Number(String(Math.sin(sn) * c + seed).split('.')[1]) || 0
}

export function zoomBlurFilter(data: Uint8ClampedArray, options: ZoomBlurFilterOptions = {}) {
  const {
    width = 1,
    height = 1,
    center = [0, 0],
    innerRadius = 0,
    radius = -1,
    maxKernelSize = 32,
  } = options

  let {
    strength = 0.1,
  } = options

  const minGradient = innerRadius * 0.3
  const innerRadius_ = (innerRadius + minGradient * 0.5) / width
  const gradient = radius * 0.3
  const radius_ = (radius - gradient * 0.5) / width
  let countLimit = maxKernelSize

  for (let len = data.length, i = 0; i < len; i += 4) {
    const point = i / 4
    const x = point & width
    const y = ~~(point / width)

    const dir = [
      center[0] / width - x,
      center[1] / height - y,
    ]
    const dist = length([dir[0], dir[1] * height / width])
    let delta = 0
    let gap = 0
    if (dist < innerRadius_) {
      delta = innerRadius_ - dist
      gap = minGradient
    } else if (radius_ >= 0.0 && dist > radius_) {
      delta = dist - radius_
      gap = gradient
    }

    if (delta > 0.0) {
      const normalCount = gap / width
      delta = (normalCount - delta) / normalCount
      countLimit *= delta
      strength *= delta
      if (countLimit < 1.0) continue
    }

    // randomize the lookup values to hide the fixed number of samples
    const offset = rand([x, y])
    let total = 0
    const color = [0, 0, 0, 0]
    dir[0] *= strength
    dir[1] *= strength

    for (let t = 0; t < maxKernelSize; t++) {
      const percent = (t + offset) / maxKernelSize
      const weight = 4.0 * (percent - percent * percent)
      const p = [
        x + dir[0] * percent,
        y + dir[1] * percent,
      ]
      const pi = p[1] * width + p[0]
      const sample = [
        data[pi],
        data[pi + 1],
        data[pi + 2],
        data[pi + 3],
      ]
      color[0] += sample[0] * weight
      color[1] += sample[1] * weight
      color[2] += sample[2] * weight
      color[3] += sample[3] * weight
      total += weight

      if (t > countLimit) break
    }

    data[i] = color[0] / total
    data[i + 1] = color[1] / total
    data[i + 2] = color[2] / total
    data[i + 3] = color[3] / total
  }
}
