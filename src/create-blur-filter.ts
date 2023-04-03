import { defineFilter } from './define-filter'

const vertexXShader = `
attribute vec2 aPosition;
varying vec2 vTextureCoord;
uniform float uStrength;
varying vec2 vBlurTextureCoords[5];

void main(void)
{
    gl_Position = vec4(aPosition, 0, 1);
    vTextureCoord = step(0.0, aPosition);
    vBlurTextureCoords[0] =  vTextureCoord + vec2(-2.0 * uStrength, 0.0);
    vBlurTextureCoords[1] =  vTextureCoord + vec2(-1.0 * uStrength, 0.0);
    vBlurTextureCoords[2] =  vTextureCoord + vec2(0.0 * uStrength, 0.0);
    vBlurTextureCoords[3] =  vTextureCoord + vec2(1.0 * uStrength, 0.0);
    vBlurTextureCoords[4] =  vTextureCoord + vec2(2.0 * uStrength, 0.0);
}
`

const vertexYShader = `
attribute vec2 aPosition;
varying vec2 vTextureCoord;
uniform float uStrength;
varying vec2 vBlurTextureCoords[5];

void main(void)
{
    gl_Position = vec4(aPosition, 0, 1);
    vTextureCoord = step(0.0, aPosition);
    vBlurTextureCoords[0] =  vTextureCoord + vec2(0.0, -2.0 * uStrength);
    vBlurTextureCoords[1] =  vTextureCoord + vec2(0.0, -1.0 * uStrength);
    vBlurTextureCoords[2] =  vTextureCoord + vec2(0.0, 0.0 * uStrength);
    vBlurTextureCoords[3] =  vTextureCoord + vec2(0.0, 1.0 * uStrength);
    vBlurTextureCoords[4] =  vTextureCoord + vec2(0.0, 2.0 * uStrength);
}
`

const fragmentShader = `
varying vec2 vBlurTextureCoords[5];
uniform sampler2D uSampler;

void main(void)
{
  gl_FragColor = vec4(0.0);
  gl_FragColor += texture2D(uSampler, vBlurTextureCoords[0]) * 0.153388;
  gl_FragColor += texture2D(uSampler, vBlurTextureCoords[1]) * 0.221461;
  gl_FragColor += texture2D(uSampler, vBlurTextureCoords[2]) * 0.250301;
  gl_FragColor += texture2D(uSampler, vBlurTextureCoords[3]) * 0.221461;
  gl_FragColor += texture2D(uSampler, vBlurTextureCoords[4]) * 0.153388;
}
`

export interface BlurFilterOptions {
  strength?: number
  quality?: number
}

export function createBlurFilter(options: BlurFilterOptions = {}) {
  const {
    strength = 6,
    quality = 1,
  } = options

  return defineFilter(texture => {
    texture.registerProgram({
      vertexShader: vertexXShader,
      fragmentShader,
      uniforms: {
        uStrength: (1 / texture.width) * strength / quality,
      },
    })

    texture.registerProgram({
      vertexShader: vertexYShader,
      fragmentShader,
      uniforms: {
        uStrength: (1 / texture.height) * strength / quality,
      },
    })
  })
}
