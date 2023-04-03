export type UniformType = 'float'
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

export interface Uniform {
  type: UniformType
  location: WebGLUniformLocation | null
  isArray: boolean
}

export type Filter = (texture: Texture) => void

export interface TextureOptions {
  /**
   * Texture source
   */
  source: TexImageSource

  /**
   * HTML canvas element
   */
  view?: HTMLCanvasElement

  /**
   * Filter area
   *
   * [width, height, x, y]
   *
   * default: [width, height, 0, 0]
   */
  filterArea?: number[]

  // Shader part
  vertices?: number[]
  defaultVertexShader?: string
  defaultFragmentShader?: string
}

export interface Texture {
  /**
   * Pixel width
   */
  width: number

  /**
   * Pixel height
   */
  height: number

  /**
   * HTML canvas element
   */
  view: HTMLCanvasElement

  /**
   * Webgl context
   */
  context: WebGLRenderingContext

  /**
   * All registered programs
   */
  programs: Set<{
    program: WebGLProgram
    uniforms: Record<string, Uniform>
  }>

  /**
   * Use a filter
   * @param filter
   */
  useFilter: (filter: Filter | Filter[]) => Texture

  /**
   * Reset all shader programs
   */
  resetPrograms: () => void

  /**
   * Register a shader program
   */
  registerProgram: (
    options?: {
      vertexShader?: string
      fragmentShader?: string
      uniforms?: Record<string, any>
    },
  ) => WebGLProgram

  /**
   * Draw a frame based on the timeline
   */
  draw: (time?: number) => void

  /**
   * Read image data
   */
  readImageData: (x?: number, y?: number, width?: number, height?: number) => ImageData
}

export interface AnimationFilterOptions {
  mode?: 'in' | 'out'
  duration?: number
  loop?: boolean
}
