import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const POINTER_FINE_QUERY = '(pointer: fine)'
const SELETOR_PALAVRA = '.intro__palavra'
const CLASSE_DESTAQUE = 'intro__palavra--destaque'

/** Opacidade do estado apagado sobre o papel, aplicada só por JavaScript. */
export const OPACIDADE_APAGADA = 0.15

export interface Palavra {
  texto: string
  inicio: number
  fim: number
}

export interface OpcoesUseTextFill {
  /** Fonte viva do texto, relida a cada reconstrução de spans. */
  texto: () => string
  /** Trecho do texto que acende em violeta profundo. */
  destaque?: () => string | undefined
}

/**
 * Divide o texto em palavras mantendo o offset de cada uma no original.
 * Espaços múltiplos não geram palavra vazia.
 */
export function dividirEmPalavras(texto: string): Palavra[] {
  const palavras: Palavra[] = []
  const regex = /\S+/g
  let achou: RegExpExecArray | null
  while ((achou = regex.exec(texto)) !== null) {
    palavras.push({ texto: achou[0], inicio: achou.index, fim: achou.index + achou[0].length })
  }
  return palavras
}

/**
 * Índices das palavras que intersectam o trecho de destaque. Trecho vazio
 * ou ausente do texto não marca nada.
 */
export function indicesDoDestaque(texto: string, destaque: string): Set<number> {
  const indices = new Set<number>()
  if (!destaque) return indices

  const inicioTrecho = texto.indexOf(destaque)
  if (inicioTrecho < 0) return indices

  const fimTrecho = inicioTrecho + destaque.length
  dividirEmPalavras(texto).forEach((palavra, indice) => {
    if (palavra.fim > inicioTrecho && palavra.inicio < fimTrecho) {
      indices.add(indice)
    }
  })
  return indices
}

/**
 * Preenchimento progressivo da narrativa, ADR-2. O texto integral já está
 * no HTML desde o servidor, as spans por palavra nascem em runtime a partir
 * dele e o estado apagado é aplicado só por JavaScript, nunca por CSS.
 * Desktop acende palavra por palavra com ScrollTrigger scrub, mobile acende
 * por interseção simples e movimento reduzido mantém o texto integralmente
 * aceso sem animação. O contexto gsap escopa os tweens no elemento e é
 * revertido no unmount.
 */
export function useTextFill(alvo: Ref<HTMLElement | null>, opcoes: OpcoesUseTextFill) {
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let contexto: ReturnType<typeof gsap.context> | null = null
  let observador: IntersectionObserver | null = null
  let tweenAcender: gsap.core.Tween | null = null

  const desativar = () => {
    observador?.disconnect()
    observador = null
    tweenAcender?.kill()
    tweenAcender = null
    contexto?.revert()
    contexto = null
  }

  const criarPalavras = (el: HTMLElement, texto: string) => {
    const destacadas = indicesDoDestaque(texto, opcoes.destaque?.() ?? '')
    const palavras = dividirEmPalavras(texto)
    el.textContent = ''
    palavras.forEach((palavra, indice) => {
      const span = document.createElement('span')
      span.className =
        destacadas.has(indice)
          ? `${SELETOR_PALAVRA.slice(1)} ${CLASSE_DESTAQUE}`
          : SELETOR_PALAVRA.slice(1)
      span.textContent = palavra.texto
      el.appendChild(span)
      if (indice < palavras.length - 1) {
        el.appendChild(document.createTextNode(' '))
      }
    })
    return el.querySelectorAll<HTMLSpanElement>(SELETOR_PALAVRA)
  }

  const acenderPorIntersecao = (el: HTMLElement, palavras: HTMLSpanElement[]) => {
    const acender = () => {
      tweenAcender = gsap.to(palavras, {
        opacity: 1,
        duration: 0.6,
        stagger: 0.04,
        ease: 'power2.out',
      })
    }

    if (typeof IntersectionObserver === 'undefined') {
      acender()
      return
    }

    observador = new IntersectionObserver((entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) {
        acender()
        observador?.disconnect()
        observador = null
      }
    })
    observador.observe(el)
  }

  const ativar = () => {
    const el = alvo.value
    if (!el || typeof window === 'undefined') return

    const texto = opcoes.texto()

    // Movimento reduzido, texto integralmente aceso, sem spans e sem
    // animação. A troca de idioma continua funcionando.
    if (prefersReducedMotion.value) {
      el.textContent = texto
      return
    }

    const desktop = window.matchMedia(POINTER_FINE_QUERY).matches

    contexto = gsap.context(() => {
      const palavras = criarPalavras(el, texto)
      if (!palavras.length) return

      if (desktop) {
        gsap.fromTo(
          palavras,
          { opacity: OPACIDADE_APAGADA },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'bottom 55%',
              scrub: true,
            },
          },
        )
        return
      }

      gsap.set(palavras, { opacity: OPACIDADE_APAGADA })
      acenderPorIntersecao(el, [...palavras])
    }, el)
  }

  onMounted(ativar)
  watch([() => opcoes.texto(), prefersReducedMotion], ativar)
  onUnmounted(desativar)
}
