import { getCurrentInstance, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Teto absoluto da distorcao, em graus. Distorcao acima disso cansa o olho. */
export const LIMITE_SKEW_GRAUS = 1.5

/** Velocidade de rolagem em px/s que corresponde ao limite cheio de skew. */
export const VELOCIDADE_REFERENCIA_PX_S = 2000

const POINTER_FINE_QUERY = '(pointer: fine)'
const FATOR_LERP = 0.12
const DT_PADRAO_S = 0.016
const DT_MINIMO_S = 0.001
const VELOCIDADE_PARADA_PX_S = 4
const SKEW_ASSENTADO_GRAUS = 0.01

/**
 * SkewY proporcional a velocidade de rolagem, com clamp simetrico no limite.
 * NaN (dado corrompido) vira zero, nunca distorce, e infinito cai no clamp.
 * Configuracao invalida (limite ou referencia nao positivos) falha com
 * RangeError, seguindo o padrao das funcoes puras do projeto.
 */
export function calcularSkewY(
  velocidadePxPorSegundo: number,
  limiteGraus = LIMITE_SKEW_GRAUS,
  referenciaPxPorSegundo = VELOCIDADE_REFERENCIA_PX_S,
): number {
  if (Number.isNaN(velocidadePxPorSegundo)) return 0
  if (limiteGraus <= 0) {
    throw new RangeError(`limite de skew precisa ser positivo, recebi ${limiteGraus}`)
  }
  if (referenciaPxPorSegundo <= 0) {
    throw new RangeError(`referencia de velocidade precisa ser positiva, recebi ${referenciaPxPorSegundo}`)
  }
  const bruto = (velocidadePxPorSegundo / referenciaPxPorSegundo) * limiteGraus
  return Math.max(Math.min(bruto, limiteGraus), -limiteGraus)
}

/**
 * Distorcao por velocidade de scroll num wrapper alvo, desktop only.
 * O Lenis do projeto nao expoe a instancia, entao a velocidade vem do delta
 * de window.scrollY por frame, o que funciona igual com ou sem ele. O efeito
 * assenta de volta a zero com lerp quando a rolagem para e o cleanup remove
 * listener, frame pendente e transform. Reduzido de movimento corta tudo.
 * O alvo e um wrapper interno da pagina, NUNCA o html ou body inteiro, para
 * nao borrar texto fixo.
 */
export function useVelocitySkew(alvo: Ref<HTMLElement | null>) {
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let ouvindo = false
  let quadro = 0
  let rodando = false
  let atual = 0
  let ultimoY = 0
  let ultimoTempo: number | null = null

  const aplicar = (graus: number) => {
    const el = alvo.value
    if (!el) return
    if (graus === 0) {
      el.style.removeProperty('transform')
      return
    }
    el.style.setProperty('transform', `skewY(${graus.toFixed(4)}deg)`)
  }

  const limparFrame = () => {
    if (quadro) cancelAnimationFrame(quadro)
    quadro = 0
    rodando = false
  }

  const passo = (tempo: number) => {
    const y = window.scrollY
    const dt = ultimoTempo === null
      ? DT_PADRAO_S
      : Math.max((tempo - ultimoTempo) / 1000, DT_MINIMO_S)
    const instantanea = (y - ultimoY) / dt
    ultimoY = y
    ultimoTempo = tempo

    const destino = calcularSkewY(instantanea)
    atual += (destino - atual) * FATOR_LERP

    if (Math.abs(instantanea) < VELOCIDADE_PARADA_PX_S && Math.abs(atual) < SKEW_ASSENTADO_GRAUS) {
      atual = 0
      aplicar(0)
      limparFrame()
      return
    }

    aplicar(atual)
    quadro = requestAnimationFrame(passo)
  }

  const aoScroll = () => {
    if (rodando) return
    rodando = true
    ultimoTempo = null
    quadro = requestAnimationFrame(passo)
  }

  const ativar = () => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia(POINTER_FINE_QUERY).matches) return
    if (prefersReducedMotion.value) return
    ultimoY = window.scrollY
    window.addEventListener('scroll', aoScroll, { passive: true })
    ouvindo = true
  }

  const desativar = () => {
    if (ouvindo) window.removeEventListener('scroll', aoScroll)
    ouvindo = false
    limparFrame()
    atual = 0
    ultimoTempo = null
    aplicar(0)
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
