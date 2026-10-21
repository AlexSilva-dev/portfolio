<script setup lang="ts">
import { SITE_BASE_URL } from '../utils/site'

const { dictionary } = useLocale()
</script>

<template>
  <section class="nao-encontrada">
    <h1 class="nao-encontrada__titulo" data-testid="notfound-heading">
      {{ dictionary.sections.notfound.heading }}
    </h1>
    <p class="nao-encontrada__mensagem" data-testid="notfound-message">
      {{ dictionary.sections.notfound.message }}
    </p>
    <a
      :href="SITE_BASE_URL"
      class="nao-encontrada__voltar"
      data-testid="notfound-back-home"
    >
      {{ dictionary.sections.notfound.backHome }}
    </a>
  </section>
</template>

<style scoped>
.nao-encontrada {
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

.nao-encontrada__titulo {
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin: 0;
}

.nao-encontrada__mensagem {
  color: var(--color-text-muted);
  margin: 0;
}

.nao-encontrada__voltar {
  background: var(--color-accent);
  border-radius: 999px;
  color: var(--color-bg);
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
}

.nao-encontrada__voltar:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}
</style>
