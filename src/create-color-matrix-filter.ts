import { defineFilter } from './define-filter'

type ColorMatrix = { type: 'hue'; rotation?: number }
| { type: 'blackAndWhite' }
| { type: 'browni' }
| { type: 'lsd' }
| { type: 'sepia' }
| { type: 'negative' }
| { type: 'kodachrome' }
| { type: 'polaroid' }
| { type: 'desaturate' }
| { type: 'predator'; amount?: number }
| { type: 'night'; intensity?: number }
| { type: 'technicolor' }
| { type: 'toBGR' }
| { type: 'vintage' }

export interface ColorMatrixFilterOptions {
  matrices?: (ColorMatrix & { multiply?: boolean })[]
  alpha?: number
}

const fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float m[20];
uniform float uAlpha;

void main(void)
{
    vec4 c = texture2D(uSampler, vTextureCoord);

    if (uAlpha == 0.0) {
        gl_FragColor = c;
        return;
    }

    // Un-premultiply alpha before applying the color matrix. See issue #3539.
    if (c.a > 0.0) {
      c.rgb /= c.a;
    }

    vec4 result;

    result.r = (m[0] * c.r);
        result.r += (m[1] * c.g);
        result.r += (m[2] * c.b);
        result.r += (m[3] * c.a);
        result.r += m[4];

    result.g = (m[5] * c.r);
        result.g += (m[6] * c.g);
        result.g += (m[7] * c.b);
        result.g += (m[8] * c.a);
        result.g += m[9];

    result.b = (m[10] * c.r);
       result.b += (m[11] * c.g);
       result.b += (m[12] * c.b);
       result.b += (m[13] * c.a);
       result.b += m[14];

    result.a = (m[15] * c.r);
       result.a += (m[16] * c.g);
       result.a += (m[17] * c.b);
       result.a += (m[18] * c.a);
       result.a += m[19];

    vec3 rgb = mix(c.rgb, result.rgb, uAlpha);

    // Premultiply alpha again.
    rgb *= result.a;

    gl_FragColor = vec4(rgb, result.a);
}
`

export function createColorMatrixFilter(options: ColorMatrixFilterOptions = {}) {
  const {
    alpha = 1,
    matrices = [
      { type: 'lsd' },
    ],
  } = options

  if (!alpha) return

  let matrix: number[] = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
  ]

  const map = {
    hue: getHuaMatrix,
    blackAndWhite: getBlackAndWhiteMatrix,
    browni: getBrowniMatrix,
    lsd: getLsdMatrix,
    sepia: getSepiaMatrix,
    negative: getNegativeMatrix,
    kodachrome: getKodachromeMatrix,
    polaroid: getPolaroidMatrix,
    desaturate: getDesaturateMatrix,
    predator: getPredatorMatrix,
    night: getNightMatrix,
    technicolor: getTechnicolorMatrix,
    toBGR: getToBGRMatrix,
    vintage: getVintageMatrix,
  }

  for (const item of matrices) {
    let newMatrix = (map[item.type] as any)(item)
    if (item.multiply) {
      multiply(newMatrix, matrix, newMatrix)
      newMatrix = colorMatrix(newMatrix) as any
    }
    matrix = newMatrix
  }

  return defineFilter(({ registerProgram }) => {
    registerProgram({
      fragmentShader,
      uniforms: {
        uAlpha: alpha,
        m: matrix,
      },
    })
  })
}

function multiply(out: number[], a: number[], b: number[]): number[] {
  // Red Channel
  out[0] = (a[0] * b[0]) + (a[1] * b[5]) + (a[2] * b[10]) + (a[3] * b[15])
  out[1] = (a[0] * b[1]) + (a[1] * b[6]) + (a[2] * b[11]) + (a[3] * b[16])
  out[2] = (a[0] * b[2]) + (a[1] * b[7]) + (a[2] * b[12]) + (a[3] * b[17])
  out[3] = (a[0] * b[3]) + (a[1] * b[8]) + (a[2] * b[13]) + (a[3] * b[18])
  out[4] = (a[0] * b[4]) + (a[1] * b[9]) + (a[2] * b[14]) + (a[3] * b[19]) + a[4]

  // Green Channel
  out[5] = (a[5] * b[0]) + (a[6] * b[5]) + (a[7] * b[10]) + (a[8] * b[15])
  out[6] = (a[5] * b[1]) + (a[6] * b[6]) + (a[7] * b[11]) + (a[8] * b[16])
  out[7] = (a[5] * b[2]) + (a[6] * b[7]) + (a[7] * b[12]) + (a[8] * b[17])
  out[8] = (a[5] * b[3]) + (a[6] * b[8]) + (a[7] * b[13]) + (a[8] * b[18])
  out[9] = (a[5] * b[4]) + (a[6] * b[9]) + (a[7] * b[14]) + (a[8] * b[19]) + a[9]

  // Blue Channel
  out[10] = (a[10] * b[0]) + (a[11] * b[5]) + (a[12] * b[10]) + (a[13] * b[15])
  out[11] = (a[10] * b[1]) + (a[11] * b[6]) + (a[12] * b[11]) + (a[13] * b[16])
  out[12] = (a[10] * b[2]) + (a[11] * b[7]) + (a[12] * b[12]) + (a[13] * b[17])
  out[13] = (a[10] * b[3]) + (a[11] * b[8]) + (a[12] * b[13]) + (a[13] * b[18])
  out[14] = (a[10] * b[4]) + (a[11] * b[9]) + (a[12] * b[14]) + (a[13] * b[19]) + a[14]

  // Alpha Channel
  out[15] = (a[15] * b[0]) + (a[16] * b[5]) + (a[17] * b[10]) + (a[18] * b[15])
  out[16] = (a[15] * b[1]) + (a[16] * b[6]) + (a[17] * b[11]) + (a[18] * b[16])
  out[17] = (a[15] * b[2]) + (a[16] * b[7]) + (a[17] * b[12]) + (a[18] * b[17])
  out[18] = (a[15] * b[3]) + (a[16] * b[8]) + (a[17] * b[13]) + (a[18] * b[18])
  out[19] = (a[15] * b[4]) + (a[16] * b[9]) + (a[17] * b[14]) + (a[18] * b[19]) + a[19]

  return out
}

function colorMatrix(matrix: number[]): number[] {
  const m = new Float32Array(matrix)
  m[4] /= 255
  m[9] /= 255
  m[14] /= 255
  m[19] /= 255
  return m as any
}

function getHuaMatrix({ rotation = 0 }: { rotation?: number }) {
  rotation = rotation / 180 * Math.PI

  const cosR = Math.cos(rotation)
  const sinR = Math.sin(rotation)
  const sqrt = Math.sqrt

  const w = 1 / 3
  const sqrW = sqrt(w) // weight is

  const a00 = cosR + ((1.0 - cosR) * w)
  const a01 = (w * (1.0 - cosR)) - (sqrW * sinR)
  const a02 = (w * (1.0 - cosR)) + (sqrW * sinR)

  const a10 = (w * (1.0 - cosR)) + (sqrW * sinR)
  const a11 = cosR + (w * (1.0 - cosR))
  const a12 = (w * (1.0 - cosR)) - (sqrW * sinR)

  const a20 = (w * (1.0 - cosR)) - (sqrW * sinR)
  const a21 = (w * (1.0 - cosR)) + (sqrW * sinR)
  const a22 = cosR + (w * (1.0 - cosR))

  return [
    a00, a01, a02, 0, 0,
    a10, a11, a12, 0, 0,
    a20, a21, a22, 0, 0,
    0, 0, 0, 1, 0,
  ]
}

function getBlackAndWhiteMatrix() {
  return [
    0.3, 0.6, 0.1, 0, 0,
    0.3, 0.6, 0.1, 0, 0,
    0.3, 0.6, 0.1, 0, 0,
    0, 0, 0, 1, 0,
  ]
}

function getBrowniMatrix() {
  return [
    0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 47.43192855600873,
    -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -36.96841498319127,
    0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283,
    0, 0, 0, 1, 0,
  ]
}

function getLsdMatrix() {
  return [
    2, -0.4, 0.5, 0, 0,
    -0.5, 2, -0.4, 0, 0,
    -0.4, -0.5, 3, 0, 0,
    0, 0, 0, 1, 0,
  ]
}

function getSepiaMatrix() {
  return [
    0.393, 0.7689999, 0.18899999, 0, 0,
    0.349, 0.6859999, 0.16799999, 0, 0,
    0.272, 0.5339999, 0.13099999, 0, 0,
    0, 0, 0, 1, 0,
  ]
}

function getNegativeMatrix() {
  return [
    -1, 0, 0, 1, 0,
    0, -1, 0, 1, 0,
    0, 0, -1, 1, 0,
    0, 0, 0, 1, 0,
  ]
}

function getKodachromeMatrix() {
  return [
    1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502,
    -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203,
    -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946,
    0, 0, 0, 1, 0,
  ]
}

function getPolaroidMatrix() {
  return [
    1.438, -0.062, -0.062, 0, 0,
    -0.122, 1.378, -0.122, 0, 0,
    -0.016, -0.016, 1.483, 0, 0,
    0, 0, 0, 1, 0,
  ]
}

function getSaturateMatrix(amount = 1) {
  const x = (amount * 2 / 3) + 1
  const y = ((x - 1) * -0.5)

  return [
    x, y, y, 0, 0,
    y, x, y, 0, 0,
    y, y, x, 0, 0,
    0, 0, 0, 1, 0,
  ]
}

function getDesaturateMatrix() {
  return getSaturateMatrix(-1)
}

function getPredatorMatrix({ amount = 1 }: { amount?: number }) {
  return [
    // row 1
    11.224130630493164 * amount,
    -4.794486999511719 * amount,
    -2.8746118545532227 * amount,
    0,
    0.40342438220977783 * amount,
    // row 2
    -3.6330697536468506 * amount,
    9.193157196044922 * amount,
    -2.951810836791992 * amount,
    0,
    -1.316135048866272 * amount,
    // row 3
    -3.2184197902679443 * amount,
    -4.2375030517578125 * amount,
    7.476448059082031 * amount,
    0,
    0.8044459223747253 * amount,
    // row 4
    0, 0, 0, 1, 0,
  ]
}

function getNightMatrix({ intensity = 0.1 }: { intensity?: number }) {
  return [
    intensity * (-2.0), -intensity, 0, 0, 0,
    -intensity, 0, intensity, 0, 0,
    0, intensity, intensity * 2.0, 0, 0,
    0, 0, 0, 1, 0,
  ]
}

function getTechnicolorMatrix() {
  return [
    1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337,
    -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398,
    -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138,
    0, 0, 0, 1, 0,
  ]
}

function getToBGRMatrix() {
  return [
    0, 0, 1, 0, 0,
    0, 1, 0, 0, 0,
    1, 0, 0, 0, 0,
    0, 0, 0, 1, 0,
  ]
}

function getVintageMatrix() {
  return [
    0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 9.651285835294123,
    0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 7.462829176470591,
    0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296,
    0, 0, 0, 1, 0,
  ]
}
