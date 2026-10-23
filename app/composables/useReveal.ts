import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { agendarRefreshGatilhos } from '../utils/motion'

gsap.registerPlugin(ScrollTrigger)

const REVEAL_LINE_SELECTOR = '.reveal-line'
const REVEAL_MASK_CLASS = 'reveal-mask'
const INICIO_ENTRADA = 'top 80%'
/** O conteúdo nasce abaixo do corte da máscara e sobe até assentar no lugar. */
const ENTRADA_MASCARA_PERCENT = 110
const DURACAO_ENTRADA_SEG = 0.9
const ESCALONAMENTO_LINHAS_SEG = 0.12

/**
 * Reveal editorial por máscara de linha na primeira entrada da seção. Cada
 * span .reveal-line fica escrito no template e ganha por JavaScript um
 * wrapper .reveal-mask com overflow hidden, o texto desliza de dentro do
 * corte subindo de 110 por cento pra zero com ease expo out e stagger entre
 * linhas. O texto está no HTML desde o servidor e o estado inicial oculto
 * é aplicado só por JavaScript. Movimento reduzido corta tudo, nenhuma
 * máscara é criada e o conteúdo permanece visível. O contexto gsap escopa
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

      // O corte vive na máscara, cada linha desliza de dentro do próprio vão.
      linhas.forEach((linha) => {
        if (linha.parentElement?.classList.contains(REVEAL_MASK_CLASS)) return
        const mascara = document.createElement('span')
        mascara.className = REVEAL_MASK_CLASS
        mascara.style.display = 'block'
        mascara.style.overflow = 'hidden'
        linha.parentNode?.insertBefore(mascara, linha)
        mascara.appendChild(linha)
      })

      gsap.from(linhas, {
        yPercent: ENTRADA_MASCARA_PERCENT,
        duration: DURACAO_ENTRADA_SEG,
        stagger: ESCALONAMENTO_LINHAS_SEG,
        ease: 'expo.out',
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
