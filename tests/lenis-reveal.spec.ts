import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { gsap } from 'gsap'

const { LenisMock, instanciasLenis } = vi.hoisted(() => {
  const instanciasLenis: Array<{
    opcoes: unknown
    scrollTo: ReturnType<typeof vi.fn>
    destroy: ReturnType<typeof vi.fn>
    on: ReturnType<typeof vi.fn>
    raf: ReturnType<typeof vi.fn>
  }> = []

  class LenisMock {
    opcoes: unknown
    scrollTo = vi.fn()
    destroy = vi.fn()
    on = vi.fn()
    raf = vi.fn()

    constructor(opcoes?: unknown) {
      this.opcoes = opcoes
      instanciasLenis.push(this)
    }
  }

  return { LenisMock, instanciasLenis }
})

vi.mock('lenis', () => ({ default: LenisMock }))

const { ScrollTriggerMock } = vi.hoisted(() => ({
  ScrollTriggerMock: {
    create: vi.fn(),
    update: vi.fn(),
    refresh: vi.fn(),
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: ScrollTriggerMock }))

vi.mock('../app/components/SiteHeader.vue', () => ({
  default: { template: '<header data-testid="site-header-stub" />' },
}))

vi.mock('../app/components/SiteFooter.vue', () => ({
  default: { template: '<footer data-testid="site-footer-stub" />' },
}))

import { useLenis } from '../app/composables/useLenis'
import { useReveal } from '../app/composables/useReveal'
import SectionHeading from '../app/components/SectionHeading.vue'
import LayoutDefault from '../app/layouts/default.vue'
import pluginMotion from '../app/plugins/motion.client'

class FakeMediaQueryList {
  matches = false
  private listeners = new Set<() => void>()

  addEventListener(_type: string, listener: () => void) {
    this.listeners.add(listener)
  }

  removeEventListener(_type: string, listener: () => void) {
    this.listeners.delete(listener)
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

interface Montagem {
  app: ReturnType<typeof createApp>
  raiz: HTMLElement
}

const appsMontados: ReturnType<typeof createApp>[] = []

function montarComComposable(usar: () => void): Montagem {
  const raiz = document.createElement('div')
  document.body.appendChild(raiz)
  const Hospedeiro = defineComponent({
    setup() {
      usar()
      return () => h('section', { 'data-testid': 'alvo' })
    },
  })
  const app = createApp(Hospedeiro)
  appsMontados.push(app)
  app.mount(raiz)
  return { app, raiz }
}

afterEach(() => {
  appsMontados.splice(0).forEach((app) => app.unmount())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  instanciasLenis.length = 0
  document.body.innerHTML = ''
})

describe('useLenis', () => {
  it('cria a instancia com autoRaf desligado e destrói no unmount', () => {
    stubMatchMedia(true)

    const { app } = montarComComposable(() => useLenis())

    expect(instanciasLenis).toHaveLength(1)
    expect(instanciasLenis[0].opcoes).toMatchObject({ autoRaf: false })

    app.unmount()

    expect(instanciasLenis[0].destroy).toHaveBeenCalledTimes(1)
  })

  it('dirige o Lenis pelo gsap.ticker em segundos convertidos pra milissegundos', () => {
    stubMatchMedia(true)
    const adicionarSpy = vi.spyOn(gsap.ticker, 'add')
    const removerSpy = vi.spyOn(gsap.ticker, 'remove')

    const { app } = montarComComposable(() => useLenis())

    expect(adicionarSpy).toHaveBeenCalledTimes(1)
    const aoTick = adicionarSpy.mock.calls[0][0] as (tempo: number) => void

    aoTick(1.5)
    expect(instanciasLenis[0].raf).toHaveBeenCalledWith(1500)

    app.unmount()
    expect(removerSpy).toHaveBeenCalledWith(aoTick)
  })

  it('liga o scroll do Lenis ao ScrollTrigger.update', () => {
    stubMatchMedia(true)

    const { app } = montarComComposable(() => useLenis())

    expect(instanciasLenis[0].on).toHaveBeenCalledWith('scroll', expect.any(Function))
    const aoScroll = instanciasLenis[0].on.mock.calls[0][1] as () => void

    expect(ScrollTriggerMock.update).not.toHaveBeenCalled()
    aoScroll()
    expect(ScrollTriggerMock.update).toHaveBeenCalledTimes(1)

    app.unmount()
  })

  it('clique em âncora chama scrollTo com o alvo do href', () => {
    stubMatchMedia(true)

    montarComComposable(() => useLenis())

    const ancora = document.createElement('a')
    ancora.setAttribute('href', '#experiencia')
    document.body.appendChild(ancora)

    const evento = new MouseEvent('click', { bubbles: true, cancelable: true })
    ancora.dispatchEvent(evento)

    expect(instanciasLenis[0].scrollTo).toHaveBeenCalledWith('#experiencia')
    expect(evento.defaultPrevented).toBe(true)
  })

  it('clique fora de âncora não chama scrollTo', () => {
    stubMatchMedia(true)

    montarComComposable(() => useLenis())

    const botao = document.createElement('button')
    document.body.appendChild(botao)
    botao.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(instanciasLenis[0].scrollTo).not.toHaveBeenCalled()
  })

  it('não cria instancia nem intercepta âncora fora do desktop', () => {
    stubMatchMedia(false)

    montarComComposable(() => useLenis())

    expect(instanciasLenis).toHaveLength(0)

    const ancora = document.createElement('a')
    ancora.setAttribute('href', '#sobre')
    document.body.appendChild(ancora)
    const evento = new MouseEvent('click', { bubbles: true, cancelable: true })
    ancora.dispatchEvent(evento)

    expect(evento.defaultPrevented).toBe(false)
  })

  it('não cria instancia com movimento reduzido declarado', () => {
    stubMatchMedia(true, true)

    montarComComposable(() => useLenis())

    expect(instanciasLenis).toHaveLength(0)
  })
})

describe('plugin motion.client', () => {
  it('registra ScrollTrigger, sobe o Lenis e provê gsap', () => {
    stubMatchMedia(true)
    const registrarSpy = vi.spyOn(gsap, 'registerPlugin')

    const plugin = pluginMotion as unknown as () => { provide: { gsap: typeof gsap } }
    const retorno = plugin()

    expect(retorno.provide.gsap).toBe(gsap)
    expect(registrarSpy).toHaveBeenCalled()
    expect(instanciasLenis).toHaveLength(1)
  })
})

describe('useReveal', () => {
  function montarSecaoComLinhas() {
    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    let secao: HTMLElement | null = null

    const Hospedeiro = defineComponent({
      setup() {
        const alvo = ref<HTMLElement | null>(null)
        useReveal(alvo)
        return () =>
          h('section', { ref: alvo }, [
            h('span', { class: 'reveal-line' }, 'Primeira linha'),
            h('span', { class: 'reveal-line' }, 'Segunda linha'),
          ])
      },
      mounted() {
        secao = (this.$el as HTMLElement)
      },
    })

  const app = createApp(Hospedeiro)
  appsMontados.push(app)
  app.mount(raiz)
  return { app, secao: secao as unknown as HTMLElement }
  }

  it('anima as linhas .reveal-line na primeira entrada da seção', () => {
    stubMatchMedia(true)
    const fromSpy = vi.spyOn(gsap, 'from').mockImplementation(() => undefined as never)

    const { secao } = montarSecaoComLinhas()

    expect(fromSpy).toHaveBeenCalledTimes(1)
    const [alvos, vars] = fromSpy.mock.calls[0]
    expect((alvos as NodeList).length).toBe(2)
    const gatilho = (vars as Record<string, unknown>).scrollTrigger as Record<string, unknown>
    expect(gatilho.trigger).toBe(secao)
    expect(gatilho.once).toBe(true)
  })

  it('mantém o texto no HTML, escondido só por JS', () => {
    stubMatchMedia(true)
    vi.spyOn(gsap, 'from').mockImplementation(() => undefined as never)

    const { secao } = montarSecaoComLinhas()

    expect(secao.textContent).toContain('Primeira linha')
    expect(secao.textContent).toContain('Segunda linha')
  })

  it('reverte o contexto gsap no unmount', () => {
    stubMatchMedia(true)
    vi.spyOn(gsap, 'from').mockImplementation(() => undefined as never)
    const reverter = vi.fn()
    vi.spyOn(gsap, 'context').mockImplementation(() => ({ revert: reverter }) as never)

    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    const Hospedeiro = defineComponent({
      setup() {
        const alvo = ref<HTMLElement | null>(null)
        useReveal(alvo)
        return () => h('section', { ref: alvo })
      },
    })
    const app = createApp(Hospedeiro)
    app.mount(raiz)

    expect(reverter).not.toHaveBeenCalled()
    app.unmount()
    expect(reverter).toHaveBeenCalledTimes(1)
  })

  it('não anima nada com movimento reduzido declarado', () => {
    stubMatchMedia(true, true)
    const fromSpy = vi.spyOn(gsap, 'from').mockImplementation(() => undefined as never)

    montarSecaoComLinhas()

    expect(fromSpy).not.toHaveBeenCalled()
  })

  it('subida sutil das linhas, 10px com fade em vez de slide dramático', () => {
    stubMatchMedia(true)
    const fromSpy = vi.spyOn(gsap, 'from').mockImplementation(() => undefined as never)

    montarSecaoComLinhas()

    const vars = fromSpy.mock.calls[0]?.[1] as Record<string, unknown>
    expect(vars.y).toBe(10)
    expect(vars.opacity).toBe(0)
    expect(vars, 'o slide de linha inteira escondia o efeito do dono').not.toHaveProperty(
      'yPercent',
    )
  })

  it('refresca os gatilhos quando a página termina de carregar e cancela no unmount', () => {
    stubMatchMedia(true)
    vi.spyOn(gsap, 'from').mockImplementation(() => undefined as never)

    const { app } = montarSecaoComLinhas()

    expect(ScrollTriggerMock.refresh).not.toHaveBeenCalled()
    window.dispatchEvent(new Event('load'))
    expect(ScrollTriggerMock.refresh).toHaveBeenCalledTimes(1)

    app.unmount()
    window.dispatchEvent(new Event('load'))
    expect(
      ScrollTriggerMock.refresh,
      'listener de load órfão depois do unmount',
    ).toHaveBeenCalledTimes(1)
  })
})

describe('SectionHeading', () => {
  it('envolve o título em span .reveal-line com o texto no HTML', async () => {
    stubMatchMedia(true)
    vi.spyOn(gsap, 'from').mockImplementation(() => undefined as never)

    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    const app = createApp(SectionHeading, { kicker: 'Com o que eu trabalho', title: 'Tecnologias' })
    appsMontados.push(app)
    app.mount(raiz)
    await nextTick()

    const titulo = raiz.querySelector('[data-testid="section-heading-title"]')
    expect(titulo?.textContent).toBe('Tecnologias')
    const linha = titulo?.querySelector('.reveal-line')
    expect(linha).not.toBeNull()
    expect(linha?.textContent).toBe('Tecnologias')

    app.unmount()
  })
})

describe('layout default', () => {
  it('monta o Preloader dentro de ClientOnly', async () => {
    stubMatchMedia(true)

    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    const app = createApp(LayoutDefault)
    appsMontados.push(app)
    app.component('ClientOnly', { template: '<div data-testid="client-only-stub"><slot /></div>' })
    app.mount(raiz)
    await nextTick()

    const cortina = raiz.querySelector('[data-testid="preloader"]')
    expect(cortina).not.toBeNull()

    app.unmount()
  })
})
