import { afterEach, describe, expect, it } from 'vitest'
import { createApp, type App } from 'vue'
import { pt, en, type ExperienceItem } from '../app/i18n/sections/experience'
import SectionHeading from '../app/components/SectionHeading.vue'
import ExperienceCard from '../app/components/ExperienceCard.vue'

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
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(ExperienceCard, { item })
    app.mount(root)
    return { root, app }
  }

  afterEach(() => {
    document.body.innerHTML = ''
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
