<script setup lang="ts">
import type { ExperienceItem } from '../i18n/sections/experience'

defineProps<{
  item: ExperienceItem
}>()
</script>

<template>
  <article class="experience-card" data-testid="experience-card">
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
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
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
  background: var(--color-status-green);
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
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
</style>
