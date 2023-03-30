export function mix(x: number, y: number, level: number) {
  return x * (1 - level) + y * level
}

export function dot(rgb1: number[], rgb2: number[]) {
  return rgb1[0] * rgb2[0] + rgb1[1] * rgb2[1] + rgb1[2] * rgb2[2]
}
