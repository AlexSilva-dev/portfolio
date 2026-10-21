import { defineNuxtPlugin } from 'nuxt/app'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from '../composables/useLenis'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)

  // Lenis dirigido pelo gsap.ticker, desktop only, com ScrollTrigger.update
  // no scroll. Fora de componente, sobe na hora e vive pela vida da aplicação
  useLenis()

  return {
    provide: {
      gsap,
    },
  }
})
