<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    items: string[]
    core?: boolean
  }>(),
  { core: false },
)
</script>

<template>
  <div class="tech-group" :class="{ 'tech-group--core': core }" data-testid="tech-group">
    <h3 class="tech-group__label" data-testid="tech-group-label">{{ label }}</h3>
    <ul class="tech-group__items" data-testid="tech-group-items">
      <li
        v-for="item in items"
        :key="item"
        class="tech-group__chip"
        data-testid="tech-group-chip"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tech-group {
  border: 1px solid color-mix(in srgb, var(--color-text-muted) 35%, transparent);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
}

.tech-group--core {
  border-color: var(--color-accent);
}

.tech-group__label {
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  margin: 0 0 0.75rem;
}

.tech-group__items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tech-group__chip {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}
</style>
