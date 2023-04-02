import { defineFilter } from './define-filter'

export interface EmbossFilterOptions {
  strength?: number
}

const fragmentShader = `
precision mediump float;
uniform sampler2D uSampler;
uniform vec2 uDimension;
uniform float uStrength;
varying vec2 vTextureCoord;

void main(void)
{
  vec2 onePixel = vec2(1.0 / uDimension);
  vec4 color;
  color.rgb = vec3(0.5);
  color -= texture2D(uSampler, vTextureCoord - onePixel) * uStrength;
  color += texture2D(uSampler, vTextureCoord + onePixel) * uStrength;
  color.rgb = vec3((color.r + color.g + color.b) / 3.0);
  float alpha = texture2D(uSampler, vTextureCoord).a;
  gl_FragColor = vec4(color.rgb * alpha, alpha);
}
`

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
