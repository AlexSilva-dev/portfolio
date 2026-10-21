<script setup lang="ts">
defineProps<{
  valor: string
  rotulo: string
}>()
</script>

<template>
  <div class="stat-card" data-testid="stat-card">
    <strong class="stat-card__valor" data-testid="stat-valor">{{ valor }}</strong>
    <span class="stat-card__rotulo" data-testid="stat-rotulo">{{ rotulo }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
}

.stat-card__valor {
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 1.25rem;
}

.stat-card__rotulo {
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  line-height: 1.35;
}
</style>
