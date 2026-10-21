import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import ProjectCard from '../app/components/ProjectCard.vue'
import StatusBadge from '../app/components/StatusBadge.vue'
import { projects } from '../app/content/projects'
import { en, pt } from '../app/i18n/sections/projects'

const componentesPath = join(import.meta.dirname, '..', 'app', 'components')

function lerComponente(nome: string): string {
  return readFileSync(join(componentesPath, nome), 'utf-8')
}

// Monta os 4 cards na ordem do conteúdo estruturado, como a seção de projetos
// vai fazer ao zipar o array de conteúdo com os textos do dicionário
function montarCards() {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp({
    render: () => projects.map((project, i) => h(ProjectCard, { project, text: pt.items[i] })),
  })
  app.mount(root)
  return { root, app }
}

function cardsRenderizados(root: HTMLElement): HTMLElement[] {
  const cards = [...root.querySelectorAll('[data-testid="project-card"]')]
  expect(cards, 'esperava 4 cards renderizados').toHaveLength(4)
  return cards as HTMLElement[]
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('conteúdo estruturado de projetos', () => {
  it('expõe 4 projetos na ordem CRM, UcaTech, Check All Pages e SaaS', () => {
    expect(projects.map((p) => p.slug)).toEqual([
      'crm-adsalesbrazil',
      'ucatech',
      'check-all-pages',
      'saas-marketplaces',
    ])
  })

  it('define o status de cada projeto na ordem', () => {
    expect(projects.map((p) => p.status)).toEqual(['production', 'solo', 'tool', 'wip'])
  })

  it('linka CRM ao site oficial, UcaTech ao site oficial e Check All Pages ao repositório', () => {
    expect(projects[0].url).toBe('https://adsalesbrazil.com')
    expect(projects[1].url).toBe('https://ucatech.com.br')
    expect(projects[2].url).toBe('https://github.com/AlexSilva-dev/checkallpages')
  })

  it('SaaS de marketplaces não tem url pública', () => {
    expect(projects[3].url).toBeUndefined()
  })
})

describe('dicionário projects', () => {
  it('tem título e kicker em pt', () => {
    expect(pt.heading).toBe('Projetos')
    expect(pt.kicker).toBe('O que eu construo por conta própria')
  })

  it('tem título e kicker em en', () => {
    expect(en.heading).toBe('Projects')
    expect(en.kicker).toBe('What I build on my own')
  })

  it('traduz os 4 itens 1 para 1 entre pt e en', () => {
    expect(pt.items).toHaveLength(4)
    expect(en.items).toHaveLength(4)
    for (const item of [...pt.items, ...en.items]) {
      expect(Object.keys(item).sort()).toEqual(['badge', 'chips', 'name', 'summary'])
    }
  })

  it('usa os nomes e selos esperados em pt', () => {
    expect(pt.items.map((item) => item.name)).toEqual([
      'CRM AdSalesBrazil',
      'UcaTech',
      'Check All Pages',
      'SaaS de marketplaces',
    ])
    expect(pt.items.map((item) => item.badge)).toEqual([
      'Produto em produção',
      'Projeto solo',
      'Ferramenta de linha de comando',
      'Em desenvolvimento',
    ])
  })

  it('usa os nomes e selos esperados em en', () => {
    expect(en.items.map((item) => item.name)).toEqual([
      'CRM AdSalesBrazil',
      'UcaTech',
      'Check All Pages',
      'Marketplace SaaS',
    ])
    expect(en.items.map((item) => item.badge)).toEqual([
      'Product in production',
      'Solo project',
      'Command line tool',
      'In development',
    ])
  })

  it('traduz os chips 1 para 1', () => {
    expect(pt.items.map((item) => item.chips)).toEqual([
      ['IA', 'Docker', 'Meta API'],
      ['Kotlin', 'Kotlin Multiplatform'],
      ['Kotlin', 'CLI', 'Lighthouse'],
      ['IA', 'RAG'],
    ])
    expect(en.items.map((item) => item.chips)).toEqual([
      ['AI', 'Docker', 'Meta API'],
      ['Kotlin', 'Kotlin Multiplatform'],
      ['Kotlin', 'CLI', 'Lighthouse'],
      ['AI', 'RAG'],
    ])
  })
})

describe('cards renderizados', () => {
  it('renderiza os 4 cards na ordem do conteúdo', () => {
    const { root, app } = montarCards()
    const nomes = cardsRenderizados(root).map(
      (card) => card.querySelector('[data-testid="project-card-title"]')?.textContent?.trim(),
    )
    expect(nomes).toEqual(pt.items.map((item) => item.name))
    app.unmount()
  })

  it('cada card mostra resumo e chips do dicionário', () => {
    const { root, app } = montarCards()
    cardsRenderizados(root).forEach((card, i) => {
      expect(card.querySelector('.project-card__summary')?.textContent?.trim()).toBe(pt.items[i].summary)
      const chips = [...card.querySelectorAll('.project-card__chip')].map((el) => el.textContent?.trim())
      expect(chips).toEqual(pt.items[i].chips)
    })
    app.unmount()
  })
})

describe('selos de status', () => {
  const casos = [
    { i: 0, variante: 'status-badge--production', rotulo: 'Produto em produção' },
    { i: 1, variante: 'status-badge--neutral', rotulo: 'Projeto solo' },
    { i: 2, variante: 'status-badge--neutral', rotulo: 'Ferramenta de linha de comando' },
    { i: 3, variante: 'status-badge--wip', rotulo: 'Em desenvolvimento' },
  ] as const

  it('usa a variante e o texto corretos em cada card', () => {
    const { root, app } = montarCards()
    for (const { i, variante, rotulo } of casos) {
      const badge = cardsRenderizados(root)[i].querySelector('.status-badge')
      expect(badge, `selo ausente no card ${i}`).toBeTruthy()
      expect(badge!.classList.contains(variante), `variante errada no card ${i}`).toBe(true)
      expect(badge!.textContent).toContain(rotulo)
    }
    app.unmount()
  })

  it('todo selo tem dot E texto, nunca cor sozinha', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    for (const variante of ['production', 'wip', 'neutral'] as const) {
      const alvo = document.createElement('div')
      root.appendChild(alvo)
      const app = createApp(StatusBadge, { variant: variante, label: 'Rótulo' })
      app.mount(alvo)
      const badge = alvo.querySelector('[data-testid="status-badge"]')
      expect(badge, `selo ausente na variante ${variante}`).toBeTruthy()
      expect(badge!.querySelector('.status-badge__dot'), `dot ausente na variante ${variante}`).toBeTruthy()
      expect(badge!.textContent).toContain('Rótulo')
      app.unmount()
    }
  })
})

describe('regra de link', () => {
  it('cards com url viram âncora inteira com target _blank e rel noopener', () => {
    const { root, app } = montarCards()
    const cards = cardsRenderizados(root)
    const hrefs = [0, 1, 2].map((i) => {
      expect(cards[i].tagName, `card ${i} deveria ser âncora`).toBe('A')
      return (cards[i] as HTMLAnchorElement).href
    })
    expect(hrefs).toEqual([
      'https://adsalesbrazil.com/',
      'https://ucatech.com.br/',
      'https://github.com/AlexSilva-dev/checkallpages',
    ])
    for (const i of [0, 1, 2]) {
      const ancora = cards[i] as HTMLAnchorElement
      expect(ancora.target).toBe('_blank')
      expect(ancora.rel).toContain('noopener')
    }
    app.unmount()
  })

  it('card sem url renderiza sem âncora nenhuma', () => {
    const { root, app } = montarCards()
    const saas = cardsRenderizados(root)[3]
    expect(saas.tagName).toBe('ARTICLE')
    expect(saas.querySelector('a')).toBeNull()
    app.unmount()
  })
})

describe('regras visuais', () => {
  it('selo usa tokens de status e fundo translúcido nas variantes coloridas', () => {
    const css = lerComponente('StatusBadge.vue')
    expect(css).toMatch(/status-badge--production[\s\S]*?var\(--color-status-green\)/)
    expect(css).toMatch(/status-badge--wip[\s\S]*?var\(--color-status-amber\)/)
    expect(css).toMatch(/color-mix\(in srgb, var\(--color-status-green\)/)
    expect(css).toMatch(/color-mix\(in srgb, var\(--color-status-amber\)/)
  })

  it('card usa só tokens, sem hex cru, com elevação de 2px no hover do card linkado', () => {
    const css = lerComponente('ProjectCard.vue')
    expect(css, 'hex cru proibido fora de tokens.css').not.toMatch(/#[0-9A-Fa-f]{3,8}\b/)
    expect(css).toMatch(/var\(--color-text\)/)
    expect(css).toMatch(/project-card--link:hover[\s\S]*?translateY\(-2px\)/)
    expect(css, 'esta task não tem animação').not.toMatch(/animation|@keyframes/)
  })
})
