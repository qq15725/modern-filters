import type { Texture, TextureOptions, Uniform, UniformType } from './types'

const vert = `
attribute vec2 aPosition;
varying vec2 vTextureCoord;
void main() {
    gl_Position = vec4(aPosition, 0, 1);
    vTextureCoord = step(0.0, aPosition);
}
`

const frag = `
precision mediump float;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;
void main() {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`

export function createTexture(options: TextureOptions): Texture {
  const {
    source,
    view: userCanvas,
    filterArea,
    vertices = [-1, 1, -1, -1, 1, -1, 1, -1, 1, 1, -1, 1],
    defaultVertexShader = vert,
    defaultFragmentShader = frag,
    globalUniforms: userGlobalUniforms,
    ...contextOptions
  } = options

  // init canvas
  const { width, height } = source
  const view = userCanvas ?? document.createElement('canvas')
  if (!userCanvas) {
    view.width = width
    view.height = height
  }

  // global uniforms
  const globalUniforms = {
    uSampler: 0,
    uInputSize: [width, height, 1 / width, 1 / height],
    uFilterArea: filterArea ?? [width, height, 0, 0],
    uTime: 0,
    ...userGlobalUniforms,
  }

  const programs: Texture['programs'] = new Set()

  // init webgl context TODO support webgl2
  const gl = (
    view.getContext('webgl', contextOptions)
    || view.getContext('experimental-webgl', contextOptions)
  ) as WebGLRenderingContext
  if (!gl) throw new Error('failed to getContext for webgl')
  const glExtensions = {
    loseContext: gl.getExtension('WEBGL_lose_context'),
  }

  function handleContextLost(event: WebGLContextEvent) {
    event.preventDefault()
    setTimeout(() => {
      gl.isContextLost() && glExtensions.loseContext?.restoreContext()
    }, 0)
  }

  function handleContextRestored() {
    // TODO
  }

  view.addEventListener?.('webglcontextlost', handleContextLost as any, false)
  view.addEventListener?.('webglcontextrestored', handleContextRestored, false)

  function destroy() {
    view.removeEventListener?.('webglcontextlost', handleContextLost as any)
    view.removeEventListener?.('webglcontextrestored', handleContextRestored)
    gl.useProgram(null)
    glExtensions.loseContext?.loseContext()
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

  // bind to texture 0
  const rawTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, rawTexture)
  setupTexture2d(gl)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)

  // framebuffers
  const textureBuffers = Array.from({ length: 2 }, () => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    setupTexture2d(gl)
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
      uniforms: userUniforms,
    } = options

    // create program
    const program = createProgram(gl, vertexShader, fragmentShader)

    // attrib
    gl.bindAttribLocation(program, 0, 'aPosition')

    // init uniform infos
    const uniforms: Record<string, Uniform> = {}
    const totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < totalUniforms; i++) {
      const uniformData = gl.getActiveUniform(program, i)
      if (!uniformData) continue
      const name = uniformData.name.replace(/\[.*?]$/, '')
      uniforms[name] = {
        type: getUniofrmType(gl, uniformData.type),
        isArray: !!(uniformData.name.match(/\[.*?]$/)),
        location: gl.getUniformLocation(program, name),
      }
    }

    gl.useProgram(program)

    // init uniforms
    const allUniforms: Record<string, any> = {
      ...userUniforms,
      ...globalUniforms,
    }
    for (const [name, value] of Object.entries(allUniforms)) {
      if (!(name in uniforms)) continue
      const { type, isArray, location } = uniforms[name]
      switch (type) {
        case 'float':
          if (isArray) {
            gl.uniform1fv(location, value)
          } else {
            gl.uniform1f(location, value)
          }
          break
        case 'bool':
        case 'int':
          if (isArray) {
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

    programs.add({
      program,
      uniforms,
    })

    return program
  }

  const reset: Texture['reset'] = () => {
    programs.forEach(({ program }) => gl.deleteProgram(program))
    programs.clear()
    registerProgram()
  }

  reset()

  const texture = {
    width,
    height,
    context: gl,
    view,
    programs,
    registerProgram,
    update: (source) => {
      gl.bindTexture(gl.TEXTURE_2D, rawTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    },
    reset,
    draw: (time = 0) => {
      gl.bindTexture(gl.TEXTURE_2D, rawTexture)
      let index = 0
      programs.forEach(({ program, uniforms }) => {
        const isLast = index === programs.size - 1
        const textureBuffer = textureBuffers[index++ % 2]
        gl.useProgram(program)
        uniforms.uTime?.location && gl.uniform1f(uniforms.uTime.location, time)
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
      gl.flush()
    },
    readImageData: (
      x = 0,
      y = 0,
      userWidth = width,
      userHeight = height,
    ) => {
      const image = new ImageData(userWidth, userHeight)
      gl.readPixels(x, y, userWidth, userHeight, gl.RGBA, gl.UNSIGNED_BYTE, image.data)
      return image
    },
    destroy,
  } as Texture

  texture.useFilter = (filter) => {
    const filters = Array.isArray(filter) ? filter : [filter]
    filters.forEach(useFilter => useFilter(texture))
    return texture
  }

  return texture
}

function setupTexture2d(gl: WebGLRenderingContext) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
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
function getUniofrmType(gl: any, type: number): UniformType {
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
