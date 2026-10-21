<script setup lang="ts">
import { clearError } from 'nuxt/app'
import { SITE_BASE_URL } from './utils/site'

const { dictionary } = useLocale()

function voltarProInicio() {
  clearError({ redirect: SITE_BASE_URL })
}
</script>

<template>
  <main class="erro">
    <h1 class="erro__titulo" data-testid="error-heading">
      {{ dictionary.sections.notfound.heading }}
    </h1>
    <p class="erro__mensagem" data-testid="error-message">
      {{ dictionary.sections.notfound.message }}
    </p>
    <button
      type="button"
      class="erro__voltar"
      data-testid="error-back-home"
      @click="voltarProInicio"
    >
      {{ dictionary.sections.notfound.backHome }}
    </button>
  </main>
</template>

<style scoped>
.erro {
  align-items: center;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

.erro__titulo {
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin: 0;
}

.erro__mensagem {
  color: var(--color-text-muted);
  margin: 0;
}

.erro__voltar {
  background: var(--color-accent);
  border: none;
  border-radius: 999px;
  color: var(--color-bg);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
}

.erro__voltar:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}
</style>
