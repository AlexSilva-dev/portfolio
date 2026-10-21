<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePrefersReducedMotion } from '../composables/usePrefersReducedMotion'
import { PRELOADER_CEILING_MS, computeProgress } from '../utils/motion'

const props = withDefaults(
  defineProps<{
    name?: string
  }>(),
  { name: 'Alex Alves' },
)

const { prefersReducedMotion } = usePrefersReducedMotion()

const visible = ref(true)
const elapsedMs = ref(0)

const progress = computed(() => computeProgress(elapsedMs.value, PRELOADER_CEILING_MS))

let animationFrame = 0
let safetyTimeout = 0

function reveal() {
  visible.value = false
  stopTimers()
}

function stopTimers() {
  cancelAnimationFrame(animationFrame)
  clearTimeout(safetyTimeout)
}

onMounted(() => {
  if (prefersReducedMotion.value) {
    reveal()
    return
  }

  const startedAt = performance.now()
  const tick = () => {
    elapsedMs.value = performance.now() - startedAt
    if (progress.value >= 100) {
      reveal()
      return
    }
    animationFrame = requestAnimationFrame(tick)
  }
  animationFrame = requestAnimationFrame(tick)

  safetyTimeout = window.setTimeout(reveal, PRELOADER_CEILING_MS)
})

watch(prefersReducedMotion, (reduced) => {
  if (reduced) {
    reveal()
  }
})

onBeforeUnmount(stopTimers)
</script>

<template>
  <div v-if="visible" data-testid="preloader" class="preloader">
    <p data-testid="preloader-name" class="preloader__name">{{ props.name }}</p>
    <p data-testid="preloader-counter" class="preloader__counter">{{ progress }}%</p>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-section);
  background: var(--color-background);
}

.preloader__name {
  font-family: var(--font-sans);
  color: var(--color-heading);
}

.preloader__counter {
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}
</style>
