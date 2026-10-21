import { defineNuxtPlugin } from 'nuxt/app'
import { gsap } from 'gsap'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin()

  return {
    provide: {
      gsap,
    },
  }
})
