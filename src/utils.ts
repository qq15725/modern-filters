export function mix(x: number, y: number, level: number) {
  return x * (1 - level) + y * level
}

export function dot(rgb1: number[], rgb2: number[]) {
  return rgb1[0] * rgb2[0] + rgb1[1] * rgb2[1] + rgb1[2] * rgb2[2]
}

export function length(value: number[]) {
  return Math.pow(value[0], 2) + Math.pow(value[1], 2) + Math.pow(value[2], 2)
}
