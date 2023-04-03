import { defineFilter } from './define-filter'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float gamma;
uniform float contrast;
uniform float saturation;
uniform float brightness;
uniform float red;
uniform float green;
uniform float blue;
uniform float alpha;

void main(void) {
  vec4 c = texture2D(uSampler, vTextureCoord);
  if (c.a > 0.0) {
      c.rgb /= c.a;
      vec3 rgb = pow(c.rgb, vec3(1. / gamma));
      rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);
      rgb.r *= red;
      rgb.g *= green;
      rgb.b *= blue;
      c.rgb = rgb * brightness;
      c.rgb *= c.a;
  }
  gl_FragColor = c * alpha;
}
`

export interface AdjustmentFilterOptions {
  gamma?: number
  saturation?: number
  contrast?: number
  brightness?: number
  red?: number
  green?: number
  blue?: number
  alpha?: number
}

export function createAdjustmentFilter(options: AdjustmentFilterOptions = {}) {
  const {
    saturation = 1,
    contrast = 1,
    brightness = 1,
    red = 1,
    green = 1,
    blue = 1,
    alpha = 1,
  } = options

  let {
    gamma = 1,
  } = options

  gamma = Math.max(gamma, 0.0001)

  return defineFilter((texture) => {
    texture.registerProgram({
      fragmentShader,
      uniforms: {
        saturation,
        contrast,
        brightness,
        red,
        green,
        blue,
        alpha,
        gamma,
      },
    })
  })
}
