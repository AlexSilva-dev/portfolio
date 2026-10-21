// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: { port: 3010 },
  devtools: { enabled: true },
  css: [
    '@/assets/main.css',
  ],
  app: {
    baseURL: '/Portifolio/',
  },
})
