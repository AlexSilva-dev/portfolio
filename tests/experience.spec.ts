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
})

describe('SectionHeading', () => {
  function montar(props: { kicker: string, title: string }) {
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
