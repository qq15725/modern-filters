<h1 align="center">modern-filters</h1>

<p align="center">
  <a href="https://unpkg.com/modern-filters">
    <img src="https://img.shields.io/bundlephobia/minzip/modern-filters" alt="Minzip">
  </a>
  <a href="https://www.npmjs.com/package/modern-filters">
    <img src="https://img.shields.io/npm/v/modern-filters.svg" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/modern-filters">
    <img src="https://img.shields.io/npm/dm/modern-filters" alt="Downloads">
  </a>
  <a href="https://github.com/qq15725/modern-filters/issues">
    <img src="https://img.shields.io/github/issues/qq15725/modern-filters" alt="Issues">
  </a>
  <a href="https://github.com/qq15725/modern-filters/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/modern-filters.svg" alt="License">
  </a>
</p>

## 📦 Install

```sh
npm i modern-filters
```

## 🦄 Usage

```ts
import { createTexture, createEmbossFilter, createFadeFilter } from 'modern-filters'

const image = new Image()
image.src = 'example.jpg'
image.onload = () => {
  const texture = createTexture({
    source: image,
    view: document.querySelector('canvas'),
  })

  texture.useFilter([
    createEmbossFilter({ strength: 5 }),
    createFadeFilter({ duration: 1.2 }),
  ])

  // This zero is time of timeline
  texture.draw(0)
  texture.draw(0.1)
  texture.draw(0.2)

  // Read image data for current frame
  // texture.readImageData()
}
```

## 🚀 Filter creaters

> createFilter(options?: Options)

- [createAdjustmentFilter](src/create-adjustment-filter.ts)
- [createBlurFilter](src/create-blur-filter.ts)
- [createColorMatrixFilter](src/create-color-matrix-filter.ts)
- [createColorOverlayFilter](src/create-color-overlay-filter.ts)
- [createEmbossFilter](src/create-emboss-filter.ts)
- [createFadeFilter](src/create-fade-filter.ts)
- [createGodrayFilter](src/create-godray-filter.ts)
- [createKawaseBlurFilter](src/create-kawase-blur-filter.ts)
- [createMultiColorReplaceFilter](src/create-multi-color-replace-filter.ts)
- [createPixelateFilter](src/create-pixelate-filter.ts)
- [createTiltShiftFilter](src/create-tilt-shift-filter.ts)
- [createTwistFilter](src/create-twist-filter.ts)
- [createZoomBlurFilter](src/create-zoom-blur-filter.ts)

## Types

See the [types.ts](src/types.ts)

## Reference

- [pixijs/pixijs](https://github.com/pixijs/pixijs)
- [pixijs/filters](https://github.com/pixijs/filters)
