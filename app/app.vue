<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { SITE_BASE_URL } from './utils/site'

// O title e a description vêm do useHead do useLocale, que consome o
// dicionário de forma reativa, aqui fica só o favicon
useHead({
  link: [{ rel: 'icon', type: 'image/x-icon', href: `${SITE_BASE_URL}favicon.ico` }],
})
</script>