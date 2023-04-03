import { defineFilter } from './define-filter'

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uEpsilon;
const int MAX_COLORS = %maxColors%;
uniform vec3 uOriginalColors[MAX_COLORS];
uniform vec3 uTargetColors[MAX_COLORS];

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);

  float alpha = gl_FragColor.a;
  if (alpha < 0.0001) {
    return;
  }

  vec3 color = gl_FragColor.rgb / alpha;

  for(int i = 0; i < MAX_COLORS; i++) {
    vec3 origColor = uOriginalColors[i];
    if (origColor.r < 0.0) {
      break;
    }
    vec3 colorDiff = origColor - color;
    if (length(colorDiff) < uEpsilon) {
      vec3 targetColor = uTargetColors[i];
      gl_FragColor = vec4((targetColor + colorDiff) * alpha, alpha);
      return;
    }
  }
}
`

export interface MultiColorReplaceFilterOptions {
  replacements?: [number[], number[]][]
  epsilon?: number
}

export function createMultiColorReplaceFilter(options: MultiColorReplaceFilterOptions = {}) {
  const {
    replacements = [],
    epsilon = 0.05,
  } = options

  const maxColors = replacements.length
  const uOriginalColors = new Float32Array(maxColors * 3)
  const uTargetColors = new Float32Array(maxColors * 3)

  replacements.forEach(([originalColor, targetColor], i) => {
    uOriginalColors[i * 3] = originalColor[0]
    uOriginalColors[i * 3 + 1] = originalColor[1]
    uOriginalColors[i * 3 + 2] = originalColor[2]
    uTargetColors[i * 3] = targetColor[0]
    uTargetColors[i * 3 + 1] = targetColor[1]
    uTargetColors[i * 3 + 2] = targetColor[2]
  })

  return defineFilter(texture => {
    texture.registerProgram({
      fragmentShader: fragmentShader.replace('%maxColors%', String(maxColors)),
      uniforms: {
        uEpsilon: epsilon,
        uOriginalColors,
        uTargetColors,
      },
    })
  })
}
