export type RGBA = [number, number, number, number]
export type RGB = [number, number, number]

export type Filter = (texture: Texture) => void

export interface TextureOptions {
  image: TexImageSource
  canvas?: HTMLCanvasElement
  vertices?: number[]
  defaultVertexShader?: string
  defaultFragmentShader?: string
}

export interface Texture {
  canvas: HTMLCanvasElement
  gl: WebGLRenderingContext
  programs: Set<{
    program: WebGLProgram
    locations: Record<string, WebGLUniformLocation | null>
  }>
  use: (filter: Filter) => Texture
  clearPrograms: () => void
  registerProgram: (
    options?: {
      vertexShader?: string
      fragmentShader?: string
      uniforms?: Record<string, any>
    },
  ) => WebGLProgram
  draw: (deltaTime?: number) => void
}
