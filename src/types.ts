export type RGBA = [number, number, number, number]
export type RGB = [number, number, number]

export type Filter = (texture: Texture) => void

export interface TextureOptions {
  source: TexImageSource
  view?: HTMLCanvasElement
  vertices?: number[]
  defaultVertexShader?: string
  defaultFragmentShader?: string
}

export interface Texture {
  width: number
  height: number
  view: HTMLCanvasElement
  context: WebGLRenderingContext
  programs: Set<{
    program: WebGLProgram
    locations: Record<string, WebGLUniformLocation | null>
  }>
  use: (filter: Filter) => Texture
  resetPrograms: () => void
  registerProgram: (
    options?: {
      vertexShader?: string
      fragmentShader?: string
      uniforms?: Record<string, any>
    },
  ) => WebGLProgram
  draw: (time?: number) => void
}
