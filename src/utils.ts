export function mix(x: number, y: number, level: number) {
  return x * (1 - level) + y * level
}
