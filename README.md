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
import { embossFilter } from 'modern-filters'

const canvas = document.querySelector('.you-canvas')
const canvasContext2d = canvas.getContext('2d')
const imageData = canvasContext2d.getImageData(0, 0, canvas.width, canvas.height)

// 👇
embossFilter(imageData, { strength: 5 })

context.putImageData(imageData, 0, 0)
```

## 🚀 Filters

> filter(imageData: ImageData, options?: FilterOptions)

- [adjustmentFilter](src/adjustment-filter.ts)
- [blurFilter](src/blur-filter.ts)
- [ColorMatrixFilter](src/color-matrix-filter.ts)
- [colorOverlayFilter](src/color-overlay-filter.ts)
- [embossFilter](src/emboss-filter.ts)
- [godrayFilter](src/godray-filter.ts)
- [multiColorReplaceFilter](src/multi-color-replace-filter.ts)
- [zoomBlurFilter](src/zoom-blur-filter.ts)

## Reference

- [pixijs/filters](https://github.com/pixijs/filters)
