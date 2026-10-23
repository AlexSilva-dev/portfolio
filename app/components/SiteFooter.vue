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
/* Rodapé na área escura, preto puro do void com anel de foco claro
   (mesma sobreposição da seção de contato) */
.site-footer {
  --focus-ring: 2px solid var(--color-accent);

  background: var(--color-void);
  border-top: 1px solid color-mix(in srgb, var(--color-text) 20%, transparent);
  overflow: hidden;
  padding: 2rem 1.5rem;
}

.site-footer__wordmark {
  color: var(--color-paper);
  font-size: clamp(2.5rem, 15vw, 16rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.site-footer__texto {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  text-align: center;
}
</style>
