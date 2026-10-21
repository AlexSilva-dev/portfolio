<script setup lang="ts">
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
</script>

<template>
  <SiteHeader />
  <main class="container">
    <slot />
  </main>
  <SiteFooter />
</template>
