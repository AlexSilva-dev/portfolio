<script setup lang="ts">
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import Preloader from '../components/Preloader.vue'
</script>

<template>
  <ClientOnly>
    <Preloader />
  </ClientOnly>
  <SiteHeader />
  <main class="container">
    <slot />
  </main>
  <SiteFooter />
</template>
