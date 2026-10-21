<script setup lang="ts">
defineProps<{ variant: 'production' | 'wip' | 'neutral'; label: string }>()
</script>

<template>
  <span class="status-badge" :class="`status-badge--${variant}`" data-testid="status-badge">
    <span class="status-badge__dot" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.75rem;
  font-weight: 600;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  width: fit-content;
}

/* Dot sempre presente junto do texto, nunca cor sozinha */
.status-badge__dot {
  background: currentColor;
  border-radius: 50%;
  height: 0.5rem;
  width: 0.5rem;
}

.status-badge--production {
  background: color-mix(in srgb, var(--color-status-green) 16%, transparent);
  color: var(--color-status-green);
}

.status-badge--wip {
  background: color-mix(in srgb, var(--color-status-amber) 16%, transparent);
  color: var(--color-status-amber);
}

.status-badge--neutral {
  background: color-mix(in srgb, var(--color-text-muted) 14%, transparent);
  color: var(--color-text-muted);
}
</style>
