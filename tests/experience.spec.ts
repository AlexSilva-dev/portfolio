import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, ref, type App } from 'vue'
import { gsap } from 'gsap'
import { pt, en, type ExperienceItem } from '../app/i18n/sections/experience'
import SectionHeading from '../app/components/SectionHeading.vue'
import ExperienceCard from '../app/components/ExperienceCard.vue'
import { useStagger } from '../app/composables/useStagger'

const { ScrollTriggerMock } = vi.hoisted(() => ({
  ScrollTriggerMock: {
    create: vi.fn(),
    update: vi.fn(),
    refresh: vi.fn(),
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: ScrollTriggerMock }))

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

function stubMatchMedia(movimentoReduzido = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      const lista = new FakeMediaQueryList()
      lista.matches = query.includes('reduced-motion') ? movimentoReduzido : false
      return lista
    }),
  )
}

/** Stub encadeável da timeline pra observar os grupos animados sem rodar gsap real. */
function espiarTimeline() {
  const tl = { from: vi.fn() }
  const spy = vi.spyOn(gsap, 'timeline').mockReturnValue(tl as never)
  return { tl, spy }
}

function lerFonteCard() {
  return readFileSync(join(process.cwd(), 'app/components/ExperienceCard.vue'), 'utf-8')
}

const ORDEM_ESPERADA = ['AdSalesBrazil', 'Ajax Hub', 'Tedsys']

describe('dicionário experience', () => {
  it('lista os cargos do mais recente pro mais antigo em pt e en', () => {
    expect(pt.items.map((i) => i.company)).toEqual(ORDEM_ESPERADA)
    expect(en.items.map((i) => i.company)).toEqual(ORDEM_ESPERADA)
  })

  it('traz heading e kicker preenchidos em pt e en', () => {
    expect(pt.heading.length).toBeGreaterThan(0)
    expect(pt.kicker.length).toBeGreaterThan(0)
    expect(en.heading.length).toBeGreaterThan(0)
    expect(en.kicker.length).toBeGreaterThan(0)
  })

  for (const [locale, dict] of [['pt', pt], ['en', en]] as const) {
    it(`cada cargo de ${locale} tem empresa, papel, período e no mínimo 2 conquistas`, () => {
      expect(dict.items).toHaveLength(3)
      for (const item of dict.items) {
        expect(item.company.length).toBeGreaterThan(0)
        expect(item.role.length).toBeGreaterThan(0)
        expect(item.period.length).toBeGreaterThan(0)
        expect(item.achievements.length).toBeGreaterThanOrEqual(2)
        expect(item.chips.length).toBeGreaterThan(0)
      }
    })
  }

  it('marca AdSalesBrazil como cargo em aberto e os demais como fechados', () => {
    const abertos = pt.items.filter((i) => i.current).map((i) => i.company)
    expect(abertos).toEqual(['AdSalesBrazil'])
    const abertosEn = en.items.filter((i) => i.current).map((i) => i.company)
    expect(abertosEn).toEqual(['AdSalesBrazil'])
  })

  it('período do cargo em aberto indica "hoje"', () => {
    const ads = pt.items[0]
    expect(ads.period).toMatch(/hoje/)
  })

  it('conquista da Tedsys cita a redução de 18% pra 7,5% com R$ 15 mil mensais', () => {
    const tedsys = pt.items.find((i) => i.company === 'Tedsys') as ExperienceItem
    const metrica = tedsys.achievements.find((a) => a.includes('18%'))
    expect(metrica).toBeDefined()
    expect(metrica).toMatch(/7,5%/)
    expect(metrica).toMatch(/R\$\s*15\s*mil/)
  })

  it('mantém a moeda em real na tradução en da métrica da Tedsys', () => {
    const tedsys = en.items.find((i) => i.company === 'Tedsys') as ExperienceItem
    const metrica = tedsys.achievements.find((a) => a.includes('18'))
    expect(metrica).toBeDefined()
    expect(metrica).toMatch(/7\.5/)
    expect(metrica).toMatch(/R\$\s*15\s*mil/)
  })

  it('contagem fixa de conquistas por cargo, 5 na AdSalesBrazil, 4 na Ajax Hub e 5 na Tedsys, em pt e en', () => {
    expect(pt.items.map((i) => i.achievements.length)).toEqual([5, 4, 5])
    expect(en.items.map((i) => i.achievements.length)).toEqual([5, 4, 5])
  })

  it('AdSalesBrazil cobre arquitetura com Dokploy, homologação oficial da Meta, MCP de IA, full stack e rastreamento', () => {
    const ads = pt.items[0]
    const texto = ads.achievements.join(' ')
    expect(texto).toMatch(/Dokploy/)
    expect(texto).toMatch(/alta disponibilidade/)
    expect(texto).toMatch(/custo baixo/)
    expect(texto).toMatch(/homologação oficial da Meta/)
    expect(texto).toMatch(/Instagram/)
    expect(texto).toMatch(/WhatsApp Business/)
    expect(texto).toMatch(/Meta Ads/)
    expect(texto).toMatch(/MCP/)
    expect(texto).toMatch(/IA agente/)
    expect(texto).toMatch(/Nuxt/)
    expect(texto).toMatch(/Rails/)
    expect(texto).toMatch(/Meta Pixel/)
    expect(texto).toMatch(/Core Web Vitals/)
    expect(texto).toMatch(/agentes próprios/)
    expect(ads.chips).toEqual(['Docker', 'Dokploy', 'Nuxt', 'Rails', 'Meta API', 'MCP', 'IA aplicada', 'GTM'])
  })

  it('Ajax Hub cobre separação em serviços, CI/CD com Easypanel, fluxos ágeis e 3 clientes pagantes', () => {
    const ajax = pt.items[1]
    const texto = ajax.achievements.join(' ')
    expect(texto).toMatch(/serviços independentes/)
    expect(texto).toMatch(/frontend/)
    expect(texto).toMatch(/painel/)
    expect(texto).toMatch(/GitHub Actions/)
    expect(texto).toMatch(/Easypanel/)
    expect(texto).toMatch(/isolamento de ambientes/)
    expect(texto).toMatch(/previsibilidade/)
    expect(texto).toMatch(/três clientes pagantes/)
    expect(ajax.chips).toEqual(['GitHub Actions', 'Easypanel', 'Docker', 'CI/CD', 'arquitetura em serviços'])
  })

  it('Tedsys cobre inadimplência com horas liberadas, n8n com RAG e OCR, ERP Laminas Firebird, Bitrix e Jira e AWS', () => {
    const tedsys = pt.items[2]
    const texto = tedsys.achievements.join(' ')
    expect(texto).toMatch(/5 a 6 horas/)
    expect(texto).toMatch(/n8n/)
    expect(texto).toMatch(/RAG/)
    expect(texto).toMatch(/OCR/)
    expect(texto).toMatch(/Laminas/)
    expect(texto).toMatch(/APIs REST/)
    expect(texto).toMatch(/Firebird/)
    expect(texto).toMatch(/Vue 3/)
    expect(texto).toMatch(/Bitrix/)
    expect(texto).toMatch(/Jira/)
    expect(texto).toMatch(/AWS/)
    expect(texto).toMatch(/EC2/)
    expect(texto).toMatch(/Route 53/)
    expect(tedsys.chips).toEqual(['PHP', 'Laminas', 'Vue 3', 'Firebird', 'n8n', 'RAG', 'OCR', 'Bitrix', 'Jira', 'AWS'])
  })

  it('en espelha a riqueza com os chips traduzidos por cargo', () => {
    expect(en.items[0].chips).toEqual(['Docker', 'Dokploy', 'Nuxt', 'Rails', 'Meta API', 'MCP', 'Applied AI', 'GTM'])
    expect(en.items[1].chips).toEqual(['GitHub Actions', 'Easypanel', 'Docker', 'CI/CD', 'service architecture'])
    expect(en.items[2].chips).toEqual(['PHP', 'Laminas', 'Vue 3', 'Firebird', 'n8n', 'RAG', 'OCR', 'Bitrix', 'Jira', 'AWS'])
  })

  it('nenhuma conquista usa dois-pontos, ponto e vírgula ou sinal de mais', () => {
    for (const item of [...pt.items, ...en.items]) {
      for (const conquista of item.achievements) {
        expect(conquista).not.toMatch(/[:;+]/)
        expect(conquista.trim()).toBe(conquista)
      }
    }
  })
})

describe('SectionHeading', () => {
  function montar(props: { kicker: string, title: string, tema?: 'papel' | 'escuro' }) {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(SectionHeading, props)
    app.mount(root)
    return { root, app }
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renderiza o kicker em elemento mono e o título em h2', () => {
    const { root, app } = montar({ kicker: 'Onde eu já entreguei resultado', title: 'Experiência' })
    const kicker = root.querySelector('[data-testid="section-heading-kicker"]')
    const title = root.querySelector('[data-testid="section-heading-title"]')
    expect(kicker?.textContent).toBe('Onde eu já entreguei resultado')
    expect(kicker?.tagName).toBe('P')
    expect(kicker?.classList.contains('section-heading__kicker')).toBe(true)
    expect(title?.textContent).toBe('Experiência')
    expect(title?.tagName).toBe('H2')
    app.unmount()
  })
  it('área papel é o padrão e o tema escuro aplica a classe modificadora', () => {
    const papel = montar({ kicker: 'Onde eu já entreguei resultado', title: 'Experiência' })
    expect(papel.root.querySelector('.section-heading')?.classList.contains('section-heading--escuro')).toBe(false)
    papel.app.unmount()

    const escuro = montar({ kicker: 'Onde eu já entreguei resultado', title: 'Experiência', tema: 'escuro' })
    expect(escuro.root.querySelector('.section-heading')?.classList.contains('section-heading--escuro')).toBe(true)
    escuro.app.unmount()
  })
})

describe('ExperienceCard', () => {
  function montar(item: ExperienceItem) {
    stubMatchMedia()
    espiarTimeline()
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(ExperienceCard, { item })
    app.mount(root)
    return { root, app }
  }

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renderiza empresa, papel, período, conquistas e chips', () => {
    const { root, app } = montar(pt.items[2])
    expect(root.querySelector('[data-testid="experience-card-company"]')?.textContent).toBe('Tedsys')
    expect(root.querySelector('[data-testid="experience-card-role"]')?.textContent).toBe(pt.items[2].role)
    expect(root.querySelector('[data-testid="experience-card-period"]')?.textContent).toContain('2023')
    const conquistas = root.querySelectorAll('[data-testid="experience-card-achievement"]')
    expect(conquistas).toHaveLength(pt.items[2].achievements.length)
    const chips = root.querySelectorAll('[data-testid="experience-card-chip"]')
    expect(chips).toHaveLength(pt.items[2].chips.length)
    app.unmount()
  })

  it('cargo em aberto mostra dot e período, nunca só cor', () => {
    const { root, app } = montar(pt.items[0])
    const dot = root.querySelector('[data-testid="experience-card-dot"]')
    expect(dot).not.toBeNull()
    const periodo = root.querySelector('[data-testid="experience-card-period"]')
    expect(periodo?.textContent).toMatch(/hoje/)
    app.unmount()
  })

  it('cargo fechado não mostra dot', () => {
    const { root, app } = montar(pt.items[1])
    expect(root.querySelector('[data-testid="experience-card-dot"]')).toBeNull()
    app.unmount()
  })
})

describe('useStagger', () => {
  function montarHospedeiro(bullets = 3, chips = 2, movimentoReduzido = false) {
    stubMatchMedia(movimentoReduzido)
    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    const Hospedeiro = defineComponent({
      setup() {
        const alvo = ref<HTMLElement | null>(null)
        useStagger(alvo, { seletorBullets: '.bullet', seletorChips: '.chip' })
        return () =>
          h('article', { ref: alvo }, [
            ...Array.from({ length: bullets }, (_, i) => h('li', { class: 'bullet' }, `b${i}`)),
            ...Array.from({ length: chips }, (_, i) => h('li', { class: 'chip' }, `c${i}`)),
          ])
      },
    })
    const app = createApp(Hospedeiro)
    app.mount(raiz)
    const card = raiz.querySelector('article') as HTMLElement
    return { app, card }
  }

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('cria um timeline com gatilho no próprio card na primeira entrada no viewport', () => {
    const { spy } = espiarTimeline()

    const { card, app } = montarHospedeiro()

    expect(spy).toHaveBeenCalledTimes(1)
    const vars = spy.mock.calls[0][0] as Record<string, unknown>
    const gatilho = vars.scrollTrigger as Record<string, unknown>
    expect(gatilho.trigger).toBe(card)
    expect(gatilho.start).toBe('top 80%')
    expect(gatilho.once).toBe(true)
    app.unmount()
  })

  it('anima o card com subida de 40px e fade, bullets em stagger 0.06 e chips depois dos bullets', () => {
    const { tl } = espiarTimeline()

    const { app } = montarHospedeiro()

    expect(tl.from).toHaveBeenCalledTimes(3)

    const [alvoCard, varsCard] = tl.from.mock.calls[0]
    expect(alvoCard).toBeInstanceOf(HTMLElement)
    expect((varsCard as Record<string, unknown>).y).toBe(40)
    expect((varsCard as Record<string, unknown>).opacity).toBe(0)

    const [alvosBullets, varsBullets] = tl.from.mock.calls[1]
    expect((alvosBullets as NodeList).length).toBe(3)
    expect((varsBullets as Record<string, unknown>).stagger).toBe(0.06)
    const posicaoBullets = tl.from.mock.calls[1][2] as number

    const [alvosChips, varsChips] = tl.from.mock.calls[2]
    expect((alvosChips as NodeList).length).toBe(2)
    expect((varsChips as Record<string, unknown>).stagger).toBe(0.06)
    const posicaoChips = tl.from.mock.calls[2][2] as number

    expect(posicaoChips, 'chips entram depois dos bullets').toBeGreaterThan(posicaoBullets)
    app.unmount()
  })

  it('reverte o contexto gsap no unmount', () => {
    espiarTimeline()
    const reverter = vi.fn()
    vi.spyOn(gsap, 'context').mockImplementation(() => ({ revert: reverter }) as never)

    const { app } = montarHospedeiro()

    expect(reverter).not.toHaveBeenCalled()
    app.unmount()
    expect(reverter).toHaveBeenCalledTimes(1)
  })

  it('não cria animação nenhuma com movimento reduzido declarado', () => {
    const { spy } = espiarTimeline()

    montarHospedeiro(3, 2, true)

    expect(spy).not.toHaveBeenCalled()
  })

  it('card sem bullets nem chips anima só a entrada do card', () => {
    const { tl } = espiarTimeline()

    const { app } = montarHospedeiro(0, 0)

    expect(tl.from).toHaveBeenCalledTimes(1)
    app.unmount()
  })
})

describe('ExperienceCard movimento', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('card real anima card, conquistas e chips pela mesma timeline em stagger', () => {
    stubMatchMedia()
    const { tl, spy } = espiarTimeline()

    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(ExperienceCard, { item: pt.items[2] })
    app.mount(root)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(tl.from).toHaveBeenCalledTimes(3)
    const [, varsCard] = tl.from.mock.calls[0]
    expect((varsCard as Record<string, unknown>).y).toBe(40)

    const [alvosConquistas, varsConquistas] = tl.from.mock.calls[1]
    expect((alvosConquistas as NodeList).length).toBe(pt.items[2].achievements.length)
    expect((varsConquistas as Record<string, unknown>).stagger).toBe(0.06)

    const [alvosChips, varsChips] = tl.from.mock.calls[2]
    expect((alvosChips as NodeList).length).toBe(pt.items[2].chips.length)
    expect((varsChips as Record<string, unknown>).stagger).toBe(0.06)
    app.unmount()
  })

  it('conteúdo permanece no HTML com o composable ativo, oculto só por JavaScript', () => {
    stubMatchMedia()
    espiarTimeline()

    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(ExperienceCard, { item: pt.items[2] })
    app.mount(root)

    expect(root.textContent).toContain('Tedsys')
    expect(root.textContent).toContain(pt.items[2].achievements[0])
    app.unmount()
  })

  it('movimento reduzido deixa o card direto, sem timeline', () => {
    stubMatchMedia(true)
    const { spy } = espiarTimeline()

    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(ExperienceCard, { item: pt.items[0] })
    app.mount(root)

    expect(spy).not.toHaveBeenCalled()
    expect(root.querySelector('[data-testid="experience-card-dot"]')).not.toBeNull()
    app.unmount()
  })
})

describe('ExperienceCard interação declarada no SFC', () => {
  it('hover eleva o card com transform e acende a barra lateral em violeta profundo', () => {
    const fonte = lerFonteCard()

    const base = fonte.match(/\.experience-card\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(base, 'transição suave em vez de troca seca de estado').toMatch(/transition:/)
    expect(base, 'barra de accent existe desde o estado base, layout não move').toMatch(/border-left:/)

    const hover = fonte.match(/\.experience-card:hover\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(hover, 'elevação por transform, sem reflow dos vizinhos').toMatch(/translateY/)
    expect(hover).toMatch(/border-left-color:\s*var\(--color-accent-deep\)/)
  })

  it('dot verde do período pulsa em loop lento de opacidade', () => {
    const fonte = lerFonteCard()

    expect(fonte).toMatch(/@keyframes\s+\w*pulso\w*\s*\{[\s\S]*?opacity/)
    const dot = fonte.match(/\.experience-card__dot\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(dot).toMatch(/animation:.*pulso/)
    expect(dot).toMatch(/infinite/)
  })

  it('movimento declarativo corta no reduced motion e deixa o conteúdo direto', () => {
    const fonte = lerFonteCard()

    const media = fonte.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(media).toMatch(/animation:\s*none/)
    expect(media).toMatch(/transition:\s*none/)
  })
})
