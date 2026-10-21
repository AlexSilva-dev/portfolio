<script setup lang="ts">
import { computed } from 'vue'
import type { Project, ProjectStatus } from '../content/projects'
import type { ProjectsDict } from '../i18n/sections/projects'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{ project: Project; text: ProjectsDict['items'][number] }>()

const VARIANTE_POR_STATUS: Record<ProjectStatus, 'production' | 'wip' | 'neutral'> = {
  production: 'production',
  solo: 'neutral',
  tool: 'neutral',
  wip: 'wip',
}

const variante = computed(() => VARIANTE_POR_STATUS[props.project.status])

// Com url o card inteiro é clicável, sem url nenhum elemento clicável
const linkAttrs = computed(() =>
  props.project.url
    ? { href: props.project.url, target: '_blank', rel: 'noopener' }
    : {},
)
</script>

<template>
  <component
    :is="project.url ? 'a' : 'article'"
    class="project-card"
    :class="{ 'project-card--link': !!project.url }"
    data-testid="project-card"
    v-bind="linkAttrs"
  >
    <StatusBadge :variant="variante" :label="text.badge" />
    <h3 class="project-card__title" data-testid="project-card-title">{{ text.name }}</h3>
    <p class="project-card__summary">{{ text.summary }}</p>
    <ul class="project-card__chips">
      <li v-for="chip in text.chips" :key="chip" class="project-card__chip">{{ chip }}</li>
    </ul>
  </component>
</template>

<style scoped>
.project-card {
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-text-muted) 20%, transparent);
  border-radius: 0.75rem;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  padding: 1.5rem;
}

.project-card--link {
  text-decoration: none;
}

.project-card--link:hover {
  transform: translateY(-2px);
}

.project-card__title {
  color: var(--color-text);
  font-size: 1.25rem;
}

.project-card__summary {
  color: var(--color-text-muted);
}

.project-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.project-card__chip {
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  border-radius: 999px;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  padding: 0.125rem 0.625rem;
}
</style>
