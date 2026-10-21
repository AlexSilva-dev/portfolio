import { describe, expect, it } from 'vitest'
import { createApp, type Component } from 'vue'
import { en as aboutEn, pt as aboutPt } from '../app/i18n/sections/about'
import { en as techEn, pt as techPt } from '../app/i18n/sections/tech'

const TEXTO_ORIGEM_PT =
  'Comecei a programar ainda cedo, construindo jogos e bots sozinho em casa, muito antes de qualquer curso. Fui o primeiro da minha família a concluir o ensino médio e transformei essa curiosidade em profissão.'

const TEXTO_PRESENTE_PT =
  'Hoje sou sócio-fundador e responsável técnico da AdSalesBrazil, onde levo IA do experimento à produção. No caminho, reduzi inadimplência de 18% pra 7,5% num ERP, automatizei atendimento com IA e construí um app educacional inteiro em Kotlin Multiplatform sozinho. Gosto de problema de negócio de verdade, com métrica pra provar o resultado.'

const TEXTO_ORIGEM_EN =
  'I started programming early, building games and bots on my own at home, long before any course. I was the first in my family to finish high school and turned that curiosity into a profession.'

const TEXTO_PRESENTE_EN =
  'Today I am a founding partner and the technical lead at AdSalesBrazil, where I take AI from experiment to production. Along the way, I cut delinquency from 18% to 7.5% in an ERP, automated customer service with AI and built an entire educational app in Kotlin Multiplatform on my own. I like real business problems, with a metric to prove the result.'

async function mountTechGroup(props: {
  label: string
  items: string[]
  core?: boolean
}): Promise<HTMLElement> {
  const { default: TechGroup } = await import('../app/components/TechGroup.vue')
  const container = document.createElement('div')
  const app = createApp(TechGroup as Component, props)
  app.mount(container)
  return container
}

describe('Sobre — conteúdo narrativo', () => {
  it('parágrafo de origem conta o início cedo com jogos e bots e o primeiro da família no ensino médio', () => {
    expect(aboutPt.paragraphs).toHaveLength(2)
    expect(aboutPt.paragraphs[0]).toBe(TEXTO_ORIGEM_PT)
  })

  it('parágrafo do presente traz o cargo, a inadimplência reduzida, o atendimento por IA e o app multiplataforma', () => {
    expect(aboutPt.paragraphs[1]).toBe(TEXTO_PRESENTE_PT)
  })

  it('usa título Sobre mim e kicker De onde eu venho', () => {
    expect(aboutPt.heading).toBe('Sobre mim')
    expect(aboutPt.kicker).toBe('De onde eu venho')
  })

  it('tradução en espelha os 2 parágrafos um a um', () => {
    expect(aboutEn.paragraphs).toHaveLength(2)
    expect(aboutEn.paragraphs[0]).toBe(TEXTO_ORIGEM_EN)
    expect(aboutEn.paragraphs[1]).toBe(TEXTO_PRESENTE_EN)
    expect(aboutEn.heading).toBe('About me')
    expect(aboutEn.kicker).toBe('Where I come from')
  })
})

describe('Tecnologias — 6 grupos com marcação core', () => {
  it('exibe exatamente 6 grupos na ordem da spec', () => {
    expect(techPt.groups.map((g) => g.label)).toEqual([
      'Kotlin e Android',
      'Front-end web',
      'Backend',
      'IA aplicada',
      'Infra e deploy',
      'Práticas',
    ])
  })

  it('marca só Kotlin e Android e Front-end web como core', () => {
    expect(techPt.groups.map((g) => g.core)).toEqual([true, true, false, false, false, false])
  })

  it('grupo core Kotlin e Android lista Kotlin, Kotlin Multiplatform e Compose', () => {
    expect(techPt.groups[0].items).toEqual(['Kotlin', 'Kotlin Multiplatform', 'Compose'])
  })

  it('grupo core Front-end web lista Vue 3, Nuxt 4 e TypeScript', () => {
    expect(techPt.groups[1].items).toEqual(['Vue 3', 'Nuxt 4', 'TypeScript'])
  })

  it('fecho aponta pro GitHub e LinkedIn', () => {
    expect(techPt.closing.prefix).toContain('40')
    expect(techPt.closing.github.href).toBe('https://github.com/AlexSilva-dev')
    expect(techPt.closing.linkedin.href).toBe('https://www.linkedin.com/in/alex-da-silva1')
  })

  it('usa título Tecnologias e kicker Com o que eu trabalho', () => {
    expect(techPt.heading).toBe('Tecnologias')
    expect(techPt.kicker).toBe('Com o que eu trabalho')
  })

  it('en espelha os 6 grupos com a mesma ordem, core e fecho', () => {
    expect(techEn.groups).toHaveLength(6)
    expect(techEn.groups.map((g) => g.core)).toEqual(techPt.groups.map((g) => g.core))
    expect(techEn.groups.map((g) => g.items.length)).toEqual(
      techPt.groups.map((g) => g.items.length),
    )
    expect(techEn.groups.slice(0, 5).map((g) => g.items)).toEqual(
      techPt.groups.slice(0, 5).map((g) => g.items),
    )
    expect(techEn.closing.github.href).toBe(techPt.closing.github.href)
    expect(techEn.closing.linkedin.href).toBe(techPt.closing.linkedin.href)
  })
})

describe('TechGroup (componente)', () => {
  it('renderiza o heading do grupo e os chips como texto puro, sem ícones', async () => {
    const el = await mountTechGroup({
      label: 'Kotlin e Android',
      core: true,
      items: ['Kotlin', 'Kotlin Multiplatform', 'Compose'],
    })
    expect(el.querySelector('[data-testid="tech-group-label"]')?.textContent).toBe(
      'Kotlin e Android',
    )
    const chips = [...el.querySelectorAll('[data-testid="tech-group-chip"]')]
    expect(chips.map((c) => c.textContent)).toEqual([
      'Kotlin',
      'Kotlin Multiplatform',
      'Compose',
    ])
    expect(el.querySelector('img, svg')).toBeNull()
  })

  it('aplica a variante core no grupo marcado como core', async () => {
    const el = await mountTechGroup({ label: 'Backend', core: true, items: ['Java'] })
    expect(el.querySelector('[data-testid="tech-group"]')?.classList.contains('tech-group--core')).toBe(
      true,
    )
  })

  it('não aplica a variante core no grupo neutro', async () => {
    const el = await mountTechGroup({ label: 'Práticas', items: ['TDD'] })
    expect(el.querySelector('[data-testid="tech-group"]')?.classList.contains('tech-group--core')).toBe(
      false,
    )
  })
})
