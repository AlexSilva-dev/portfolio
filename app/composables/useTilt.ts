import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const POINTER_FINE_QUERY = '(pointer: fine)'

/** Variavel CSS que alimenta a sombra da moldura no SectionEvolution. */
export const VAR_ELEVACAO_SOMBRA = '--polaroide-elevacao'

export interface TiltOptions {
  /** Graus maximos de inclinacao em cada eixo. */
  maxDeg?: number
  /** Segundos do tween de acompanhamento do cursor. */
  duracao?: number
  /** Segundos do tween de volta a base. */
  duracaoRetorno?: number
  /** Ease do retorno a base. */
  easeRetorno?: string
  /** Intensidade da sombra no tilt maximo, de 0 a 1. */
  elevacaoSombra?: number
}

const PADRAO: Required<TiltOptions> = {
  maxDeg: 8,
  duracao: 0.25,
  duracaoRetorno: 0.7,
  easeRetorno: 'elastic.out(1, 0.4)',
  elevacaoSombra: 1,
}

/**
 * Inclinacao 3D pura em direcao ao cursor, limitada ao maxDeg nos dois eixos.
 * O canto mais perto do cursor vem a frente, no mesmo espirito do magnetismo
 * que puxa o botao na direcao do ponteiro. Separada da fiacao de eventos para
 * permitir teste unitario com valores concretos.
 */
export function computeTiltRotation(
  cursorX: number,
  cursorY: number,
  rect: { left: number, top: number, width: number, height: number },
  maxDeg: number = PADRAO.maxDeg,
): { rotateX: number, rotateY: number } {
  const centroX = rect.left + rect.width / 2
  const centroY = rect.top + rect.height / 2
  const limitar = (valor: number) => Math.max(-maxDeg, Math.min(maxDeg, valor))
  return {
    rotateX: limitar(((cursorY - centroY) * maxDeg) / (rect.height / 2)),
    rotateY: limitar(((centroX - cursorX) * maxDeg) / (rect.width / 2)),
  }
}

/**
 * Tilt de moldura seguindo o cursor, so em desktop com ponteiro fino e cortado
 * com movimento reduzido. A moldura inclina na direcao do cursor e a sombra
 * cresce junto, voltando elasticamente a base quando o ponteiro sai.
 * Cleanup pelo padrao de contexto, revert em onUnmounted.
 */
export function useTilt(alvo: Ref<HTMLElement | null>, opcoes: TiltOptions = {}) {
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
      const { rotateX, rotateY } = computeTiltRotation(
        evento.clientX,
        evento.clientY,
        el.getBoundingClientRect(),
        config.maxDeg,
      )
      contexto?.add(() => {
        gsap.to(el, {
          duration: config.duracao,
          overwrite: 'auto',
          rotateX,
          rotateY,
          transformPerspective: 800,
          [VAR_ELEVACAO_SOMBRA]: config.elevacaoSombra,
        })
      })
    }

    const aoSair = () => {
      contexto?.add(() => {
        gsap.to(el, {
          duration: config.duracaoRetorno,
          ease: config.easeRetorno,
          overwrite: 'auto',
          rotateX: 0,
          rotateY: 0,
          [VAR_ELEVACAO_SOMBRA]: 0,
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
