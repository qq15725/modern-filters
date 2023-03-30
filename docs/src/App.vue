<script setup lang="ts">
  import { ref, watch } from 'vue'
  import {
    adjustmentFilter,
    colorMatrixFilter,
    colorOverlayFilter,
    embossFilter,
    multiColorReplaceFilter,
    zoomBlurFilter,
  } from '../../src'

  const canvas = ref<HTMLCanvasElement>()
  const canvasContext2d = ref<CanvasRenderingContext2D>()
  const imageData = ref<ImageData>()
  const filters = {
    adjustmentFilter: (data: Uint8ClampedArray) => adjustmentFilter(data, { gamma: 2 }),
    colorMatrixFilter: (data: Uint8ClampedArray) => colorMatrixFilter(data, { matrices: [{ type: 'lsd' }] }),
    colorOverlayFilter: (data: Uint8ClampedArray) => colorOverlayFilter(data, { color: [1, 0, 0, 0.5] }),
    embossFilter,
    multiColorReplaceFilter: (data: Uint8ClampedArray) => multiColorReplaceFilter(data, { replacements: [[[0, 0, 1], [0, 0, 0]]] }),
    zoomBlurFilter: (data: Uint8ClampedArray) => zoomBlurFilter(data, { width: 888, height: 888 }),
  }
  const enabledFilters = ref<Record<string, boolean>>({})

  function render() {
    if (!canvas.value || !canvasContext2d.value || !imageData.value) return

    const enabeld: string[] = []
    for (const [enabledName, enabledValue] of Object.entries(enabledFilters.value)) {
      if (enabledValue) enabeld.push(enabledName)
    }
    const data = imageData.value.data.slice(0)
    for (const [name, filter] of Object.entries(filters)) {
      if (!enabeld.includes(name)) continue
      filter(data)
    }
    canvasContext2d.value.putImageData(new ImageData(data, canvas.value.width, canvas.value.height), 0, 0)
  }

  watch(canvas, async canvas => {
    if (!canvas) return

    const image = await new Promise<HTMLImageElement>((resolve) => {
      const image = new Image()
      image.src = '/example.jpg'
      image.onload = () => resolve(image)
    })

    canvas.width = image.width
    canvas.height = image.height
    canvas.style.width = '200px'
    canvasContext2d.value = canvas.getContext('2d') ?? undefined
    canvasContext2d.value?.drawImage(image, 0, 0)
    imageData.value = canvasContext2d.value?.getImageData(0, 0, canvas.width, canvas.height)

    render()
  })

  watch(enabledFilters, render, { deep: true })
</script>

<template>
  <div style="text-align: center;">
    <canvas ref="canvas" style="margin-bottom: 8px;" />

    <div v-for="[name] of Object.entries(filters)" :key="name" style="margin-bottom: 8px;">
      <input :id="name" v-model="enabledFilters[name]" type="checkbox">
      <label :for="name">{{ name }}</label>
    </div>
  </div>
</template>
