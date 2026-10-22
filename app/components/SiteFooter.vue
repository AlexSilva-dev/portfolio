<script setup lang="ts">
const { dictionary } = useLocale()
const layout = computed(() => dictionary.value.sections.layout)
</script>

<template>
  <footer class="site-footer" data-testid="site-footer">
    <div
      class="site-footer__wordmark"
      aria-hidden="true"
      data-testid="footer-wordmark"
    >
      {{ layout.footer.wordmark }}
    </div>
    <p class="site-footer__texto">{{ layout.footer.copyright }}</p>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--color-surface);
  overflow: hidden;
  padding: 2rem 1.5rem;
}

.site-footer__wordmark {
  color: var(--color-ink);
  font-size: clamp(2.5rem, 15vw, 16rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.site-footer__texto {
  color: var(--color-ink);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  text-align: center;
}
</style>
