import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { dividirEmPalavras, indicesDoDestaque } from './useTextFill'
import { agendarRefreshGatilhos } from '../utils/motion'

gsap.registerPlugin(ScrollTrigger)

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
 * Palavra acesa permanece acesa, a leitura marca o texto. Ponteiro grosso
 * (touch) não tem cursor, então lá o acendimento vira progresso de leitura
 * com ScrollTrigger e scrub, palavra por palavra, mantendo o destaque. Só
 * movimento reduzido fica de fora, com o texto estático integral.
 */
export function useCursorLit(alvo: Ref<HTMLElement | null>, opcoes: OpcoesUseCursorLit) {
  const { prefersReducedMotion } = usePrefersReducedMotion()
  const raio = opcoes.raio ?? RAIO_PADRAO_PX

  let palavras: HTMLSpanElement[] = []
  let elEscutado: HTMLElement | null = null
  let contexto: ReturnType<typeof gsap.context> | null = null
  let cancelarRefresh: () => void = () => {}

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
    cancelarRefresh()
    cancelarRefresh = () => {}
    contexto?.revert()
    contexto = null
    palavras = []
  }

  // Sem cursor, a leitura é o gesto. O parágrafo acende conforme atravessa
  // a viewport, no mesmo método que o primeiro parágrafo usa no mobile.
  const acenderPorLeitura = (el: HTMLElement) => {
    contexto = gsap.context(() => {
      gsap.fromTo(
        palavras,
        { opacity: OPACIDADE_DIM },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 60%',
            scrub: true,
          },
        },
      )
    }, el)
    cancelarRefresh = agendarRefreshGatilhos(() => ScrollTrigger.refresh())
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

    // Movimento reduzido, texto integralmente aceso, estático, sem spans.
    if (prefersReducedMotion.value) {
      el.textContent = texto
      return
    }

    criarPalavras(el, texto)
    palavras = [...el.querySelectorAll<HTMLSpanElement>(`.${CLASSE_PALAVRA}`)]

    if (window.matchMedia(POINTER_FINE_QUERY).matches) {
      el.addEventListener('pointermove', aoMoverPonteiro as EventListener)
      elEscutado = el
      return
    }

    acenderPorLeitura(el)
  }

  onMounted(ativar)
  watch([() => opcoes.texto(), prefersReducedMotion], ativar)
  onUnmounted(desativar)
}
