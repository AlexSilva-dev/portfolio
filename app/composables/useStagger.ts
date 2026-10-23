import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { agendarRefreshGatilhos } from '../utils/motion'

gsap.registerPlugin(ScrollTrigger)

const INICIO_ENTRADA = 'top 80%'
/** Subida do card na entrada, em px. */
const SUBIDA_CARD_PX = 40
/** Intervalo entre itens da mesma lista, em segundos. */
const STAGGER_ITENS = 0.06
/** Atraso da lista de bullets depois do início do card, em segundos. */
const ENTRADA_ITENS_S = 0.1

interface StaggerOpcoes {
  seletorBullets: string
  seletorChips: string
}

/**
 * Entrada do card em cascata pela primeira vez em cena. O card sobe com fade,
 * os bullets entram em sequência rápida logo depois e os chips fecham a onda.
 * O estado inicial oculto nasce só do JavaScript, o conteúdo fica no HTML
 * desde o servidor. Movimento reduzido corta tudo e o contexto gsap é
 * revertido no unmount, no mesmo padrão do useReveal.
 */
export function useStagger(raiz: Ref<HTMLElement | null>, opcoes: StaggerOpcoes) {
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let contexto: ReturnType<typeof gsap.context> | null = null
  let cancelarRefresh: () => void = () => {}

  const ativar = () => {
    const el = raiz.value
    if (contexto || !el || typeof window === 'undefined') return
    if (prefersReducedMotion.value) return

    contexto = gsap.context(() => {
      const bullets = el.querySelectorAll(opcoes.seletorBullets)
      const chips = el.querySelectorAll(opcoes.seletorChips)

      const linha = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: INICIO_ENTRADA,
          once: true,
        },
      })

      linha.from(el, {
        y: SUBIDA_CARD_PX,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      if (bullets.length) {
        linha.from(
          bullets,
          {
            y: 14,
            opacity: 0,
            duration: 0.4,
            stagger: STAGGER_ITENS,
            ease: 'power2.out',
          },
          ENTRADA_ITENS_S,
        )
      }

      if (chips.length) {
        linha.from(
          chips,
          {
            y: 10,
            opacity: 0,
            duration: 0.35,
            stagger: STAGGER_ITENS,
            ease: 'power2.out',
          },
          ENTRADA_ITENS_S + bullets.length * STAGGER_ITENS,
        )
      }

      // Fontes e imagens mudam as medidas depois do mount, sem refresh o
      // gatilho once dispara antes do card entrar de fato em cena.
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
