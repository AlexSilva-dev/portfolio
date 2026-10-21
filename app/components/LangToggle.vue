<script setup lang="ts">
const { locale, setLocale } = useLocale()

const opcoes = [
  { codigo: 'pt', rotulo: 'PT' },
  { codigo: 'en', rotulo: 'EN' },
] as const
</script>

<template>
  <div class="lang-toggle" data-testid="lang-toggle">
    <button
      v-for="opcao in opcoes"
      :key="opcao.codigo"
      type="button"
      class="lang-toggle__opcao"
      :class="{ 'is-active': locale === opcao.codigo }"
      :aria-pressed="locale === opcao.codigo"
      :data-testid="`lang-toggle-${opcao.codigo}`"
      @click="setLocale(opcao.codigo)"
    >
      {{ opcao.rotulo }}
    </button>
  </div>
</template>

<style scoped>
.lang-toggle {
  display: flex;
  gap: 0.25rem;
}

.lang-toggle__opcao {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  text-decoration: underline transparent;
  text-underline-offset: 3px;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}

.lang-toggle__opcao:hover {
  color: var(--color-text);
}

.lang-toggle__opcao.is-active {
  color: var(--color-accent);
  font-weight: 700;
  text-decoration-color: var(--color-accent);
}
</style>
