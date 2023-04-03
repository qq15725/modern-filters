import { defineFilter } from './define-filter'
import animation from './shaders/animation.frag?raw'

import type { AnimationFilterOptions } from './types'

const fragmentShader = `
uniform sampler2D uSampler;
varying vec2 vTextureCoord;
uniform float uTime;
uniform float uDuration;
uniform bool uIsOut;
uniform bool uLoop;

${ animation }

void main(void) {
  float time = normalizeTime(uTime, uDuration, uLoop, uIsOut);
  float offset = 0.2;
  if (uIsOut) {
    offset = 0.0;
  }
  vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(color.rgb, linear(time, offset, 1.0, uDuration));
}
`

export interface FadeFilterOptions extends AnimationFilterOptions {
  //
}

export function createFadeFilter(options: FadeFilterOptions = {}) {
  const {
    mode = 'in',
    duration = 1.8,
    loop = false,
  } = options

  return defineFilter(({ registerProgram }) => {
    registerProgram({
      fragmentShader,
      uniforms: {
        uIsOut: mode !== 'in',
        uDuration: duration,
        uLoop: loop,
      },
    })
  })
}
