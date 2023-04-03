import type { Texture, TextureOptions } from './types'

interface UniformInfo {
  type: 'float'
  | 'vec2'
  | 'vec3'
  | 'vec4'
  | 'int'
  | 'ivec2'
  | 'ivec3'
  | 'ivec4'
  | 'uint'
  | 'uvec2'
  | 'uvec3'
  | 'uvec4'
  | 'bool'
  | 'bvec2'
  | 'bvec3'
  | 'bvec4'
  | 'mat2'
  | 'mat3'
  | 'mat4'
  | 'sampler2D'
  | 'samplerCube'
  | 'sampler2DArray'
  isArray: boolean
}

export function createTexture(options: TextureOptions): Texture {
  const {
    source,
    view: userCanvas,
    vertices = [-1, 1, -1, -1, 1, -1, 1, -1, 1, 1, -1, 1],
    defaultVertexShader = `
attribute vec2 aPosition;
varying vec2 vTextureCoord;
void main() {
    gl_Position = vec4(aPosition, 0, 1);
    vTextureCoord = step(0.0, aPosition);
}
`,
    defaultFragmentShader = `
precision mediump float;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;
void main() {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`,
  } = options

  const { width, height } = source
  const view = userCanvas ?? document.createElement('canvas')
  if (!userCanvas) {
    view.width = width
    view.height = height
  }
  const gl = view.getContext('webgl')
  if (!gl) throw new Error('failed to get webgl context')
  const programs: Texture['programs'] = new Set()
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  // bind to texture 0
  const rawTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, rawTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  // framebuffers
  const textureBuffers = Array.from({ length: 2 }, () => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    const buffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    return {
      buffer,
      texture,
    }
  })
  // bind to attr 0
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(0)

  const registerProgram: Texture['registerProgram'] = (options = {}) => {
    const {
      vertexShader = defaultVertexShader,
      fragmentShader = defaultFragmentShader,
      uniforms = {},
    } = options
    const program = createProgram(gl, vertexShader, fragmentShader)

    const uniformInfos: Record<string, UniformInfo> = {}
    const totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < totalUniforms; i++) {
      const uniformData = gl.getActiveUniform(program, i)
      if (!uniformData) continue
      uniformInfos[uniformData.name.replace(/\[.*?\]$/, '')] = {
        type: getUniofrmType(gl, uniformData.type),
        isArray: !!(uniformData.name.match(/\[.*?\]$/)),
      }
    }
    gl.bindAttribLocation(program, 0, 'aPosition')
    const locations = {
      uTime: gl.getUniformLocation(program, 'uTime'),
    }
    gl.useProgram(program)
    const allUniforms: Record<string, any> = {
      ...uniforms,
      uSampler: 0,
      uDimension: [width, height],
    }
    for (const [name, value] of Object.entries(allUniforms)) {
      const info = uniformInfos[name]
      if (!info) continue
      const location = gl.getUniformLocation(program, name)
      switch (info.type) {
        case 'float':
          if (info.isArray) {
            gl.uniform1fv(location, value)
          } else {
            gl.uniform1f(location, value)
          }
          break
        case 'int':
          if (info.isArray) {
            gl.uniform1iv(location, value)
          } else {
            gl.uniform1i(location, value)
          }
          break
        case 'vec2':
          gl.uniform2fv(location, value)
          break
        case 'vec3':
          gl.uniform3fv(location, value)
          break
        case 'vec4':
          gl.uniform4fv(location, value)
          break
      }
    }
    programs.add({ program, locations })
    return program
  }

  const resetPrograms: Texture['resetPrograms'] = () => {
    programs.forEach(({ program }) => {
      gl.deleteProgram(program)
    })
    programs.clear()
    registerProgram()
  }

  resetPrograms()

  const texture = {
    width,
    height,
    context: gl,
    view,
    programs,
    resetPrograms,
    registerProgram,
    draw: (time = 0) => {
      gl.bindTexture(gl.TEXTURE_2D, rawTexture)
      let index = 0
      programs.forEach(({ program, locations }) => {
        const isLast = index === programs.size - 1
        const textureBuffer = textureBuffers[index++ % 2]
        gl.useProgram(program)
        locations.uTime && gl.uniform1f(locations.uTime, time)
        if (isLast) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        } else {
          gl.bindFramebuffer(gl.FRAMEBUFFER, textureBuffer.buffer)
        }
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.clearColor(0, 0, 0, 1)
        gl.clearDepth(1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2)
        !isLast && gl.bindTexture(gl.TEXTURE_2D, textureBuffer.texture)
      })
    },
  } as Texture

  texture.use = (filter) => {
    filter(texture)
    return texture
  }

  return texture
}

function createShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  source: string,
) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('failed to create shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`failed to compiling shader:\n${ source }\n${ gl.getShaderInfoLog(shader) }`)
  }
  return shader
}

function createProgram(
  gl: WebGLRenderingContext,
  vert: string,
  frag: string,
) {
  frag = frag.includes('precision') ? frag : `precision mediump float;\n${ frag }`
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vert)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, frag)
  const program = gl.createProgram()
  if (!program) throw new Error('failed to create program')
  vertexShader && gl.attachShader(program, vertexShader)
  fragmentShader && gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`failed to initing program: ${ gl.getProgramInfoLog(program) }`)
  }
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)
  return program
}

let GL_TABLE: any = null
const GL_TO_GLSL_TYPES = {
  FLOAT: 'float',
  FLOAT_VEC2: 'vec2',
  FLOAT_VEC3: 'vec3',
  FLOAT_VEC4: 'vec4',
  INT: 'int',
  INT_VEC2: 'ivec2',
  INT_VEC3: 'ivec3',
  INT_VEC4: 'ivec4',
  UNSIGNED_INT: 'uint',
  UNSIGNED_INT_VEC2: 'uvec2',
  UNSIGNED_INT_VEC3: 'uvec3',
  UNSIGNED_INT_VEC4: 'uvec4',
  BOOL: 'bool',
  BOOL_VEC2: 'bvec2',
  BOOL_VEC3: 'bvec3',
  BOOL_VEC4: 'bvec4',
  FLOAT_MAT2: 'mat2',
  FLOAT_MAT3: 'mat3',
  FLOAT_MAT4: 'mat4',
  SAMPLER_2D: 'sampler2D',
  INT_SAMPLER_2D: 'sampler2D',
  UNSIGNED_INT_SAMPLER_2D: 'sampler2D',
  SAMPLER_CUBE: 'samplerCube',
  INT_SAMPLER_CUBE: 'samplerCube',
  UNSIGNED_INT_SAMPLER_CUBE: 'samplerCube',
  SAMPLER_2D_ARRAY: 'sampler2DArray',
  INT_SAMPLER_2D_ARRAY: 'sampler2DArray',
  UNSIGNED_INT_SAMPLER_2D_ARRAY: 'sampler2DArray',
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function getUniofrmType(gl: any, type: number): UniformInfo['type'] {
  if (!GL_TABLE) {
    const typeNames = Object.keys(GL_TO_GLSL_TYPES)
    GL_TABLE = {}
    for (let i = 0; i < typeNames.length; ++i) {
      const tn = typeNames[i]
      GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn as keyof typeof GL_TO_GLSL_TYPES]
    }
  }
  return GL_TABLE[type]
}
