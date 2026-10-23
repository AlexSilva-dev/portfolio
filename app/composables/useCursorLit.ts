import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { dividirEmPalavras, indicesDoDestaque } from './useTextFill'

const POINTER_FINE_QUERY = '(pointer: fine)'
const CLASSE_PALAVRA = 'evolucao__palavra'
const CLASSE_DESTAQUE = 'evolucao__palavra--destaque'

/**
 * Opacidade do estado dim sobre o papel, aplicada só por JavaScript. Bem
 * acima do apagado do preenchimento de scroll, o parágrafo nasce legível e
 * a tinta cheia é a recompensa de quem passa o cursor.
 */
export const OPACIDADE_DIM = 0.38

/**
 * Raio de proximidade em px, do cursor ao centro da palavra. Acende por
 * aproximação, não só no hover exato.
 */
export const RAIO_PADRAO_PX = 110

export interface Ponto {
  x: number
  y: number
}

export interface Retangulo {
  left: number
  top: number
  width: number
  height: number
}

export interface OpcoesUseCursorLit {
  /** Fonte viva do texto, relida a cada reconstrução de spans. */
  texto: () => string
  /** Trecho ou trechos que acendem em violeta profundo. */
  destaque?: () => string | string[] | undefined
  /** Raio de proximidade do cursor em px. */
  raio?: number
}

/** Distância euclidiana entre dois pontos. */
export function distancia(a: Ponto, b: Ponto): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Centro de um retângulo de palavra. */
export function centroDoRect(rect: Retangulo): Ponto {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

/**
 * A palavra acende quando o cursor entra no raio de proximidade do centro
 * dela. Borda inclusa de propósito, o limite é acendimento.
 */
export function acendeNoRaio(cursor: Ponto, centro: Ponto, raio: number): boolean {
  return distancia(cursor, centro) <= raio
}

/**
 * Acendimento por cursor, parágrafo 2 do bloco de evolução. O texto integral
 * já está no HTML, as spans por palavra nascem em runtime e o estado dim é
 * aplicado só por JavaScript, sem JavaScript o parágrafo fica 100% aceso.
 * Palavra acesa permanece acesa, a leitura marca o texto. Movimento reduzido
 * e ponteiro que não é fino (touch) ficam de fora, texto estático integral.
 */
export function useCursorLit(alvo: Ref<HTMLElement | null>, opcoes: OpcoesUseCursorLit) {
  const { prefersReducedMotion } = usePrefersReducedMotion()
  const raio = opcoes.raio ?? RAIO_PADRAO_PX

  let palavras: HTMLSpanElement[] = []
  let elEscutado: HTMLElement | null = null

  const aoMoverPonteiro = (evento: PointerEvent) => {
    const cursor = { x: evento.clientX, y: evento.clientY }
    for (const span of palavras) {
      // acesa permanece acesa, sai da lista de trabalho e o custo cai
      if (span.style.opacity === '1') continue
      if (acendeNoRaio(cursor, centroDoRect(span.getBoundingClientRect()), raio)) {
        span.style.opacity = '1'
      }
    }
  }

  const desativar = () => {
    // alvo.value já pode estar null no unmount, a referência em escuta é
    // guardada na ativação
    if (elEscutado) {
      elEscutado.removeEventListener('pointermove', aoMoverPonteiro as EventListener)
    }
    elEscutado = null
    palavras = []
  }

  const criarPalavras = (el: HTMLElement, texto: string) => {
    const destacadas = indicesDoDestaque(texto, opcoes.destaque?.() ?? '')
    const palavrasTexto = dividirEmPalavras(texto)
    el.textContent = ''
    palavrasTexto.forEach((palavra, indice) => {
      const span = document.createElement('span')
      span.className =
        destacadas.has(indice)
          ? `${CLASSE_PALAVRA} ${CLASSE_DESTAQUE}`
          : CLASSE_PALAVRA
      span.textContent = palavra.texto
      span.style.opacity = String(OPACIDADE_DIM)
      el.appendChild(span)
      if (indice < palavrasTexto.length - 1) {
        el.appendChild(document.createTextNode(' '))
      }
    })
  }

  const ativar = () => {
    const el = alvo.value
    if (!el || typeof window === 'undefined') return

    // Reativação (troca de idioma, mudança de movimento) derruba a escuta
    // anterior antes de criar a nova, sem listener órfão
    desativar()

    const texto = opcoes.texto()

    // Movimento reduzido ou sem ponteiro fino: texto integralmente aceso,
    // estático, sem spans. O efeito é camada progressiva de desktop.
    if (prefersReducedMotion.value || !window.matchMedia(POINTER_FINE_QUERY).matches) {
      el.textContent = texto
      return
    }

    criarPalavras(el, texto)
    palavras = [...el.querySelectorAll<HTMLSpanElement>(`.${CLASSE_PALAVRA}`)]
    el.addEventListener('pointermove', aoMoverPonteiro as EventListener)
    elEscutado = el
  }

  onMounted(ativar)
  watch([() => opcoes.texto(), prefersReducedMotion], ativar)
  onUnmounted(desativar)
}
