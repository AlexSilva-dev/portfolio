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
const saindo = ref(false)
const elapsedMs = ref(0)

const progress = computed(() => computeProgress(elapsedMs.value, PRELOADER_CEILING_MS))

const DURACAO_SAIDA_MS = 400
const FOLGA_FALLBACK_MS = 100

let animationFrame = 0
let safetyTimeout = 0
let exitTimeout = 0

function finalizarSaida() {
  clearTimeout(exitTimeout)
  exitTimeout = 0
  visible.value = false
}

function reveal() {
  if (saindo.value || !visible.value) return
  stopTimers()

  if (prefersReducedMotion.value) {
    finalizarSaida()
    return
  }

  saindo.value = true
  exitTimeout = window.setTimeout(finalizarSaida, DURACAO_SAIDA_MS + FOLGA_FALLBACK_MS)
}

function aoTerminarTransicao(evento: Event) {
  const transicao = evento as TransitionEvent
  if (transicao.propertyName && transicao.propertyName !== 'transform') return
  if (saindo.value) finalizarSaida()
}

function stopTimers() {
  cancelAnimationFrame(animationFrame)
  clearTimeout(safetyTimeout)
  clearTimeout(exitTimeout)
  exitTimeout = 0
}

defineExpose({ reveal })

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
  <div
    v-if="visible"
    data-testid="preloader"
    class="preloader"
    :class="{ 'preloader--saindo': saindo }"
    @transitionend="aoTerminarTransicao"
  >
    <div class="preloader__spinner" aria-hidden="true">
      <span class="preloader__ring"><span class="preloader__ring-inner" /></span>
      <span class="preloader__ring"><span class="preloader__ring-inner" /></span>
      <span class="preloader__ring"><span class="preloader__ring-inner" /></span>
    </div>
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
  gap: clamp(1.25rem, 3vw, 2rem);
  background: var(--color-bg);
  background-image: radial-gradient(
    circle at 50% 42%,
    color-mix(in srgb, var(--color-bg) 88%, var(--color-void)),
    var(--color-void) 72%
  );
  box-shadow: inset 0 0 90px 0 color-mix(in srgb, var(--color-void) 60%, transparent);
  transition: transform 400ms cubic-bezier(0.65, 0, 0.2, 1);
  will-change: transform;
}

.preloader--saindo {
  transform: translateY(-100%);
}

.preloader__spinner {
  position: relative;
  width: 100px;
  height: 102px;
  animation: spin 5s linear infinite reverse;
}

.preloader__ring {
  position: absolute;
  inset: 0;
}

.preloader__ring:nth-child(1) {
  transform: rotate(0deg);
}

.preloader__ring:nth-child(2) {
  transform: rotate(70deg);
}

.preloader__ring:nth-child(3) {
  transform: rotate(140deg);
}

.preloader__ring-inner {
  display: block;
  width: 100%;
  height: 100%;
  border: 5px solid color-mix(in srgb, var(--anel-cor, var(--color-accent)) 70%, transparent);
  border-right-color: transparent;
  border-top-color: transparent;
  border-radius: 100%;
  box-shadow: inset 0 0 10px color-mix(in srgb, var(--anel-cor, var(--color-accent)) 18%, transparent);
  animation: spin 2s linear infinite;
}

.preloader__ring:nth-child(1) .preloader__ring-inner {
  --anel-cor: var(--color-accent);
}

.preloader__ring:nth-child(2) .preloader__ring-inner {
  --anel-cor: var(--color-text);
}

.preloader__ring:nth-child(3) .preloader__ring-inner {
  --anel-cor: var(--color-text-muted);
}

.preloader__name {
  font-family: var(--font-sans);
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.preloader__counter {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .preloader {
    transition: none;
  }

  .preloader__spinner,
  .preloader__ring-inner {
    animation: none;
  }
}
</style>
