import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { gsap } from 'gsap'

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

import { computeTiltRotation, useTilt, VAR_ELEVACAO_SOMBRA } from '../app/composables/useTilt'
import { useParallax } from '../app/composables/useParallax'
import { useLocale } from '../app/composables/useLocale'
import SectionEvolution from '../app/components/SectionEvolution.vue'

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

/** Devolve a função que liga e desliga o movimento reduzido no meio do teste. */
function stubMatchMedia(ponteiroFino: boolean, movimentoReduzido: boolean) {
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

function montarComComposable(usar: (alvo: Ref<HTMLElement | null>) => void) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const alvo = ref<HTMLElement | null>(null)
  const Hospedeiro = defineComponent({
    setup() {
      usar(alvo)
      return () => h('section', { ref: alvo, 'data-testid': 'alvo' })
    },
  })
  const app = createApp(Hospedeiro)
  appsMontados.push(app)
  app.mount(root)
  return { app, root, alvo }
}

function montarSectionEvolution() {
  const { locale } = useLocale()
  locale.value = 'pt'
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp(SectionEvolution)
  appsMontados.push(app)
  app.mount(root)
  return { app, root }
}

function moverPonteiro(elemento: Element, x: number, y: number) {
  elemento.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y }))
}

function tirarPonteiro(elemento: Element) {
  elemento.dispatchEvent(new MouseEvent('pointerleave'))
}

// retangulo 100x40 em (200, 100) tem centro em (250, 120)
const RECT = { left: 200, top: 100, width: 100, height: 40 }

beforeEach(() => {
  ScrollTriggerMock.create.mockClear()
  ScrollTriggerMock.update.mockClear()
  ScrollTriggerMock.refresh.mockClear()
})

afterEach(() => {
  appsMontados.splice(0).forEach((app) => app.unmount())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('computeTiltRotation', () => {
  it('inclina em direcao ao cursor com o canto mais perto vindo a frente', () => {
    // cursor a direita do centro vira o lado direito pra frente
    expect(computeTiltRotation(290, 120, RECT).rotateY).toBeCloseTo(-6.4)
    expect(computeTiltRotation(290, 120, RECT).rotateX).toBeCloseTo(0)
    // cursor abaixo do centro abaixa a borda de baixo pra frente
    expect(computeTiltRotation(250, 160, RECT).rotateX).toBeCloseTo(8)
  })

  it('limita a inclinacao no maxDeg padrao de 8', () => {
    expect(computeTiltRotation(400, 220, RECT)).toEqual({
      rotateX: 8,
      rotateY: -8,
    })
  })

  it('inclina no sentido oposto quando o cursor fica a esquerda e acima', () => {
    expect(computeTiltRotation(210, 80, RECT).rotateX).toBeCloseTo(-8)
    expect(computeTiltRotation(210, 80, RECT).rotateY).toBeCloseTo(6.4)
  })

  it('respeita maxDeg customizado', () => {
    expect(computeTiltRotation(260, 130, RECT, 10)).toEqual({
      rotateX: 5,
      rotateY: -2,
    })
  })
})

describe('useTilt', () => {
  const opcoes = { duracao: 0, duracaoRetorno: 0 }

  function fixarRetangulo(el: HTMLElement) {
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      ...RECT,
      right: 300,
      bottom: 140,
      x: 200,
      y: 100,
      toJSON: () => RECT,
    } as DOMRect)
  }

  it('inclina a moldura em direcao ao cursor no pointermove simulado', () => {
    stubMatchMedia(true, false)
    const { alvo } = montarComComposable((alvo) => useTilt(alvo, opcoes))
    const el = alvo.value!
    fixarRetangulo(el)

    moverPonteiro(el, 290, 120)

    expect(gsap.getProperty(el, 'rotateX')).toBeCloseTo(0)
    expect(gsap.getProperty(el, 'rotateY')).toBeCloseTo(-6.4)
    // a sombra cresce junto com a inclinacao
    expect(el.style.getPropertyValue(VAR_ELEVACAO_SOMBRA)).toBe('1')
  })

  it('volta reto e com sombra de origem no pointerleave simulado', () => {
    stubMatchMedia(true, false)
    const { alvo } = montarComComposable((alvo) => useTilt(alvo, opcoes))
    const el = alvo.value!
    fixarRetangulo(el)

    moverPonteiro(el, 290, 120)
    tirarPonteiro(el)

    expect(gsap.getProperty(el, 'rotateX')).toBe(0)
    expect(gsap.getProperty(el, 'rotateY')).toBe(0)
    expect(el.style.getPropertyValue(VAR_ELEVACAO_SOMBRA)).toBe('0')
  })

  it('nao inclina nada com movimento reduzido', () => {
    stubMatchMedia(true, true)
    const { alvo } = montarComComposable((alvo) => useTilt(alvo, opcoes))
    const el = alvo.value!

    moverPonteiro(el, 290, 120)

    expect(gsap.getProperty(el, 'rotateY')).toBe(0)
    expect(el.style.getPropertyValue(VAR_ELEVACAO_SOMBRA)).toBe('')
  })

  it('nao inclina nada sem ponteiro fino, fora do desktop', () => {
    stubMatchMedia(false, false)
    const { alvo } = montarComComposable((alvo) => useTilt(alvo, opcoes))
    const el = alvo.value!

    moverPonteiro(el, 290, 120)

    expect(gsap.getProperty(el, 'rotateY')).toBe(0)
    expect(el.style.getPropertyValue(VAR_ELEVACAO_SOMBRA)).toBe('')
  })

  it('desativa tudo quando o movimento reduzido liga depois do mount', async () => {
    const mudarReduzido = stubMatchMedia(true, false)
    const { alvo } = montarComComposable((alvo) => useTilt(alvo, opcoes))
    const el = alvo.value!
    fixarRetangulo(el)
    moverPonteiro(el, 290, 120)
    expect(el.style.getPropertyValue(VAR_ELEVACAO_SOMBRA)).toBe('1')

    mudarReduzido(true)
    await nextTick()
    moverPonteiro(el, 290, 120)

    // o revert do contexto limpa o inline do tween e o ponteiro para de agir
    expect(el.style.getPropertyValue(VAR_ELEVACAO_SOMBRA)).toBe('')
    expect(gsap.getProperty(el, 'rotateY')).toBe(0)
  })

  it('remove os listeners de ponteiro e reverte o contexto no unmount', () => {
    stubMatchMedia(true, false)
    const { app, alvo } = montarComComposable((alvo) =>
      useTilt(alvo, { maxDeg: 8, duracao: 0.5, duracaoRetorno: 0.5 }),
    )
    const el = alvo.value!
    fixarRetangulo(el)
    moverPonteiro(el, 290, 120)
    expect(gsap.getTweensOf(el).length).toBeGreaterThanOrEqual(1)
    const espiao = vi.spyOn(el, 'removeEventListener')

    app.unmount()

    expect(espiao).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(espiao).toHaveBeenCalledWith('pointerleave', expect.any(Function))
    expect(gsap.getTweensOf(el).length).toBe(0)
  })
})

describe('useParallax', () => {
  it('cria tween com scrub leve na travessia da secao na viewport', () => {
    stubMatchMedia(true, false)
    const espiao = vi.spyOn(gsap, 'fromTo')
    const { alvo } = montarComComposable((alvo) => useParallax(alvo))

    expect(espiao).toHaveBeenCalledTimes(1)
    const [, , toVars] = espiao.mock.calls[0]
    const gatilho = (toVars as Record<string, unknown>).scrollTrigger as Record<
      string,
      unknown
    >
    expect(gatilho.trigger).toBe(alvo.value)
    expect(gatilho.start).toBe('top bottom')
    expect(gatilho.end).toBe('bottom top')
    expect(gatilho.scrub).toBe(0.6)
  })

  it('sobe e gira alguns graus ao longo da travessia', () => {
    stubMatchMedia(true, false)
    const espiao = vi.spyOn(gsap, 'fromTo')
    montarComComposable((alvo) => useParallax(alvo))

    const [fromVars, toVars] = espiao.mock.calls[0].slice(1) as [
      Record<string, unknown>,
      Record<string, unknown>,
    ]
    // entra mais baixa e mais deitada que a rotacao fixa de -6deg
    expect(fromVars.y).toBe(32)
    expect(fromVars.rotation).toBe(-9)
    // sai mais alta e mais reta
    expect(toVars.y).toBe(-32)
    expect(toVars.rotation).toBe(-3)
    expect(toVars.ease).toBe('none')
  })

  it('nao cria tween nenhum com movimento reduzido', () => {
    stubMatchMedia(true, true)
    const espiao = vi.spyOn(gsap, 'fromTo')
    montarComComposable((alvo) => useParallax(alvo))

    expect(espiao).not.toHaveBeenCalled()
    expect(ScrollTriggerMock.create).not.toHaveBeenCalled()
  })

  it('desativa quando o movimento reduzido liga e volta quando desliga', async () => {
    const mudarReduzido = stubMatchMedia(true, false)
    const espiao = vi.spyOn(gsap, 'fromTo')
    const { alvo } = montarComComposable((alvo) => useParallax(alvo))
    const el = alvo.value!
    expect(gsap.getTweensOf(el).length).toBeGreaterThanOrEqual(1)

    mudarReduzido(true)
    await nextTick()
    expect(gsap.getTweensOf(el).length).toBe(0)

    mudarReduzido(false)
    await nextTick()
    expect(espiao).toHaveBeenCalledTimes(2)
    expect(gsap.getTweensOf(el).length).toBeGreaterThanOrEqual(1)
  })

  it('reverte o contexto no unmount, sem tween orfao', () => {
    stubMatchMedia(true, false)
    const { app, alvo } = montarComComposable((alvo) => useParallax(alvo))
    const el = alvo.value!
    expect(gsap.getTweensOf(el).length).toBeGreaterThanOrEqual(1)

    app.unmount()

    expect(gsap.getTweensOf(el).length).toBe(0)
  })

  it('quando a pagina termina de carregar refresca os gatilhos', () => {
    stubMatchMedia(true, false)
    montarComComposable((alvo) => useParallax(alvo))

    expect(ScrollTriggerMock.refresh).not.toHaveBeenCalled()
    window.dispatchEvent(new Event('load'))
    expect(ScrollTriggerMock.refresh).toHaveBeenCalledTimes(1)
  })

  it('o refresh agendado morre no unmount, sem listener orfao', () => {
    stubMatchMedia(true, false)
    const { app } = montarComComposable((alvo) => useParallax(alvo))

    app.unmount()
    window.dispatchEvent(new Event('load'))

    expect(ScrollTriggerMock.refresh).not.toHaveBeenCalled()
  })
})

describe('SectionEvolution', () => {
  it('a polaroid usa a ilustração vetorial em vez do gif', () => {
    stubMatchMedia(true, false)
    const { root } = montarSectionEvolution()

    const svg = root.querySelector('[data-testid="evolution-ilustracao"]')
    expect(svg?.tagName.toLowerCase()).toBe('svg')
    expect(root.querySelector('[data-testid="evolution-gif"]')).toBeNull()
  })

  it('a ilustração anima o caminho e o nó quando o movimento é permitido', () => {
    const fonte = readFileSync(
      join(import.meta.dirname, '..', 'app', 'components', 'EvolutionIllustration.vue'),
      'utf-8',
    )
    expect(fonte).toMatch(/@keyframes evolucao-caminho-correr/)
    expect(fonte).toMatch(/@keyframes evolucao-no-pulsar/)
    expect(fonte).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation:\s*none/)
  })

  it('polaroid fica sob parallax de scroll e tilt de ponteiro', () => {
    stubMatchMedia(true, false)
    const espiaoFromTo = vi.spyOn(gsap, 'fromTo')
    const espiaoTo = vi.spyOn(gsap, 'to')
    const { root } = montarSectionEvolution()
    const figura = root.querySelector<HTMLElement>('[data-testid="evolution-polaroide"]')!

    expect(espiaoFromTo).toHaveBeenCalledTimes(1)
    const gatilho = (espiaoFromTo.mock.calls[0][2] as Record<string, unknown>)
      .scrollTrigger as Record<string, unknown>
    expect(gatilho.trigger).toBe(figura)

    moverPonteiro(figura, 290, 120)
    const variaveisTilt = espiaoTo.mock.calls.at(-1)?.[1] as Record<string, unknown>
    expect(espiaoTo.mock.calls.at(-1)?.[0]).toBe(figura)
    expect(typeof variaveisTilt.rotateY).toBe('number')
    expect(variaveisTilt[VAR_ELEVACAO_SOMBRA]).toBe(1)
  })

  it('com movimento reduzido a polaroid fica estatica na rotacao fixa original', () => {
    stubMatchMedia(true, true)
    const espiao = vi.spyOn(gsap, 'fromTo')
    const { root } = montarSectionEvolution()
    const figura = root.querySelector<HTMLElement>('[data-testid="evolution-polaroide"]')!

    expect(espiao).not.toHaveBeenCalled()
    // nenhum tween ou estilo inline de movimento na moldura
    expect(gsap.getTweensOf(figura).length).toBe(0)
    expect(figura.style.transform).toBe('')
    moverPonteiro(figura, 290, 120)
    expect(gsap.getProperty(figura, 'rotateY')).toBe(0)
  })
})
