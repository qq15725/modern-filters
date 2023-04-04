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

  const canvasEl1 = ref<HTMLCanvasElement>()
  const canvasEl2 = ref<HTMLCanvasElement>()
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
    const source1 = await new Promise<HTMLImageElement>((resolve) => {
      const img = new Image()
      img.src = '/example.jpg'
      img.onload = () => resolve(img)
    })

    if (canvasEl1.value) {
      canvasEl1.value.width = source1.width
      canvasEl1.value.height = source1.height
    }

    const texture1 = createTexture({
      source: source1,
      view: canvasEl1.value,
    })

    const source2 = await new Promise<HTMLVideoElement>((resolve) => {
      const video = document.createElement('video')
      video.src = '/example.mp4'
      video.autoplay = true
      video.width = 200
      video.height = 200
      video.loop = true
      video.controls = true
      video.oncanplay = () => resolve(video)
    })

    if (canvasEl2.value) {
      canvasEl2.value.width = source2.width
      canvasEl2.value.height = source2.height
    }

    const texture2 = createTexture({
      source: source2,
      view: canvasEl2.value,
    })

    let then = 0
    let time = 0
    function mainLoop(now: number) {
      texture1.draw(time)
      texture2.update(source2)
      texture2.draw(time)
      now *= 0.001
      time += now - then
      then = now
      requestAnimationFrame(mainLoop)
    }
    requestAnimationFrame(mainLoop)

    watch(
      enabledFilterCreaters,
      (creaters) => {
        const filters = creaters.map(creater => creater())
        texture1.reset()
        texture1.useFilter(filters)
        texture2.reset()
        texture2.useFilter(filters)
        time = 0
      },
      { deep: true, immediate: true },
    )
  })
</script>

<template>
  <div style="text-align: center;">
    <div style="display: flex;">
      <canvas ref="canvasEl1" style="width: 200px; margin-bottom: 8px;" />

      <canvas ref="canvasEl2" style="width: 200px; margin-bottom: 8px;" />
    </div>

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
