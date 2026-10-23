<script setup lang="ts">
import { ref } from 'vue'
import { tryUseNuxtApp } from 'nuxt/app'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import Preloader from '../components/Preloader.vue'
import CustomCursor from '../components/CustomCursor.vue'
import { useLocale } from '../composables/useLocale'

// O layout pode ser montado fora do contexto do Nuxt (specs Vue puros), onde
// composables de nuxt/app lançam erro. Fora do Nuxt a região aria-live fica
// inerte com texto vazio, sempre presente no DOM.
const { announcement } = tryUseNuxtApp()
  ? useLocale()
  : { announcement: ref('') }
</script>

<template>
  <Preloader />
  <ClientOnly>
    <CustomCursor />
  </ClientOnly>
  <SiteHeader />
  <main class="container">
    <slot />
  </main>
  <SiteFooter />
  <p class="locale-status" role="status" aria-live="polite">{{ announcement }}</p>
</template>

<style scoped>
.locale-status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
