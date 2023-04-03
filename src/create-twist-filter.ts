import { defineFilter } from './define-filter'
import animation from './shaders/animation.frag?raw'

import type { AnimationFilterOptions } from './types'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uRadius;
uniform float uAngle;
uniform vec2 uOffset;
uniform vec4 uFilterArea;
uniform float uTime;
uniform float uDuration;
uniform bool uIsOut;
uniform bool uLoop;

${ animation }

vec2 mapCoord(vec2 coord) {
  coord *= uFilterArea.xy;
  coord += uFilterArea.zw;
  return coord;
}

vec2 unmapCoord(vec2 coord) {
  coord -= uFilterArea.zw;
  coord /= uFilterArea.xy;
  return coord;
}

vec2 twist(vec2 coord, float radius) {
  coord -= uOffset;
  float dist = length(coord);
  if (dist < radius) {
    float ratioDist = (radius - dist) / radius;
    float angleMod = ratioDist * ratioDist * uAngle;
    float s = sin(angleMod);
    float c = cos(angleMod);
    coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
  }
  coord += uOffset;
  return coord;
}

void main(void) {
  float time = normalizeTime(uTime, uDuration, uLoop, uIsOut);
  float radius = uRadius - linear(time, 0.0, uRadius, uDuration);
  vec2 coord = mapCoord(vTextureCoord);
  coord = twist(coord, radius);
  coord = unmapCoord(coord);
  gl_FragColor = texture2D(uSampler, coord);
}
`

export interface TwistFilterOptions extends AnimationFilterOptions {
  radius?: number
  angle?: number
  padding?: number
  offset?: number[]
}

export function createTwistFilter(options: TwistFilterOptions = {}) {
  const {
    radius,
    angle = 4,
    padding = 20,
    offset,
    mode = 'in',
    duration = 1.8,
    loop = false,
  } = options

  return defineFilter(texture => {
    texture.registerProgram({
      fragmentShader,
      uniforms: {
        uRadius: radius ?? texture.width,
        uAngle: angle,
        uPadding: padding,
        uOffset: offset ?? [texture.width / 2, texture.height / 2],
        uIsOut: mode !== 'in',
        uDuration: duration,
        uLoop: loop,
      },
    })
  })
}
