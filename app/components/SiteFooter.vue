<script setup lang="ts">
import { useLocale } from '../composables/useLocale'

const { dictionary } = useLocale()
</script>

<template>
  <footer class="site-footer" data-testid="site-footer">
    <p class="site-footer__texto">
      {{ dictionary.sections.layout.footer.copyright }}
    </p>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--color-surface);
  padding: 2rem 1.5rem;
}

.site-footer__texto {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  text-align: center;
}
</style>
