import { defineFilter } from './define-filter'
import perlin from './shaders/perlin.frag?raw'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 uInputSize;
uniform vec2 uLight;
uniform bool uParallel;
uniform float uAspect;
uniform float uGain;
uniform float uLacunarity;
uniform float uTime;
uniform float uAlpha;

${ perlin }

void main(void) {
  vec2 coord = vTextureCoord;
  float d;
  if (uParallel) {
      d = (uLight.x * coord.x) + (uLight.y * coord.y * uAspect);
  } else {
      float dx = coord.x - uLight.x / uInputSize.x;
      float dy = (coord.y - uLight.y / uInputSize.y) * uAspect;
      float dis = sqrt(dx * dx + dy * dy) + 0.00001;
      d = dy / dis;
  }
  vec3 dir = vec3(d, d, 0.0);
  float noise = turb(dir + vec3(uTime, 0.0, 62.1 + uTime) * 0.05, vec3(480.0, 320.0, 480.0), uLacunarity, uGain);
  noise = mix(noise, 0.0, 0.3);
  vec4 mist = vec4(noise, noise, noise, 1.0) * (1.0 - coord.y);
  mist.a = 1.0;
  mist *= uAlpha;
  gl_FragColor = texture2D(uSampler, vTextureCoord) + mist;
}
`

export interface GodrayFilterOptions {
  angle?: number
  gain?: number
  lacunarity?: number
  parallel?: boolean
  center?: number[]
  alpha?: number
}

export function createGodrayFilter(options: GodrayFilterOptions = {}) {
  const {
    angle = 30,
    gain = 0.5,
    lacunarity = 2.5,
    parallel = true,
    center = [0, 0],
    alpha = 1,
  } = options

  const radians = angle * (Math.PI / 180)
  const light = parallel ? [Math.cos(radians), Math.sin(radians)] : center

  return defineFilter(texture => {
    texture.registerProgram({
      fragmentShader,
      uniforms: {
        uGain: gain,
        uLacunarity: lacunarity,
        uParallel: parallel,
        uAlpha: alpha,
        uLight: light,
        uAspect: texture.height / texture.width,
      },
    })
  })
}
