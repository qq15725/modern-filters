import { defineFilter } from './define-filter'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 uInputSize;

uniform vec2 uCenter;
uniform float uStrength;
uniform float uInnerRadius;
uniform float uRadius;

const float MAX_KERNEL_SIZE = %maxKernelSize%;

highp float rand(vec2 co, float seed) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot(co + seed, vec2(a, b)), sn = mod(dt, 3.14159);
  return fract(sin(sn) * c + seed);
}

void main() {
  float minGradient = uInnerRadius * 0.3;
  float innerRadius = (uInnerRadius + minGradient * 0.5) / uInputSize.x;

  float gradient = uRadius * 0.3;
  float radius = (uRadius - gradient * 0.5) / uInputSize.x;

  float countLimit = MAX_KERNEL_SIZE;

  vec2 dir = vec2(uCenter.xy / uInputSize.xy - vTextureCoord);
  float dist = length(vec2(dir.x, dir.y * uInputSize.y / uInputSize.x));

  float strength = uStrength;

  float delta = 0.0;
  float gap;
  if (dist < innerRadius) {
    delta = innerRadius - dist;
    gap = minGradient;
  } else if (radius >= 0.0 && dist > radius) { // radius < 0 means it's infinity
    delta = dist - radius;
    gap = gradient;
  }

  if (delta > 0.0) {
    float normalCount = gap / uInputSize.x;
    delta = (normalCount - delta) / normalCount;
    countLimit *= delta;
    strength *= delta;
    if (countLimit < 1.0)
    {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
      return;
    }
  }

  float offset = rand(vTextureCoord, 0.0);

  float total = 0.0;
  vec4 color = vec4(0.0);

  dir *= strength;

  for (float t = 0.0; t < MAX_KERNEL_SIZE; t++) {
    float percent = (t + offset) / MAX_KERNEL_SIZE;
    float weight = 4.0 * (percent - percent * percent);
    vec2 p = vTextureCoord + dir * percent;
    vec4 sample = texture2D(uSampler, p);
    color += sample * weight;
    total += weight;

    if (t > countLimit){
        break;
    }
  }

  color /= total;

  gl_FragColor = color;
}
`

export interface ZoomBlurFilterOptions {
  strength?: number
  center?: [number, number]
  innerRadius?: number
  radius?: number
  maxKernelSize?: number
}

export function createZoomBlurFilter(options: ZoomBlurFilterOptions = {}) {
  const {
    center,
    maxKernelSize = 32,
  } = options

  const {
    innerRadius = 0,
    radius = -1,
    strength = 0.1,
  } = options

  return defineFilter(texture => {
    texture.registerProgram({
      fragmentShader: fragmentShader.replace('%maxKernelSize%', maxKernelSize.toFixed(2)),
      uniforms: {
        uCenter: center ?? [texture.width / 2, texture.height / 2],
        uInnerRadius: innerRadius,
        uRadius: radius,
        uStrength: strength,
      },
    })
  })
}
