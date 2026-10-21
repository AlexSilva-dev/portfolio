import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const POINTER_FINE_QUERY = '(pointer: fine)'

export interface ItemTrilha {
  src: string
  /** Tratamento CSS filter aplicado a variacao da foto. */
  filtro?: string
}

export interface ImageTrailOptions {
  /** Intervalo minimo entre revelacoes, em ms. */
  throttleMs?: number
  /** Segundos da entrada da foto. */
  duracaoEntrada?: number
  /** Segundos da saida da foto. */
  duracaoSaida?: number
}

const PADRAO: Required<ImageTrailOptions> = {
  throttleMs: 90,
  duracaoEntrada: 0.4,
  duracaoSaida: 0.6,
}

/**
 * Rastro de fotos que surgem e desaparecem atras do cursor sobre a area do
 * container, so em desktop com ponteiro fino e cortado com movimento reduzido.
 * As imagens sao criadas a partir da config recebida, decorative, aria-hidden.
 * Cleanup pelo padrao de contexto, revert e remocao do wrapper em onUnmounted.
 */
export function useImageTrail(
  container: Ref<HTMLElement | null>,
  itens: ItemTrilha[],
  opcoes: ImageTrailOptions = {},
) {
  const config = { ...PADRAO, ...opcoes }
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let contexto: ReturnType<typeof gsap.context> | null = null
  let removerListeners: (() => void) | null = null

  const ativar = () => {
    const el = container.value
    if (contexto || !el || itens.length === 0 || typeof window === 'undefined') return
    if (!window.matchMedia(POINTER_FINE_QUERY).matches) return
    if (prefersReducedMotion.value) return

    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-image-trail', '')
    wrapper.setAttribute('aria-hidden', 'true')
    wrapper.style.position = 'absolute'
    wrapper.style.inset = '0'
    wrapper.style.overflow = 'hidden'
    wrapper.style.pointerEvents = 'none'
    wrapper.style.zIndex = '0'

    const imagens = itens.map((item) => {
      const img = document.createElement('img')
      img.src = item.src
      img.alt = ''
      img.decoding = 'async'
      img.draggable = false
      img.style.position = 'absolute'
      img.style.opacity = '0'
      if (item.filtro) img.style.filter = item.filtro
      wrapper.appendChild(img)
      return img
    })
    el.appendChild(wrapper)

    let indice = 0
    let ultimaVez = -Infinity

    contexto = gsap.context(() => {})

    const revelar = (x: number, y: number) => {
      const img = imagens[indice % imagens.length]
      indice += 1
      gsap.set(img, {
        left: x - img.offsetWidth / 2,
        top: y - img.offsetHeight / 2,
        zIndex: indice,
      })
      const rotacao = (indice % 2 === 0 ? 1 : -1) * 4
      contexto?.add(() => {
        gsap.fromTo(
          img,
          { opacity: 0, scale: 0.4, rotation: rotacao },
          { opacity: 1, scale: 1, duration: config.duracaoEntrada, overwrite: 'auto' },
        )
        gsap.to(img, {
          opacity: 0,
          scale: 0.4,
          duration: config.duracaoSaida,
          delay: config.duracaoEntrada * 0.6,
          overwrite: false,
        })
      })
    }

    const aoMover = (evento: PointerEvent) => {
      const agora = performance.now()
      if (agora - ultimaVez < config.throttleMs) return
      ultimaVez = agora
      const borda = el.getBoundingClientRect()
      revelar(evento.clientX - borda.left, evento.clientY - borda.top)
    }

    el.addEventListener('pointermove', aoMover)
    removerListeners = () => el.removeEventListener('pointermove', aoMover)
  }

  const desativar = () => {
    removerListeners?.()
    removerListeners = null
    contexto?.revert()
    contexto = null
    container.value?.querySelector('[data-image-trail]')?.remove()
  }

  onMounted(ativar)
  watch(prefersReducedMotion, (reduzido) => {
    if (reduzido) desativar()
    else ativar()
  })
  onUnmounted(desativar)
}
