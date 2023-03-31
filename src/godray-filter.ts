import { abs, dot, floor, fract, mix, mod, step } from './utils'

export interface GodrayFilterOptions {
  angle?: number
  gain?: number
  lacunarity?: number
  parallel?: boolean
  time?: number
  center?: number[]
  alpha?: number
}

export function godrayFilter(imageData: ImageData, options: GodrayFilterOptions = {}) {
  const { width, height, data } = imageData

  const {
    angle = 30,
    gain = 0.5,
    lacunarity = 2.5,
    time = 0,
    parallel = true,
    center = [0, 0],
    alpha = 1,
  } = options

  const radians = angle / Math.PI
  const light = parallel ? [Math.cos(radians), Math.sin(radians)] : center
  const dimensions = [width, height]
  const aspect = height / width

  for (let len = data.length, i = 0; i < len; i += 4) {
    const point = i / 4
    const xy = [(point % width) / width, ~~(point / width) / height]

    let d: number
    if (parallel) {
      d = (light[0] * xy[0]) + (light[1] * xy[1] * aspect)
    } else {
      const dx = xy[0] - light[0] / dimensions[0]
      const dy = (xy[1] - light[1] / dimensions[1]) * aspect
      d = dy / (Math.sqrt(dx * dx + dy * dy) + 0.00001)
    }

    let noise = turb(
      [d + time * 0.05, d, (62.1 + time) * 0.05],
      [480, 320, 480],
      lacunarity,
      gain,
    )
    noise = noise * 0.7 * (1 - xy[1]) * alpha
    data[i] = (data[i] / 255 + noise) * 255
    data[i + 1] = (data[i + 1] / 255 + noise) * 255
    data[i + 2] = (data[i + 2] / 255 + noise) * 255
    data[i + 3] *= alpha
  }
}

function permute(x: number[]) {
  return [
    (((x[0] * 34) + 1) * x[0]) % 289,
    (((x[1] * 34) + 1) * x[1]) % 289,
    (((x[2] * 34) + 1) * x[2]) % 289,
    (((x[3] * 34) + 1) * x[3]) % 289,
  ]
}

const TAYLOR_INV_SQRT = 1.79284291400159 - 0.85373472095314
function taylorInvSqrt(r: number[]) {
  return [
    r[0] * TAYLOR_INV_SQRT,
    r[1] * TAYLOR_INV_SQRT,
    r[2] * TAYLOR_INV_SQRT,
    r[3] * TAYLOR_INV_SQRT,
  ]
}

function fade(t: number[]) {
  return [
    t[0] * t[0] * t[0] * (t[0] * (t[0] * 6 - 15) + 10),
    t[1] * t[1] * t[1] * (t[1] * (t[1] * 6 - 15) + 10),
    t[2] * t[2] * t[2] * (t[2] * (t[2] * 6 - 15) + 10),
  ]
}

function pnoise(P: number[], rep: number[]) {
  let Pi0 = mod(floor(P), rep)
  let Pi1 = mod([Pi0[0] + 1, Pi0[1] + 1, Pi0[2] + 1], rep)
  Pi0 = mod(Pi0, [289, 289, 289])
  Pi1 = mod(Pi1, [289, 289, 289])
  const Pf0 = fract(P)
  const Pf1 = [Pf0[0] - 1, Pf0[1] - 1, Pf0[2] - 1]
  const ix = [Pi0[0], Pi1[0], Pi0[0], Pi1[0]]
  const iy = [Pi0[1], Pi0[1], Pi1[1], Pi1[1]]
  const iz0 = [Pi0[2], Pi0[2], Pi0[2], Pi0[2]]
  const iz1 = [Pi1[2], Pi1[2], Pi1[2], Pi1[2]]
  const ixy_ = permute(ix)
  const ixy = permute([ixy_[0] + iy[0], ixy_[1] + iy[1], ixy_[2] + iy[2], ixy_[3] + iy[3]])
  const ixy0 = permute([ixy[0] + iz0[0], ixy[1] + iz0[1], ixy[2] + iz0[2], ixy[3] + iz0[3]])
  const ixy1 = permute([ixy[0] + iz1[0], ixy[1] + iz1[1], ixy[2] + iz1[2], ixy[3] + iz1[3]])
  const gx0_ = (1.0 / 7.0)
  let gx0 = [ixy0[0] * gx0_, ixy0[1] * gx0_, ixy0[2] * gx0_, ixy0[3] * gx0_]
  const gy0_ = floor(gx0)
  const gy0__ = (1.0 / 7.0)
  const gy0___ = fract([gy0_[0] * gy0__, gy0_[1] * gy0__, gy0_[2] * gy0__, gy0_[3] * gy0__])
  const gy0 = [gy0___[0] - 0.5, gy0___[1] - 0.5, gy0___[2] - 0.5, gy0___[3] - 0.5]
  gx0 = fract(gx0)
  const gz0_ = abs(gx0)
  const gz0__ = abs(gy0)
  const gz0 = [
    0.5 - gz0_[0] - gz0__[0],
    0.5 - gz0_[1] - gz0__[1],
    0.5 - gz0_[2] - gz0__[2],
    0.5 - gz0_[3] - gz0__[3],
  ]
  const sz0 = step(gz0, [0, 0, 0, 0])
  const gx0t_ = step([0, 0, 0, 0], gx0)
  gx0[0] -= sz0[0] * (gx0t_[0] - 0.5)
  gx0[1] -= sz0[1] * (gx0t_[1] - 0.5)
  gx0[2] -= sz0[2] * (gx0t_[2] - 0.5)
  gx0[3] -= sz0[3] * (gx0t_[3] - 0.5)
  const gy0t_ = step([0, 0, 0, 0], gy0)
  gy0[0] -= sz0[0] * (gy0t_[0] - 0.5)
  gy0[1] -= sz0[1] * (gy0t_[1] - 0.5)
  gy0[2] -= sz0[2] * (gy0t_[2] - 0.5)
  gy0[3] -= sz0[3] * (gy0t_[3] - 0.5)
  const gx1r_ = (1.0 / 7.0)
  let gx1 = [
    ixy1[0] * gx1r_,
    ixy1[1] * gx1r_,
    ixy1[2] * gx1r_,
    ixy1[3] * gx1r_,
  ]
  const gy1_ = floor(gx1)
  const gy1r_ = 1.0 / 7.0
  const gy1__ = fract([gy1_[0] * gy1r_, gy1_[1] * gy1r_, gy1_[2] * gy1r_, gy1_[3] * gy1r_])
  const gy1 = [
    gy1__[0] - 0.5,
    gy1__[1] - 0.5,
    gy1__[2] - 0.5,
    gy1__[3] - 0.5,
  ]
  gx1 = fract(gx1)
  const gz1_ = abs(gx1)
  const gz1__ = abs(gy1)
  const gz1 = [
    0.5 - gz1_[0] - gz1__[0],
    0.5 - gz1_[1] - gz1__[1],
    0.5 - gz1_[2] - gz1__[2],
    0.5 - gz1_[3] - gz1__[3],
  ]
  const sz1 = step(gz1, [0, 0, 0, 0])
  const gxt_ = step([0, 0, 0, 0], gx1)
  gx1[0] -= sz1[0] * (gxt_[0] - 0.5)
  gx1[1] -= sz1[1] * (gxt_[1] - 0.5)
  gx1[2] -= sz1[2] * (gxt_[2] - 0.5)
  gx1[3] -= sz1[3] * (gxt_[3] - 0.5)
  const gy1t_ = step([0, 0, 0, 0], gy1)
  gy1[0] -= sz1[0] * (gy1t_[0] - 0.5)
  gy1[1] -= sz1[1] * (gy1t_[1] - 0.5)
  gy1[2] -= sz1[2] * (gy1t_[2] - 0.5)
  gy1[3] -= sz1[3] * (gy1t_[3] - 0.5)
  const g000 = [gx0[0], gy0[0], gz0[0]]
  const g100 = [gx0[1], gy0[1], gz0[1]]
  const g010 = [gx0[2], gy0[2], gz0[2]]
  const g110 = [gx0[3], gy0[3], gz0[3]]
  const g001 = [gx1[0], gy1[0], gz1[0]]
  const g101 = [gx1[1], gy1[1], gz1[1]]
  const g011 = [gx1[2], gy1[2], gz1[2]]
  const g111 = [gx1[3], gy1[3], gz1[3]]
  const norm0 = taylorInvSqrt([dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)])
  g000[0] *= norm0[0]
  g000[1] *= norm0[0]
  g000[2] *= norm0[0]
  g010[0] *= norm0[1]
  g010[1] *= norm0[1]
  g010[2] *= norm0[1]
  g100[0] *= norm0[2]
  g100[1] *= norm0[2]
  g100[2] *= norm0[2]
  g110[0] *= norm0[3]
  g110[1] *= norm0[3]
  g110[2] *= norm0[3]
  const norm1 = taylorInvSqrt([dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)])
  g001[0] *= norm1[0]
  g001[1] *= norm1[0]
  g001[2] *= norm1[0]
  g011[0] *= norm1[1]
  g011[1] *= norm1[1]
  g011[2] *= norm1[1]
  g101[0] *= norm1[2]
  g101[1] *= norm1[2]
  g101[2] *= norm1[2]
  g111[0] *= norm1[3]
  g111[1] *= norm1[3]
  g111[2] *= norm1[3]
  const n000 = dot(g000, Pf0)
  const n100 = dot(g100, [Pf1[0], Pf0[1], Pf0[2]])
  const n010 = dot(g010, [Pf0[0], Pf1[1], Pf0[2]])
  const n110 = dot(g110, [Pf1[0], Pf1[1], Pf0[2]])
  const n001 = dot(g001, [Pf0[0], Pf0[1], Pf1[2]])
  const n101 = dot(g101, [Pf1[0], Pf0[1], Pf1[2]])
  const n011 = dot(g011, [Pf0[0], Pf1[1], Pf1[2]])
  const n111 = dot(g111, Pf1)
  const fade_xyz = fade(Pf0)
  const n_z = [
    mix(n000, n001, fade_xyz[2]),
    mix(n100, n101, fade_xyz[2]),
    mix(n010, n011, fade_xyz[2]),
    mix(n110, n111, fade_xyz[2]),
  ]
  const n_yz = [
    mix(n_z[0], n_z[2], fade_xyz[1]),
    mix(n_z[1], n_z[3], fade_xyz[1]),
  ]
  return 2.2 * mix(n_yz[0], n_yz[1], fade_xyz[0])
}

function turb(
  p: number[],
  rep: number[],
  lacunarity: number,
  gain: number,
) {
  let sum = 0
  let sc = 1
  let totalgain = 1
  for (let i = 0; i < 6; i++) {
    sum += totalgain * pnoise([p[0] * sc, p[1] * sc, p[2] * sc], rep)
    sc *= lacunarity
    totalgain *= gain
  }
  return Math.abs(sum)
}
