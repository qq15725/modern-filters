import { defineFilter } from './define-filter'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform vec2 uSize;
uniform sampler2D uSampler;
uniform vec4 uFilterArea;

vec2 mapCoord(vec2 coord) {
  coord *= uFilterArea.xy;
  coord += uFilterArea.zw;
  return coord;
}

vec2 unmapCoord(vec2 coord) {
  coord -= uFilterArea.zw;
  coord /= uFilterArea.xy;
  return coord;
}

vec2 pixelate(vec2 coord, vec2 size) {
  return floor(coord / size) * size;
}

void main(void) {
  vec2 coord = mapCoord(vTextureCoord);
  coord = pixelate(coord, uSize);
  coord = unmapCoord(coord);
  gl_FragColor = texture2D(uSampler, coord);
}
`

export interface PixelateFilterOptions {
  size?: number
}

export function createPixelateFilter(options: PixelateFilterOptions = {}) {
  const {
    size = 10,
  } = options

  return defineFilter(texture => {
    texture.registerProgram({
      fragmentShader,
      uniforms: {
        uSize: [size, size],
      },
    })
  })
}
