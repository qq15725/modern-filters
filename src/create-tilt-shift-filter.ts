import { defineFilter } from './define-filter'
import animation from './shaders/animation.frag?raw'

import type { AnimationFilterOptions } from './types'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uBlur;
uniform float uGradientBlur;
uniform vec2 uStart;
uniform vec2 uEnd;
uniform vec2 uDelta;
uniform vec2 uTexSize;
uniform float uTime;
uniform float uDuration;
uniform bool uIsOut;
uniform bool uLoop;

${ animation }

float random(vec3 scale, float seed) {
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main(void) {
  float time = normalizeTime(uTime, uDuration, uLoop, uIsOut);
  float blur = uBlur - linear(time, 0.0, uBlur, uDuration);
  float gradientBlur = linear(time, 0.0, uGradientBlur, uDuration);

  vec4 color = vec4(0.0);
  float total = 0.0;
  float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
  vec2 normal = normalize(vec2(uStart.y - uEnd.y, uEnd.x - uStart.x));
  float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * uTexSize - uStart, normal)) / gradientBlur) * blur;

  for (float t = -30.0; t <= 30.0; t++) {
    float percent = (t + offset - 0.5) / 30.0;
    float weight = 1.0 - abs(percent);
    vec4 sample = texture2D(uSampler, vTextureCoord + uDelta / uTexSize * percent * radius);
    sample.rgb *= sample.a;
    color += sample * weight;
    total += weight;
  }

  color /= total;
  color.rgb /= color.a + 0.00001;

  gl_FragColor = color;
}
`

export interface TiltShiftFilterOptions extends AnimationFilterOptions {
  blur?: number
  // The strength of the blur gradient
  gradientBlur?: number
  // The position to start the effect at
  start?: number[]
  // The position to end the effect at
  end?: number[]
}

export function createTiltShiftFilter(options: TiltShiftFilterOptions = {}) {
  const {
    blur = 100,
    gradientBlur = 600,
    start = [0, window.innerHeight / 2],
    end = [600, window.innerHeight / 2],
    mode = 'in',
    duration = 1.8,
    loop = false,
  } = options

  const texSize = [window.innerWidth, window.innerHeight]

  return defineFilter(texture => {
    const dx = end[0] - start[0]
    const dy = end[1] - start[1]
    const d = Math.sqrt((dx * dx) + (dy * dy))

    texture.registerProgram({
      fragmentShader,
      uniforms: {
        uBlur: blur,
        uGradientBlur: gradientBlur,
        uStart: start,
        uEnd: end,
        uDelta: [dx / d, dy / d],
        uTexSize: texSize,
        uIsOut: mode !== 'in',
        uDuration: duration,
        uLoop: loop,
      },
    })

    texture.registerProgram({
      fragmentShader,
      uniforms: {
        uBlur: blur,
        uGradientBlur: gradientBlur,
        uStart: start,
        uEnd: end,
        uDelta: [-dy / d, dx / d],
        uTexSize: texSize,
        uIsOut: mode !== 'in',
        uDuration: duration,
        uLoop: loop,
      },
    })
  })
}
