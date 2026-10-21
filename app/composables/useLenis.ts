import { getCurrentInstance, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const POINTER_FINE_QUERY = '(pointer: fine)'
const ANCORA_SELECTOR = 'a[href^="#"]'

/**
 * Rolagem suavizada com Lenis, desktop only, dirigida pelo gsap.ticker.
 * O raf do Lenis roda no tick do gsap em milissegundos e cada rolagem
 * dispara ScrollTrigger.update. Mobile navega com rolagem nativa e o
 * movimento reduzido corta tudo. Chamado dentro de um componente, sobe no
 * mount e destrói no unmount, chamado no plugin de cliente, sobe na hora e
 * vive pela vida da aplicação.
 */
export function useLenis() {
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let lenis: Lenis | null = null
  let removerTicker: (() => void) | null = null
  let removerListenerAncoras: (() => void) | null = null

  const ativar = () => {
    if (lenis || typeof window === 'undefined') return
    if (!window.matchMedia(POINTER_FINE_QUERY).matches) return
    if (prefersReducedMotion.value) return

    lenis = new Lenis({ autoRaf: false })

    const aoScroll = () => {
      ScrollTrigger.update()
    }
    lenis.on('scroll', aoScroll)

    // gsap.ticker passa o tempo em segundos, o raf do Lenis espera milissegundos
    const aoTick = (tempoSegundos: number) => {
      lenis?.raf(tempoSegundos * 1000)
    }
    gsap.ticker.add(aoTick)
    removerTicker = () => {
      gsap.ticker.remove(aoTick)
    }

    // Interceptação das âncoras do menu com o alvo certo, rolagem nativa
    // preservada quando o Lenis não existe
    const aoClicar = (evento: MouseEvent) => {
      const ancora = (evento.target as HTMLElement | null)?.closest?.(ANCORA_SELECTOR)
      const hash = ancora?.getAttribute('href')
      if (!ancora || !hash) return
      evento.preventDefault()
      lenis?.scrollTo(hash)
    }
    document.addEventListener('click', aoClicar)
    removerListenerAncoras = () => {
      document.removeEventListener('click', aoClicar)
    }
  }

  const desativar = () => {
    removerTicker?.()
    removerTicker = null
    removerListenerAncoras?.()
    removerListenerAncoras = null
    lenis?.destroy()
    lenis = null
  }

  watch(prefersReducedMotion, (reduzido) => {
    if (reduzido) desativar()
  })

  if (getCurrentInstance()) {
    onMounted(ativar)
    onUnmounted(desativar)
  } else {
    ativar()
  }
}
