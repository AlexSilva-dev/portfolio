<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
}>()
</script>

<template>
  <div class="section-heading">
    <p class="section-heading__kicker" data-testid="section-heading-kicker">{{ kicker }}</p>
    <h2 class="section-heading__title" data-testid="section-heading-title">{{ title }}</h2>
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

.section-heading__title {
  color: var(--color-text);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  line-height: 1.2;
}
</style>
