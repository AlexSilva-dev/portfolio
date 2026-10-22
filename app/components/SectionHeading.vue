<script setup lang="ts">
import { useReveal } from '../composables/useReveal'

withDefaults(
  defineProps<{
    kicker: string
    title: string
    numero?: string
  }>(),
  { numero: '' },
)

const raiz = ref<HTMLElement | null>(null)
useReveal(raiz)
</script>

<template>
  <div ref="raiz" class="section-heading">
    <p class="section-heading__kicker" data-testid="section-heading-kicker"><span v-if="numero" class="section-heading__numero">{{ numero }}</span>{{ kicker }}</p>
    <h2 class="section-heading__title" data-testid="section-heading-title">
      <span class="reveal-line">{{ title }}</span>
    </h2>
  </div>
</template>

<style scoped>
.section-heading {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-heading__kicker {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading__numero {
  margin-right: 0.5rem;
}

/* Escala editorial, títulos de seção em display gigante alinhados ao Skillset */
.section-heading__title {
  color: var(--color-text);
  font-size: clamp(3rem, 8vw, 8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 0.95;
}

.section-heading__title .reveal-line {
  display: inline-block;
}
</style>
