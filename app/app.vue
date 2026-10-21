<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: 'Portifólio · Alex Alves ·',
  meta: [
    { name: 'description', content: 'Meu portifólio' }
  ],

  link: [{ rel: 'icon', type: 'image/png', href: '/favicon.ico' }]

})
</script>