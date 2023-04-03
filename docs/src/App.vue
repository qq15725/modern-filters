<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import {
    createAdjustmentFilter,
    createBlurFilter,
    createColorMatrixFilter,
    createColorOverlayFilter,
    createEmbossFilter,
    createFadeFilter,
    createGodrayFilter,
    createKawaseBlurFilter,
    createMultiColorReplaceFilter,
    createPixelateFilter,
    createTexture,
    createTiltShiftFilter,
    createTwistFilter,
    createZoomBlurFilter,
  } from '../../src'

  const canvas = ref<HTMLCanvasElement>()
  const filterCreaters = {
    createAdjustmentFilter: () => createAdjustmentFilter({ gamma: 0.1 }),
    createBlurFilter,
    createColorMatrixFilter,
    createColorOverlayFilter,
    createEmbossFilter,
    createFadeFilter,
    createGodrayFilter,
    createKawaseBlurFilter,
    createMultiColorReplaceFilter: () => createMultiColorReplaceFilter({
      replacements: [
        [[0, 0, 1], [1, 0, 0]],
      ],
      epsilon: 1,
    }),
    createPixelateFilter,
    createTiltShiftFilter,
    createTwistFilter,
    createZoomBlurFilter,
  }
  const enabledNames = ref<Record<string, boolean>>({})
  const enabledFilterCreaters = computed(() => {
    const result: any[] = []
    for (const [name, value] of Object.entries(enabledNames.value)) {
      if (value) result.push(filterCreaters[name as keyof typeof filterCreaters])
    }
    return result
  })

  onMounted(async () => {
    const image = await new Promise<HTMLImageElement>((resolve) => {
      const img = new Image()
      img.src = '/example.jpg'
      img.onload = () => resolve(img)
    })

    if (canvas.value) {
      canvas.value.style.width = '200px'
      canvas.value.width = image.width
      canvas.value.height = image.height
    }

    const texture = createTexture({
      source: image,
      view: canvas.value,
    })

    let then = 0
    let time = 0
    function mainLoop(now: number) {
      texture.draw(time)
      now *= 0.001
      time += now - then
      then = now
      requestAnimationFrame(mainLoop)
    }
    requestAnimationFrame(mainLoop)

    watch(
      enabledFilterCreaters,
      (creaters) => {
        texture.resetPrograms()
        texture.useFilter(creaters.map(creater => creater()))
        time = 0
      },
      { deep: true, immediate: true },
    )
  })
</script>

<template>
  <div style="text-align: center;">
    <canvas ref="canvas" style="margin-bottom: 8px;" />

    <div v-for="[name] of Object.entries(filterCreaters)" :key="name" style="margin-bottom: 8px;">
      <input :id="name" v-model="enabledNames[name]" type="checkbox">
      <label :for="name">{{ name }}</label>
    </div>
  </div>
</template>

<style>
  html body {
    margin: 0;
  }
</style>
