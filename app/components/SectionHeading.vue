<script setup lang="ts">
import { useReveal } from '../composables/useReveal'

withDefaults(
  defineProps<{
    kicker: string
    title: string
    numero?: string
    tema?: 'papel' | 'escuro'
  }>(),
  { numero: '', tema: 'papel' },
)

const raiz = ref<HTMLElement | null>(null)
useReveal(raiz)
</script>

<template>
  <div ref="raiz" class="section-heading" :class="{ 'section-heading--escuro': tema === 'escuro' }">
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
  /* Violeta profundo, contraste 5,24 sobre o papel (tokens.css, ADR-1) */
  color: var(--color-accent-deep);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading--escuro .section-heading__kicker {
  color: var(--color-accent);
}

.section-heading__numero {
  margin-right: 0.5rem;
}

/* Escala editorial, títulos de seção em display gigante alinhados ao Skillset.
   Tinta cheia sobre o papel, contraste ~21:1, sem tom lavado. */
.section-heading__title {
  color: var(--color-ink);
  font-size: clamp(3rem, 8vw, 8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 0.95;
}

.section-heading--escuro .section-heading__title {
  color: var(--color-text);
}

.section-heading__title .reveal-line {
  display: inline-block;
}
</style>
