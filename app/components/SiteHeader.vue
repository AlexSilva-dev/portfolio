<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../composables/useLocale'

const { dictionary } = useLocale()

const links = computed(() => [
  { href: '#sobre', rotulo: dictionary.value.sections.layout.nav.sobre },
  { href: '#experiencia', rotulo: dictionary.value.sections.layout.nav.experiencia },
  { href: '#projetos', rotulo: dictionary.value.sections.layout.nav.projetos },
  { href: '#tecnologias', rotulo: dictionary.value.sections.layout.nav.tecnologias },
  { href: '#contato', rotulo: dictionary.value.sections.layout.nav.contato },
])
</script>

<template>
  <header class="site-header" data-testid="site-header">
    <nav class="site-header__nav" :aria-label="dictionary.sections.layout.nav.label">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        class="site-header__link"
      >
        {{ link.rotulo }}
      </a>
    </nav>
    <LangToggle />
  </header>
</template>

<style scoped>
.site-header {
  align-items: center;
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.site-header__nav {
  display: flex;
  gap: 1.5rem;
}

.site-header__link {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  text-decoration: none;
  transition: color 0.15s ease;
}

.site-header__link:hover {
  color: var(--color-accent);
}

/* Nav some no mobile, uma página onde o scroll é a navegação */
@media (max-width: 767px) {
  .site-header__nav {
    display: none;
  }
}
</style>
