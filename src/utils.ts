export function mix(x: number, y: number, level: number): number {
  return x * (1 - level) + y * level
}

export function dot(x: number[], y: number[]): number {
  let result = 0
  for (let len = x.length, i = 0; i < len; i++) {
    result += x[i] * y[i]
  }
  return result
}

export function length(value: number[]): number {
  let result = 0
  for (let len = value.length, i = 0; i < len; i++) {
    result += Math.pow(value[i], 2)
  }
  return result
}

export function mod(x: number[], y: number[]): number[] {
  const result: number[] = []
  for (let len = x.length, i = 0; i < len; i++) {
    result[i] = x[i] % y[i]
  }
  return result
}
