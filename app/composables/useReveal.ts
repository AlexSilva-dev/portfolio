import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { agendarRefreshGatilhos } from '../utils/motion'

gsap.registerPlugin(ScrollTrigger)

const REVEAL_LINE_SELECTOR = '.reveal-line'
const INICIO_ENTRADA = 'top 80%'
/** Subida sutil da linha, em px, suficiente pra dar entrada sem sumir com o título. */
const SUBIDA_LINHA_PX = 10

/**
 * Reveal linha a linha na primeira entrada da seção. Os spans .reveal-line
 * ficam escritos no template, o texto está no HTML desde o servidor e o
 * estado inicial oculto é aplicado só por JavaScript. Movimento reduzido
 * corta a animação e o conteúdo permanece visível. O contexto gsap escopa
 * os tweens no elemento raiz e é revertido no unmount.
 */
export function useReveal(raiz: Ref<HTMLElement | null>) {
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let contexto: ReturnType<typeof gsap.context> | null = null
  let cancelarRefresh: () => void = () => {}

  const ativar = () => {
    const el = raiz.value
    if (contexto || !el || typeof window === 'undefined') return
    if (prefersReducedMotion.value) return

    contexto = gsap.context(() => {
      const linhas = el.querySelectorAll(REVEAL_LINE_SELECTOR)
      if (!linhas.length) return

      gsap.from(linhas, {
        y: SUBIDA_LINHA_PX,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: INICIO_ENTRADA,
          once: true,
        },
      })

      // Fontes e imagens mudam as medidas depois do mount, sem refresh o
      // gatilho once dispara antes da linha entrar de fato em cena.
      cancelarRefresh = agendarRefreshGatilhos(() => ScrollTrigger.refresh())
    }, el)
  }

  const desativar = () => {
    cancelarRefresh()
    cancelarRefresh = () => {}
    contexto?.revert()
    contexto = null
  }

  onMounted(ativar)
  watch(prefersReducedMotion, (reduzido) => {
    if (reduzido) desativar()
  })
  onUnmounted(desativar)
}
