import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const POINTER_FINE_QUERY = '(pointer: fine)'

export interface RetanguloPosicao {
  left: number
  top: number
  width: number
  height: number
}

export interface MagneticOptions {
  /** Deslocamento maximo em px, simetrico nos dois eixos. */
  maxOffset?: number
  /** Forca de atracao 0..1 aplicada a distancia do cursor ao centro. */
  forca?: number
  /** Segundos do tween de acompanhamento do cursor. */
  duracao?: number
  /** Segundos do tween de volta a origem. */
  duracaoRetorno?: number
  /** Ease do retorno a origem. */
  easeRetorno?: string
}

const PADRAO: Required<MagneticOptions> = {
  maxOffset: 14,
  forca: 0.35,
  duracao: 0.25,
  duracaoRetorno: 0.7,
  easeRetorno: 'elastic.out(1, 0.4)',
}

/**
 * Deslocamento magnetico puro, limitado ao maxOffset nos dois eixos.
 * Separado da fiação de eventos para permitir teste unitario com valores concretos.
 */
export function computeMagneticOffset(
  cursorX: number,
  cursorY: number,
  rect: RetanguloPosicao,
  maxOffset: number = PADRAO.maxOffset,
  forca: number = PADRAO.forca,
): { x: number, y: number } {
  const centroX = rect.left + rect.width / 2
  const centroY = rect.top + rect.height / 2
  const limitar = (valor: number) => Math.max(-maxOffset, Math.min(maxOffset, valor))
  return {
    x: limitar((cursorX - centroX) * forca),
    y: limitar((cursorY - centroY) * forca),
  }
}

/**
 * Magnetismo de botao, so em desktop com ponteiro fino e cortado com
 * movimento reduzido. O elemento acompanha o cursor dentro do maxOffset e
 * volta elasticamente a origem quando o ponteiro sai.
 * Cleanup pelo padrao de contexto, revert em onUnmounted.
 */
export function useMagnetic(alvo: Ref<HTMLElement | null>, opcoes: MagneticOptions = {}) {
  const config = { ...PADRAO, ...opcoes }
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let contexto: ReturnType<typeof gsap.context> | null = null
  let removerListeners: (() => void) | null = null

  const ativar = () => {
    const el = alvo.value
    if (contexto || !el || typeof window === 'undefined') return
    if (!window.matchMedia(POINTER_FINE_QUERY).matches) return
    if (prefersReducedMotion.value) return

    const aoMover = (evento: PointerEvent) => {
      const deslocamento = computeMagneticOffset(
        evento.clientX,
        evento.clientY,
        el.getBoundingClientRect(),
        config.maxOffset,
        config.forca,
      )
      contexto?.add(() => {
        gsap.to(el, {
          duration: config.duracao,
          overwrite: 'auto',
          x: deslocamento.x,
          y: deslocamento.y,
        })
      })
    }

    const aoSair = () => {
      contexto?.add(() => {
        gsap.to(el, {
          duration: config.duracaoRetorno,
          ease: config.easeRetorno,
          overwrite: 'auto',
          x: 0,
          y: 0,
        })
      })
    }

    contexto = gsap.context(() => {
      el.addEventListener('pointermove', aoMover)
      el.addEventListener('pointerleave', aoSair)
    })
    removerListeners = () => {
      el.removeEventListener('pointermove', aoMover)
      el.removeEventListener('pointerleave', aoSair)
    }
  }

  const desativar = () => {
    removerListeners?.()
    removerListeners = null
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
