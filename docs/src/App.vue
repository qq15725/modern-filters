<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import {
    adjustmentFilter,
    blurFilter,
    createColorMatrixFilter,
    createColorOverlayFilter,
    createEmbossFilter,
    createFadeFilter,
    createMultiColorReplaceFilter,
    createTexture,
    godrayFilter,
    zoomBlurFilter,
  } from '../../src'

  const canvas = ref<HTMLCanvasElement>()
  const filterCreaters = {
    // adjustmentFilter,
    // blurFilter,
    createColorMatrixFilter,
    createColorOverlayFilter,
    createEmbossFilter,
    createFadeFilter,
    // godrayFilter,
    createMultiColorReplaceFilter,
    // zoomBlurFilter,
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
      image,
      canvas: canvas.value,
    })

    watch(
      enabledFilterCreaters,
      (creaters) => {
        texture.clearPrograms()
        if (creaters.length) {
          creaters.forEach(createFilter => {
            texture.use(createFilter())
          })
        } else {
          texture.use(() => texture.registerProgram())
        }
      },
      { deep: true, immediate: true },
    )

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
