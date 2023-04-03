import { defineFilter } from './define-filter'
import type { AnimationFilterOptions } from './types'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uOffset;

void main(void) {
    vec4 color = vec4(0.0);
    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y));
    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y));
    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y));
    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y));
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
    blur = 4,
    quality = 3,
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
        texture.registerProgram({ fragmentShader, uniforms: { uOffset } })
      }
      offset = kernels[last] + 0.5
      uOffset[0] = offset * uvX
      uOffset[1] = offset * uvY
    }
    texture.registerProgram({ fragmentShader, uniforms: { uOffset } })
  })
}
