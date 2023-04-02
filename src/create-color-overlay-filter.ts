import { defineFilter } from './define-filter'
import type { RGBA } from './types'

export interface ColorOverlayFilterOptions {
  color?: RGBA
}

const fragmentShader = `
precision mediump float;
uniform sampler2D uSampler;
uniform vec3 uColor;
uniform float uAlpha;
varying vec2 vTextureCoord;

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(mix(color.rgb, uColor, color.a * uAlpha), color.a);
}
`

export function createColorOverlayFilter(options: ColorOverlayFilterOptions = {}) {
  const {
    color = [1, 0, 0, 0.5],
  } = options

  return defineFilter(({ registerProgram }) => {
    registerProgram({
      fragmentShader,
      uniforms: {
        uColor: [color[0], color[1], color[2]],
        uAlpha: color[3],
      },
    })
  })
}

