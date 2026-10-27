import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { gsap } from 'gsap'
import type { Component } from 'vue'

const { ScrollTriggerMock } = vi.hoisted(() => ({
  ScrollTriggerMock: {
    create: vi.fn(),
    update: vi.fn(),
    refresh: vi.fn(),
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: ScrollTriggerMock }))

vi.mock('../app/composables/useLocale', async () => {
  const { computed, ref } = await import('vue')
  const { getDictionary } = await import('../app/i18n')
  const localeRef = ref<'pt' | 'en'>('pt')
  return {
    useLocale: () => ({
      locale: localeRef,
      dictionary: computed(() => getDictionary(localeRef.value)),
    }),
  }
})

import { getDictionary } from '../app/i18n'
import {
  acendeNoRaio,
  centroDoRect,
  distancia,
  OPACIDADE_DIM,
  RAIO_PADRAO_PX,
  useCursorLit,
} from '../app/composables/useCursorLit'
import { dividirEmPalavras } from '../app/composables/useTextFill'
import { useLocale } from '../app/composables/useLocale'
import SectionEvolution from '../app/components/SectionEvolution.vue'

const TEXTO_PT = getDictionary('pt').sections.about.paragraphs[1]
const TEXTO_EN = getDictionary('en').sections.about.paragraphs[1]
const TRECHO_DESTAQUE_PT = 'nadar contra a maré'

const normalizar = (texto: string | null | undefined) =>
  (texto ?? '').replace(/\s+/g, ' ').trim()

class FakeMediaQueryList {
  matches = false
  private listeners = new Set<() => void>()

  addEventListener(_type: string, listener: () => void) {
    this.listeners.add(listener)
  }

  removeEventListener(_type: string, listener: () => void) {
    this.listeners.delete(listener)
  }

  set(value: boolean) {
    this.matches = value
    this.listeners.forEach((listener) => listener())
  }
}

function stubMatchMedia(ponteiroFino: boolean, movimentoReduzido = false) {
  const porQuery = new Map<string, FakeMediaQueryList>()
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      const lista = new FakeMediaQueryList()
      lista.matches = query.includes('pointer') ? ponteiroFino : movimentoReduzido
      porQuery.set(query, lista)
      return lista
    }),
  )
  return (valor: boolean) =>
    porQuery.get('(prefers-reduced-motion: reduce)')?.set(valor)
}

const appsMontados: ReturnType<typeof createApp>[] = []

function montarComponente(componente: Component) {
  const raiz = document.createElement('div')
  document.body.appendChild(raiz)
  const app = createApp(componente)
  appsMontados.push(app)
  app.mount(raiz)
  return raiz
}

function montarHospedeiro(opcoes: {
  texto: () => string
  destaque?: () => string
  raio?: number
}) {
  const alvo = ref<HTMLElement | null>(null)
  const raiz = montarComponente(
    defineComponent({
      setup() {
        useCursorLit(alvo, opcoes)
        return () => h('p', { ref: alvo, 'data-testid': 'alvo' }, 'inicial')
      },
    }),
  )
  return { alvo, raiz }
}

function montarSectionEvolution() {
  const { locale } = useLocale()
  locale.value = 'pt'
  return montarComponente(SectionEvolution)
}

function moverPonteiro(elemento: Element, x: number, y: number) {
  elemento.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y }))
}

/** retangulo 100x40 com centro em (250, 120) */
function fixarRect(el: Element, left = 200, top = 100, width = 100, height = 40) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({ left, top, width, height }),
  } as DOMRect)
}

afterEach(() => {
  appsMontados.splice(0).forEach((app) => app.unmount())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('geometria do acendimento', () => {
  it('mede a distancia euclidiana entre o cursor e o centro da palavra', () => {
    expect(distancia({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
    expect(distancia({ x: 250, y: 120 }, { x: 250, y: 120 })).toBe(0)
  })

  it('o centro do retangulo da palavra e o ponto medio', () => {
    expect(centroDoRect({ left: 200, top: 100, width: 100, height: 40 })).toEqual({
      x: 250,
      y: 120,
    })
  })

  it('acende quando o cursor entra no raio de proximidade', () => {
    const centro = { x: 250, y: 120 }
    expect(acendeNoRaio({ x: 260, y: 130 }, centro, RAIO_PADRAO_PX)).toBe(true)
  })

  it('nao acende fora do raio, que e configuravel', () => {
    const centro = { x: 250, y: 120 }
    // 150px de distancia
    expect(acendeNoRaio({ x: 400, y: 120 }, centro, RAIO_PADRAO_PX)).toBe(false)
    // mesmo ponto com raio maior acende
    expect(acendeNoRaio({ x: 400, y: 120 }, centro, 200)).toBe(true)
  })

  it('acende na borda exata do raio', () => {
    // exatamente 110px de distancia
    expect(acendeNoRaio({ x: 360, y: 120 }, { x: 250, y: 120 }, 110)).toBe(true)
  })
})

describe('useCursorLit', () => {
  it('cria uma span por palavra em runtime a partir do texto do HTML', () => {
    stubMatchMedia(true)
    const { raiz } = montarHospedeiro({ texto: () => TEXTO_PT })
    const spans = [...raiz.querySelectorAll('.evolucao__palavra')]
    expect(spans).toHaveLength(dividirEmPalavras(TEXTO_PT).length)
    expect(spans.every((span) => (span.textContent ?? '').length > 0)).toBe(true)
    expect(normalizar(raiz.textContent)).toBe(TEXTO_PT)
  })

  it('nasce dim mas legivel, tinta entre 35 e 40 por cento', () => {
    stubMatchMedia(true)
    expect(OPACIDADE_DIM).toBeGreaterThanOrEqual(0.35)
    expect(OPACIDADE_DIM).toBeLessThanOrEqual(0.4)
    const { raiz } = montarHospedeiro({ texto: () => TEXTO_PT })
    const spans = [...raiz.querySelectorAll<HTMLElement>('.evolucao__palavra')]
    expect(spans.length).toBeGreaterThan(0)
    for (const span of spans) {
      expect(span.style.opacity).toBe(String(OPACIDADE_DIM))
    }
  })

  it('acende a palavra quando o cursor chega perto, com raio de proximidade', () => {
    stubMatchMedia(true)
    const { raiz } = montarHospedeiro({ texto: () => TEXTO_PT })
    const spans = [...raiz.querySelectorAll<HTMLElement>('.evolucao__palavra')]
    fixarRect(spans[0]!)
    // longe demais: a 400px do centro (250, 120), fora do raio padrao
    moverPonteiro(raiz.querySelector('[data-testid="alvo"]')!, 650, 120)
    expect(spans[0]!.style.opacity).toBe(String(OPACIDADE_DIM))

    // dentro do raio: a 10px do centro
    moverPonteiro(raiz.querySelector('[data-testid="alvo"]')!, 260, 130)
    expect(spans[0]!.style.opacity).toBe('1')
  })

  it('palavra acesa permanece acesa quando o cursor sai', () => {
    stubMatchMedia(true)
    const { raiz } = montarHospedeiro({ texto: () => TEXTO_PT })
    const spans = [...raiz.querySelectorAll<HTMLElement>('.evolucao__palavra')]
    fixarRect(spans[0]!)
    moverPonteiro(raiz.querySelector('[data-testid="alvo"]')!, 260, 130)
    expect(spans[0]!.style.opacity).toBe('1')

    // cursor vai embora para longe de tudo
    moverPonteiro(raiz.querySelector('[data-testid="alvo"]')!, 900, 900)
    expect(spans[0]!.style.opacity).toBe('1')
  })

  it('o trecho de destaque ganha a classe violeta e acende como as demais', () => {
    stubMatchMedia(true)
    const { raiz } = montarHospedeiro({
      texto: () => TEXTO_PT,
      destaque: () => TRECHO_DESTAQUE_PT,
    })
    const destacadas = [...raiz.querySelectorAll('.evolucao__palavra--destaque')]
    // o ponto final gruda no último token, igual ao texto real do HTML
    expect(destacadas.map((s) => s.textContent)).toEqual([
      'nadar',
      'contra',
      'a',
      'maré.',
    ])
    // cor só via token, no CSS do componente, nunca inline
    expect(destacadas[0]!.getAttribute('style')?.includes('#')).toBeFalsy()
  })

  it('com movimento reduzido o texto fica integralmente aceso e estatico', () => {
    stubMatchMedia(true, true)
    const { raiz } = montarHospedeiro({ texto: () => TEXTO_PT })
    expect(raiz.querySelectorAll('.evolucao__palavra')).toHaveLength(0)
    expect(normalizar(raiz.textContent)).toBe(TEXTO_PT)
    moverPonteiro(raiz.querySelector('[data-testid="alvo"]')!, 260, 130)
    expect(normalizar(raiz.textContent)).toBe(TEXTO_PT)
  })

  it('sem ponteiro fino, touch, o texto acende por scroll com scrub', () => {
    stubMatchMedia(false)
    const espiao = vi.spyOn(gsap, 'fromTo')
    const { raiz } = montarHospedeiro({ texto: () => TEXTO_PT })

    const spans = [...raiz.querySelectorAll<HTMLElement>('.evolucao__palavra')]
    expect(spans).toHaveLength(dividirEmPalavras(TEXTO_PT).length)
    expect(spans.every((span) => span.style.opacity === String(OPACIDADE_DIM))).toBe(true)
    expect(normalizar(raiz.textContent)).toBe(TEXTO_PT)

    expect(espiao).toHaveBeenCalled()
    const variaveis = espiao.mock.calls.at(-1)?.[2] as Record<string, unknown>
    const gatilho = variaveis.scrollTrigger as Record<string, unknown>
    expect(gatilho.trigger).toBe(raiz.querySelector('[data-testid="alvo"]'))
    expect(gatilho.scrub).toBe(true)
  })

  it('movimento reduzido ligado depois do mount restaura o texto aceso', async () => {
    const mudarReduzido = stubMatchMedia(true, false)
    const { raiz } = montarHospedeiro({ texto: () => TEXTO_PT })
    expect(raiz.querySelectorAll('.evolucao__palavra').length).toBeGreaterThan(0)

    mudarReduzido(true)
    await nextTick()

    expect(raiz.querySelectorAll('.evolucao__palavra')).toHaveLength(0)
    expect(normalizar(raiz.textContent)).toBe(TEXTO_PT)
  })

  it('reconstrói as spans quando o texto muda de idioma', async () => {
    stubMatchMedia(true)
    const idioma = ref<'pt' | 'en'>('pt')
    const { raiz } = montarHospedeiro({
      texto: () => (idioma.value === 'pt' ? TEXTO_PT : TEXTO_EN),
    })
    expect(normalizar(raiz.textContent)).toBe(TEXTO_PT)

    idioma.value = 'en'
    await nextTick()

    expect(normalizar(raiz.textContent)).toBe(TEXTO_EN)
    expect(raiz.querySelectorAll('.evolucao__palavra')).toHaveLength(
      dividirEmPalavras(TEXTO_EN).length,
    )
  })

  it('remove o listener de ponteiro no unmount', () => {
    stubMatchMedia(true)
    const idioma = ref('pt')
    const alvo = ref<HTMLElement | null>(null)
    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    const app = createApp(
      defineComponent({
        setup() {
          useCursorLit(alvo, { texto: () => TEXTO_PT })
          return () => h('p', { ref: alvo }, 'inicial')
        },
      }),
    )
    app.mount(raiz)
    const el = alvo.value!
    expect(el.style.opacity).toBe('')
    const espiao = vi.spyOn(el, 'removeEventListener')

    app.unmount()

    expect(espiao).toHaveBeenCalledWith('pointermove', expect.any(Function))
    // ponteiro depois do unmount não pode pegar listener órfão
    expect(() => moverPonteiro(el, 260, 130)).not.toThrow()
    idioma.value = 'en'
  })
})

describe('SectionEvolution — acendimento por cursor', () => {
  it('o parágrafo da evolução nasce dim e cria as spans em runtime', () => {
    stubMatchMedia(true)
    const raiz = montarSectionEvolution()
    const paragrafo = raiz.querySelector<HTMLElement>('[data-testid="evolution-texto"]')!
    const spans = [...paragrafo.querySelectorAll<HTMLElement>('.evolucao__palavra')]
    expect(spans).toHaveLength(dividirEmPalavras(TEXTO_PT).length)
    expect(spans[0]!.style.opacity).toBe(String(OPACIDADE_DIM))
    expect(normalizar(paragrafo.textContent)).toBe(TEXTO_PT)
  })

  it('o trecho nadando contra a maré fica com a classe violeta', () => {
    stubMatchMedia(true)
    const raiz = montarSectionEvolution()
    const destacadas = [
      ...raiz.querySelectorAll('.evolucao__palavra--destaque'),
    ]
    expect(destacadas.map((s) => s.textContent)).toEqual([
      'nadar',
      'contra',
      'a',
      'maré.',
    ])
  })

  it('o parágrafo no template é só interpolação, nunca spans escritos à mão', () => {
    const fonte = readFileSync(
      join(import.meta.dirname, '..', 'app', 'components', 'SectionEvolution.vue'),
      'utf-8',
    )
    const conteudo = fonte.match(
      /<p[^>]*data-testid="evolution-texto"[^>]*>([\s\S]*?)<\/p>/,
    )?.[1]
    expect(conteudo?.trim()).toBe('{{ paragrafo }}')
    expect(conteudo).not.toContain('span')
  })
})
