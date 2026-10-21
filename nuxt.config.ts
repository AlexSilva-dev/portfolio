// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: { port: 3010 },
  devtools: { enabled: true },
  css: [
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '@fontsource/jetbrains-mono/400.css',
    '@fontsource/jetbrains-mono/500.css',
    '@/assets/css/tokens.css',
    '@/assets/css/base.css',
  ],
  app: {
    baseURL: '/Portifolio/',
  },
})
