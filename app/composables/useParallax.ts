import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { agendarRefreshGatilhos } from '../utils/motion'

gsap.registerPlugin(ScrollTrigger)

export interface ParallaxOptions {
  /** px que a moldura desce antes de subir na travessia da viewport. */
  deslocamento?: number
  /** Graus de giro total ao longo da travessia, alguns graus. */
  rotacaoDelta?: number
  /** Inclinacao fixa da moldura no CSS, base do giro. */
  rotacaoBase?: number
}

const PADRAO: Required<ParallaxOptions> = {
  deslocamento: 32,
  rotacaoDelta: 6,
  rotacaoBase: -6,
}

/**
 * Parallax de scroll da polaroid, cortado com movimento reduzido. A moldura
 * entra um pouco mais baixa e mais deitada que a rotacao fixa do CSS, sobe e
 * gira de volta enquanto a secao atravessa a viewport, com scrub de atraso
 * leve. Cleanup pelo padrao de contexto, revert em onUnmounted.
 */
export function useParallax(alvo: Ref<HTMLElement | null>, opcoes: ParallaxOptions = {}) {
  const config = { ...PADRAO, ...opcoes }
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let contexto: ReturnType<typeof gsap.context> | null = null
  let cancelarRefresh: (() => void) | null = null

  const ativar = () => {
    const el = alvo.value
    if (contexto || !el || typeof window === 'undefined') return
    if (prefersReducedMotion.value) return

    cancelarRefresh = agendarRefreshGatilhos(() => ScrollTrigger.refresh())
    contexto = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          y: config.deslocamento,
          rotation: config.rotacaoBase - config.rotacaoDelta / 2,
        },
        {
          y: -config.deslocamento,
          rotation: config.rotacaoBase + config.rotacaoDelta / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        },
      )
    })
  }

  const desativar = () => {
    cancelarRefresh?.()
    cancelarRefresh = null
    contexto?.revert()
    contexto = null
  }

  onMounted(ativar)
  watch(prefersReducedMotion, (reduzido) => {
    if (reduzido) desativar()
    else ativar()
  })
  onUnmounted(desativar)
}
