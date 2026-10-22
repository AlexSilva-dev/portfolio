import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import type { Component } from 'vue'
import { gsap } from 'gsap'

const { ScrollTriggerMock } = vi.hoisted(() => ({
  ScrollTriggerMock: {
    create: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: ScrollTriggerMock }))

const { setLocaleMock } = vi.hoisted(() => ({ setLocaleMock: vi.fn() }))
vi.mock('../app/composables/useLocale', async () => {
  const { computed, ref } = await import('vue')
  const localeRef = ref<'pt' | 'en'>('pt')
  return {
    useLocale: () => ({
      locale: localeRef,
      dictionary: computed(() => getDictionary(localeRef.value)),
      setLocale: setLocaleMock,
    }),
  }
})

import { getDictionary } from '../app/i18n'
import { useLocale } from '../app/composables/useLocale'
import {
  dividirEmPalavras,
  indicesDoDestaque,
  useTextFill,
} from '../app/composables/useTextFill'
import SectionIntro from '../app/components/SectionIntro.vue'

const TEXTO_PT = getDictionary('pt').sections.about.paragraphs[0]
const TEXTO_EN = getDictionary('en').sections.about.paragraphs[0]

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
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      const lista = new FakeMediaQueryList()
      lista.matches = query.includes('pointer') ? ponteiroFino : movimentoReduzido
      return lista
    }),
  )
}

class IntersectionObserverFake {
  static ultima: IntersectionObserverFake | null = null

  callback: IntersectionObserverCallback
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    IntersectionObserverFake.ultima = this
  }

  dispara(intersectando: boolean) {
    this.callback(
      [{ isIntersecting: intersectando } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
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

function montarSectionIntro(locale: 'pt' | 'en') {
  const { locale: localeRef } = useLocale()
  localeRef.value = locale
  return montarComponente(SectionIntro)
}

function montarHospedeiroUseTextFill(texto: string, destaque?: string) {
  const alvo = ref<HTMLElement | null>(null)
  const raiz = montarComponente(
    defineComponent({
      setup() {
        useTextFill(alvo, { texto: () => texto, destaque: () => destaque })
        return () => h('p', { ref: alvo, 'data-testid': 'alvo' }, texto)
      },
    }),
  )
  return { alvo, raiz }
}

const normalizar = (texto: string | null | undefined) =>
  (texto ?? '').replace(/\s+/g, ' ').trim()

afterEach(() => {
  appsMontados.splice(0).forEach((app) => app.unmount())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  IntersectionObserverFake.ultima = null
  document.body.innerHTML = ''
})

describe('dividirEmPalavras', () => {
  it('divide o texto por espaços e guarda os offsets de cada palavra', () => {
    const palavras = dividirEmPalavras('Fui o primeiro')
    expect(palavras.map((p) => p.texto)).toEqual(['Fui', 'o', 'primeiro'])
    expect(palavras[0]).toMatchObject({ inicio: 0, fim: 3 })
    expect(palavras[2]?.inicio).toBe(6)
  })

  it('não gera palavra vazia com espaço duplo ou nas pontas', () => {
    expect(dividirEmPalavras('a  b')).toHaveLength(2)
    expect(dividirEmPalavras('  Comecei a programar ')).toHaveLength(3)
  })

  it('texto vazio gera lista vazia', () => {
    expect(dividirEmPalavras('')).toEqual([])
  })
})

describe('indicesDoDestaque', () => {
  const TRECHO = 'o primeiro da minha família'

  it('marca os índices das palavras dentro do trecho de destaque', () => {
    const indices = indicesDoDestaque(TEXTO_PT, TRECHO)
    expect([...indices]).toEqual([18, 19, 20, 21, 22])
  })

  it('trecho ausente do texto não marca nada', () => {
    expect(indicesDoDestaque(TEXTO_PT, 'trecho inexistente')).toEqual(new Set())
  })

  it('trecho vazio não marca nada', () => {
    expect(indicesDoDestaque(TEXTO_PT, '')).toEqual(new Set())
  })
})

describe('SectionIntro — conteúdo no HTML', () => {
  it('renderiza o parágrafo 1 do dicionário integral desde o SSR em pt', () => {
    stubMatchMedia(false, true)
    const raiz = montarSectionIntro('pt')
    expect(
      normalizar(raiz.querySelector('[data-testid="intro-texto"]')?.textContent),
    ).toBe(TEXTO_PT)
  })

  it('renderiza o parágrafo 1 integral em en', () => {
    stubMatchMedia(false, true)
    const raiz = montarSectionIntro('en')
    expect(
      normalizar(raiz.querySelector('[data-testid="intro-texto"]')?.textContent),
    ).toBe(TEXTO_EN)
  })

  it('o parágrafo no template é só interpolação, nunca spans escritos à mão', () => {
    const fonte = readFileSync(
      join(import.meta.dirname, '..', 'app', 'components', 'SectionIntro.vue'),
      'utf-8',
    )
    const conteudo = fonte.match(
      /<p[^>]*data-testid="intro-texto"[^>]*>([\s\S]*?)<\/p>/,
    )?.[1]
    expect(conteudo?.trim()).toBe('{{ paragrafo }}')
  })

  it('com reduced motion não existe span de palavra nem animação, texto aceso', () => {
    stubMatchMedia(false, true)
    const fromToSpy = vi.spyOn(gsap, 'fromTo').mockImplementation(() => undefined as never)
    const raiz = montarSectionIntro('pt')
    expect(raiz.querySelectorAll('.intro__palavra')).toHaveLength(0)
    expect(fromToSpy).not.toHaveBeenCalled()
    expect(
      normalizar(raiz.querySelector('[data-testid="intro-texto"]')?.textContent),
    ).toBe(TEXTO_PT)
  })
})

describe('SectionIntro — rótulo editorial e polaroid', () => {
  it('rótulo entre parênteses em mono maiúsculas em pt e en', () => {
    stubMatchMedia(false, true)
    expect(
      montarSectionIntro('pt').querySelector('[data-testid="intro-rotulo"]')
        ?.textContent,
    ).toBe('(TRAJETÓRIA)')
    document.body.innerHTML = ''
    expect(
      montarSectionIntro('en').querySelector('[data-testid="intro-rotulo"]')
        ?.textContent,
    ).toBe('(TRAJECTORY)')
  })

  it('polaroid usa a foto real com alt descritivo', () => {
    stubMatchMedia(false, true)
    const raiz = montarSectionIntro('pt')
    const polaroid = raiz.querySelector('[data-testid="intro-polaroide"]')
    expect(polaroid).not.toBeNull()
    const foto = raiz.querySelector('[data-testid="intro-foto"]') as HTMLImageElement
    expect(foto.getAttribute('src')).toContain('alex-hero')
    expect(foto.getAttribute('width')).toBe('768')
    expect(foto.getAttribute('height')).toBe('960')
    expect(foto.getAttribute('alt')?.length ?? 0).toBeGreaterThan(10)
  })
})

describe('useTextFill no desktop', () => {
  function stubDesktop() {
    stubMatchMedia(true)
    return vi.spyOn(gsap, 'fromTo').mockImplementation(() => undefined as never)
  }

  it('cria uma span por palavra em runtime a partir do texto do HTML', () => {
    const fromToSpy = stubDesktop()
    const { raiz } = montarHospedeiroUseTextFill(TEXTO_PT)

    const spans = [...raiz.querySelectorAll('.intro__palavra')]
    expect(spans).toHaveLength(dividirEmPalavras(TEXTO_PT).length)
    expect(spans.every((span) => (span.textContent ?? '').length > 0)).toBe(true)
    expect(normalizar(raiz.textContent)).toBe(TEXTO_PT)
    expect(fromToSpy).toHaveBeenCalledTimes(1)
  })

  it('a span do trecho de destaque ganha a classe violeta', () => {
    stubDesktop()
    const { raiz } = montarHospedeiroUseTextFill(TEXTO_PT, 'o primeiro da minha família')

    const destacadas = [...raiz.querySelectorAll('.intro__palavra--destaque')]
    expect(destacadas.map((s) => s.textContent)).toEqual([
      'o',
      'primeiro',
      'da',
      'minha',
      'família',
    ])
  })

  it('acende via ScrollTrigger com scrub no elemento do texto', () => {
    const fromToSpy = stubDesktop()
    const { alvo } = montarHospedeiroUseTextFill(TEXTO_PT)

    expect(fromToSpy).toHaveBeenCalledTimes(1)
    const [alvos, , toVars] = fromToSpy.mock.calls[0]
    expect((alvos as NodeList).length).toBe(dividirEmPalavras(TEXTO_PT).length)
    const gatilho = (toVars as Record<string, unknown>).scrollTrigger as Record<
      string,
      unknown
    >
    expect(gatilho.trigger).toBe(alvo.value)
    expect(gatilho.scrub).toBe(true)
  })

  it('o estado apagado sai do tween do JS, e o CSS do componente não esconde o texto', () => {
    const fromToSpy = stubDesktop()
    const { raiz } = montarHospedeiroUseTextFill(TEXTO_PT)

    const [, fromVars, toVars] = fromToSpy.mock.calls[0]
    expect((fromVars as Record<string, unknown>).opacity).toBe(0.15)
    expect((toVars as Record<string, unknown>).opacity).toBe(1)
    const fonte = readFileSync(
      join(import.meta.dirname, '..', 'app', 'composables', 'useTextFill.ts'),
      'utf-8',
    )
    expect(fonte).toMatch(/opacity:\s*OPACIDADE_APAGADA/)
    expect(normalizar(raiz.textContent)).toBe(TEXTO_PT)
  })

  it('reverte o contexto gsap no unmount', () => {
    stubMatchMedia(true)
    const reverter = vi.fn()
    const contextoSpy = vi
      .spyOn(gsap, 'context')
      .mockImplementation(() => ({ revert: reverter }) as never)

    const { app } = (() => {
      const raiz = document.createElement('div')
      document.body.appendChild(raiz)
      const alvo = ref<HTMLElement | null>(null)
      const Hospedeiro = defineComponent({
        setup() {
          useTextFill(alvo, { texto: () => TEXTO_PT })
          return () => h('p', { ref: alvo })
        },
      })
      const instancia = createApp(Hospedeiro)
      appsMontados.push(instancia)
      instancia.mount(raiz)
      return { app: instancia }
    })()

    expect(contextoSpy).toHaveBeenCalledTimes(1)
    expect(reverter).not.toHaveBeenCalled()
    app.unmount()
    expect(reverter).toHaveBeenCalledTimes(1)
  })
})

describe('useTextFill no mobile', () => {
  function stubMobile() {
    stubMatchMedia(false)
    vi.stubGlobal('IntersectionObserver', IntersectionObserverFake)
    return {
      setSpy: vi.spyOn(gsap, 'set').mockImplementation(() => undefined as never),
      toSpy: vi.spyOn(gsap, 'to').mockImplementation(() => undefined as never),
    }
  }

  it('não usa scrub nem ScrollTrigger no mobile', () => {
    const { setSpy, toSpy } = stubMobile()
    montarHospedeiroUseTextFill(TEXTO_PT)

    expect(ScrollTriggerMock.create).not.toHaveBeenCalled()
    expect(setSpy).toHaveBeenCalledTimes(1)
    expect((setSpy.mock.calls[0]?.[1] as Record<string, unknown>).opacity).toBe(0.15)
    expect(toSpy).not.toHaveBeenCalled()
  })

  it('a interseção acende as palavras e desconecta o observador', () => {
    const { toSpy } = stubMobile()
    const { raiz } = montarHospedeiroUseTextFill(TEXTO_PT)

    expect(toSpy).not.toHaveBeenCalled()
    IntersectionObserverFake.ultima?.dispara(false)
    expect(toSpy).not.toHaveBeenCalled()
    IntersectionObserverFake.ultima?.dispara(true)

    expect(toSpy).toHaveBeenCalledTimes(1)
    const [alvos, vars] = toSpy.mock.calls[0]
    expect((alvos as NodeList).length).toBe(dividirEmPalavras(TEXTO_PT).length)
    expect((vars as Record<string, unknown>).opacity).toBe(1)
    expect(IntersectionObserverFake.ultima?.disconnect).toHaveBeenCalledTimes(1)
    expect(raiz.querySelectorAll('.intro__palavra').length).toBeGreaterThan(0)
  })

  it('sem IntersectionObserver disponível acende direto, texto nunca fica apagado', () => {
    stubMatchMedia(false)
    vi.stubGlobal('IntersectionObserver', undefined)
    const toSpy = vi.spyOn(gsap, 'to').mockImplementation(() => undefined as never)
    vi.spyOn(gsap, 'set').mockImplementation(() => undefined as never)

    montarHospedeiroUseTextFill(TEXTO_PT)

    expect(toSpy).toHaveBeenCalledTimes(1)
    expect((toSpy.mock.calls[0]?.[1] as Record<string, unknown>).opacity).toBe(1)
  })

  it('desconecta o observador no unmount mesmo sem interseção', () => {
    stubMobile()
    montarHospedeiroUseTextFill(TEXTO_PT)
    const ultima = IntersectionObserverFake.ultima

    appsMontados.splice(0).forEach((app) => app.unmount())

    expect(ultima?.disconnect).toHaveBeenCalledTimes(1)
  })
})

describe('useTextFill — troca de texto e movimento reduzido', () => {
  it('reconstrói as spans quando o texto muda de idioma', async () => {
    stubMatchMedia(true)
    vi.spyOn(gsap, 'fromTo').mockImplementation(() => undefined as never)

    let fonte = ref('pt')
    const alvo = ref<HTMLElement | null>(null)
    const raiz = montarComponente(
      defineComponent({
        setup() {
          useTextFill(alvo, {
            texto: () =>
              fonte.value === 'pt'
                ? TEXTO_PT
                : TEXTO_EN,
          })
          return () => h('p', { ref: alvo }, 'inicial')
        },
      }),
    )
    await nextTick()

    expect(raiz.querySelectorAll('.intro__palavra')).toHaveLength(
      dividirEmPalavras(TEXTO_PT).length,
    )
    fonte.value = 'en'
    await nextTick()

    const primeira = raiz.querySelector('.intro__palavra')?.textContent
    expect(primeira).toBe('I')
    expect(normalizar(raiz.textContent)).toBe(TEXTO_EN)
  })

  it('com movimento reduzido a troca de texto atualiza o parágrafo aceso sem spans', async () => {
    stubMatchMedia(false, true)

    let fonte = ref('pt')
    const alvo = ref<HTMLElement | null>(null)
    const raiz = montarComponente(
      defineComponent({
        setup() {
          useTextFill(alvo, {
            texto: () => (fonte.value === 'pt' ? TEXTO_PT : TEXTO_EN),
          })
          return () => h('p', { ref: alvo }, 'inicial')
        },
      }),
    )
    await nextTick()

    fonte.value = 'en'
    await nextTick()

    expect(raiz.querySelectorAll('.intro__palavra')).toHaveLength(0)
    expect(normalizar(raiz.textContent)).toBe(TEXTO_EN)
  })
})

