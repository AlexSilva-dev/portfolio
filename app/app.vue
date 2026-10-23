<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useLocale } from './composables/useLocale'
import { SITE_BASE_URL } from './utils/site'

// O title e a description vêm do useHead do useLocale, que consome o
// dicionário de forma reativa. O lang do html também segue o locale de
// forma reativa, requisito WCAG 3.1.1 (Idioma da Página, nível A)
const { locale } = useLocale()

useHead({
  htmlAttrs: { lang: computed(() => locale.value) },
  link: [{ rel: 'icon', type: 'image/x-icon', href: `${SITE_BASE_URL}favicon.ico` }],
  script: [
    {
      innerHTML:
        "document.documentElement.classList.add('js');if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('sem-preloader')}",
    },
  ],
})
</script>