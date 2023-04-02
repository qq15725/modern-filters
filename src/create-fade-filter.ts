import { defineFilter } from './define-filter'

export interface FadeFilterOptions {
  duration?: number
}

const fragmentShader = `
uniform sampler2D uSampler;
uniform float uTime;
uniform float uDuration;
varying vec2 vTextureCoord;

void main(void)
{
  vec4 color = texture2D(uSampler, vTextureCoord);
  float rate = mod(uTime, uDuration) / uDuration;
  gl_FragColor = vec4(color.rgb, color.a * rate);
}
`

export function createFadeFilter(options: FadeFilterOptions = {}) {
  const {
    duration = 1.8,
  } = options

  return defineFilter(({ registerProgram }) => {
    registerProgram({
      fragmentShader,
      uniforms: {
        uDuration: duration,
      },
    })
  })
}
