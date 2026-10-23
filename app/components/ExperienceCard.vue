<script setup lang="ts">
import { ref } from 'vue'
import type { ExperienceItem } from '../i18n/sections/experience'
import { useStagger } from '../composables/useStagger'

defineProps<{
  item: ExperienceItem
}>()

const raiz = ref<HTMLElement | null>(null)

useStagger(raiz, {
  seletorBullets: '.experience-card__achievement',
  seletorChips: '.experience-card__chip',
})
</script>

<template>
  <article ref="raiz" class="experience-card" data-testid="experience-card">
    <header class="experience-card__header">
      <h3 class="experience-card__company" data-testid="experience-card-company">{{ item.company }}</h3>
      <p class="experience-card__period" data-testid="experience-card-period">
        <span
          v-if="item.current"
          class="experience-card__dot"
          data-testid="experience-card-dot"
          aria-hidden="true"
        />
        {{ item.period }}
      </p>
    </header>

    <p class="experience-card__role" data-testid="experience-card-role">{{ item.role }}</p>

    <ul class="experience-card__achievements">
      <li
        v-for="(achievement, index) in item.achievements"
        :key="index"
        class="experience-card__achievement"
        data-testid="experience-card-achievement"
      >
        {{ achievement }}
      </li>
    </ul>

    <ul class="experience-card__chips">
      <li
        v-for="(chip, index) in item.chips"
        :key="index"
        class="experience-card__chip"
        data-testid="experience-card-chip"
      >
        {{ chip }}
      </li>
    </ul>
  </article>
</template>

<style scoped>
.experience-card {
  background: var(--color-surface);
  border-left: 3px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px color-mix(in srgb, var(--color-void) 40%, transparent);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  transition:
    border-left-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

/* Elevação sutil por transform e sombra, o layout dos vizinhos não move. */
.experience-card:hover {
  border-left-color: var(--color-accent-deep);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-void) 55%, transparent);
  transform: translateY(-2px);
}

.experience-card__header {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  justify-content: space-between;
}

.experience-card__company {
  color: var(--color-text);
  font-size: 1.25rem;
}

.experience-card__period {
  align-items: center;
  color: var(--color-text-muted);
  display: flex;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  gap: 0.5rem;
}

.experience-card__dot {
  animation: pulsodot 2.4s ease-in-out infinite;
  background: var(--color-status-green);
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
}

@keyframes pulsodot {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.experience-card__role {
  color: var(--color-text-muted);
  font-size: 1rem;
}

.experience-card__achievements {
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  font-size: 0.9375rem;
  gap: 0.5rem;
  list-style: disc;
  padding-left: 1.25rem;
}

.experience-card__chips {
  display: flex;
  flex-wrap: wrap;
  font-size: 0.8125rem;
  gap: 0.5rem;
  list-style: none;
  margin-top: 0.25rem;
  padding: 0;
}

.experience-card__chip {
  background: var(--color-bg);
  border: 1px solid var(--color-accent);
  border-radius: 999px;
  color: var(--color-text-muted);
  padding: 0.25rem 0.75rem;
}

/* Movimento reduzido corta pulso e transições, o conteúdo fica direto. */
@media (prefers-reduced-motion: reduce) {
  .experience-card,
  .experience-card:hover {
    transform: none;
    transition: none;
  }

  .experience-card__dot {
    animation: none;
  }
}
</style>
