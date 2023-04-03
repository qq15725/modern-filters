import { defineFilter } from './define-filter'
import animation from './shaders/animation.frag?raw'
import type { AnimationFilterOptions } from './types'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uOffset;
uniform float uTime;
uniform float uDuration;
uniform bool uIsOut;
uniform bool uLoop;

${ animation }

void main(void) {
  float time = normalizeTime(uTime, uDuration, uLoop, uIsOut);
  vec2 offset = vec2(uOffset.x - linear(time, 0.0, uOffset.x, uDuration), uOffset.y - linear(time, 0.0, uOffset.y, uDuration));
  vec4 color = vec4(0.0);
  color += texture2D(uSampler, vec2(vTextureCoord.x - offset.x, vTextureCoord.y + offset.y));
  color += texture2D(uSampler, vec2(vTextureCoord.x + offset.x, vTextureCoord.y + offset.y));
  color += texture2D(uSampler, vec2(vTextureCoord.x + offset.x, vTextureCoord.y - offset.y));
  color += texture2D(uSampler, vec2(vTextureCoord.x - offset.x, vTextureCoord.y - offset.y));
  color *= 0.25;
  gl_FragColor = color;
}
`

export interface KawaseBlurFilterOptions extends AnimationFilterOptions {
  blur?: number
  quality?: number
}

export function createKawaseBlurFilter(options: KawaseBlurFilterOptions = {}) {
  const {
    blur = 10,
    quality = 3,
    mode = 'in',
    duration = 1.8,
    loop = false,
  } = options

  const kernels = [blur]
  if (blur > 0) {
    let k = blur
    const step = blur / quality
    for (let i = 1; i < quality; i++) {
      k -= step
      kernels.push(k)
    }
  }

  const sharedUniforms = {
    uIsOut: mode !== 'in',
    uDuration: duration,
    uLoop: loop,
  }

  return defineFilter((texture) => {
    const uvX = 1 / texture.width
    const uvY = 1 / texture.height

    const uOffset = []
    let offset: number
    if (quality === 1 || blur === 0) {
      offset = kernels[0] + 0.5
      uOffset[0] = offset * uvX
      uOffset[1] = offset * uvY
    } else {
      const last = quality - 1
      for (let i = 0; i < last; i++) {
        offset = kernels[i] + 0.5
        uOffset[0] = offset * uvX
        uOffset[1] = offset * uvY
        texture.registerProgram({ fragmentShader, uniforms: { ...sharedUniforms, uOffset } })
      }
      offset = kernels[last] + 0.5
      uOffset[0] = offset * uvX
      uOffset[1] = offset * uvY
    }
    texture.registerProgram({ fragmentShader, uniforms: { ...sharedUniforms, uOffset } })
  })
}
