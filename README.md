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
import { colorOverlayFilter, embossFilter } from 'modern-filters'

const canvas = document.querySelector('.you-canvas')
const canvasContext2d = canvas.getContext('2d')
const imageData = canvasContext2d.getImageData(0, 0, canvas.width, canvas.height)

// 👇
colorOverlayFilter(imageData.data, [255, 0, 0, 255])

context.putImageData(imageData, 0, 0)
```

## 🚀 Filters

- [colorOverlayFilter](src/colorOverlayFilter.ts)
- [embossFilter](src/embossFilter.ts)
