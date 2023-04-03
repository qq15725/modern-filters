import { defineFilter } from './define-filter'

const fragmentShader = `
precision mediump float;
uniform sampler2D uSampler;
uniform vec4 uInputSize;
uniform float uStrength;
varying vec2 vTextureCoord;

void main(void) {
  vec2 onePixel = uInputSize.zw;
  vec4 color;
  color.rgb = vec3(0.5);
  color -= texture2D(uSampler, vTextureCoord - onePixel) * uStrength;
  color += texture2D(uSampler, vTextureCoord + onePixel) * uStrength;
  color.rgb = vec3((color.r + color.g + color.b) / 3.0);
  float alpha = texture2D(uSampler, vTextureCoord).a;
  gl_FragColor = vec4(color.rgb * alpha, alpha);
}
`

export interface EmbossFilterOptions {
  strength?: number
}

export function createEmbossFilter(options: EmbossFilterOptions = {}) {
  const {
    strength = 5,
  } = options

  return defineFilter(({ registerProgram }) => {
    registerProgram({
      fragmentShader,
      uniforms: {
        uStrength: strength,
      },
    })
  })
}
