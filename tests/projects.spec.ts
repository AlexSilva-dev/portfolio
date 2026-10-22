import { existsSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import ProjectCard from '../app/components/ProjectCard.vue'
import ProjectRow from '../app/components/ProjectRow.vue'
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

/*
 * Task 4, lista editorial. ProjectRow é a linha nova da spec editorial:
 * nome em display gigante, régua fina, metadados em 4 colunas, hover com
 * preview em sobreposição. ProjectCard continua vivo até a task 7.
 */
const METADADOS_ESPERADOS = [
  { papel: 'Sócio-fundador e responsável técnico', periodo: '2026 até hoje', ano: '2026', time: 'AdSalesBrazil' },
  { papel: 'Idealizador e desenvolvedor solo', periodo: '2025 a 2026', ano: '2026', time: 'Projeto pessoal' },
  { papel: 'Autor', periodo: '2025', ano: '2025', time: 'Projeto pessoal' },
  { papel: 'Idealizador', periodo: 'Em desenvolvimento', ano: '2026', time: 'Projeto pessoal' },
]

describe('metadados editoriais no conteúdo', () => {
  it('cada projeto carrega papel, período, ano e time na ordem', () => {
    projects.forEach((project, i) => {
      expect(project.papel, `papel do projeto ${i}`).toBe(METADADOS_ESPERADOS[i].papel)
      expect(project.periodo, `período do projeto ${i}`).toBe(METADADOS_ESPERADOS[i].periodo)
      expect(project.ano, `ano do projeto ${i}`).toBe(METADADOS_ESPERADOS[i].ano)
      expect(project.time, `time do projeto ${i}`).toBe(METADADOS_ESPERADOS[i].time)
    })
  })

  it('cada projeto tem um preview de asset próprio existente em app/assets/img', () => {
    const nomes = new Set<string>()
    projects.forEach((project, i) => {
      const arquivo = basename(project.preview)
      nomes.add(arquivo)
      expect(
        existsSync(join(import.meta.dirname, '..', 'app', 'assets', 'img', arquivo)),
        `preview do projeto ${i} não existe em app/assets/img`,
      ).toBe(true)
    })
    expect(nomes.size, 'cada linha usa um preview distinto').toBe(4)
  })
})

describe('dicionário projects, labels editoriais', () => {
  it('labels dos metadados em pt', () => {
    expect(pt.meta).toEqual({ papel: 'Papel', periodo: 'Período', ano: 'Ano', time: 'Time' })
    expect(pt.verProjeto).toBe('Ver projeto')
  })

  it('labels dos metadados em en', () => {
    expect(en.meta).toEqual({ papel: 'Role', periodo: 'Period', ano: 'Year', time: 'Team' })
    expect(en.verProjeto).toBe('View project')
  })

  it('paridade de chaves entre pt e en nos labels e no verProjeto', () => {
    expect(Object.keys(pt.meta).sort()).toEqual(Object.keys(en.meta).sort())
    expect(typeof pt.verProjeto).toBe('string')
    expect(typeof en.verProjeto).toBe('string')
  })
})

function montarLinhas() {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp({
    render: () =>
      projects.map((project, i) =>
        h(ProjectRow, {
          project,
          text: pt.items[i],
          labels: pt.meta,
          verProjeto: pt.verProjeto,
        }),
      ),
  })
  app.mount(root)
  return { root, app }
}

function linhasRenderizadas(root: HTMLElement): HTMLElement[] {
  const linhas = [...root.querySelectorAll('[data-testid="project-row"]')]
  expect(linhas, 'esperava 4 linhas renderizadas').toHaveLength(4)
  return linhas as HTMLElement[]
}

describe('ProjectRow, lista editorial', () => {
  it('renderiza as 4 linhas com os nomes na ordem CRM, UcaTech, Check All Pages e SaaS', () => {
    const { root, app } = montarLinhas()
    const nomes = linhasRenderizadas(root).map(
      (linha) => linha.querySelector('[data-testid="project-row-name"]')?.textContent?.trim(),
    )
    expect(nomes).toEqual(pt.items.map((item) => item.name))
    app.unmount()
  })

  it('cada linha traz o grid de metadados com os 4 pares label e valor', () => {
    const { root, app } = montarLinhas()
    const labelsEsperados = [pt.meta.papel, pt.meta.periodo, pt.meta.ano, pt.meta.time]
    linhasRenderizadas(root).forEach((linha, i) => {
      const grid = linha.querySelector('[data-testid="project-row-meta"]')
      expect(grid, `grid de metadados ausente na linha ${i}`).toBeTruthy()
      const dts = [...grid!.querySelectorAll('dt')].map((el) => el.textContent?.trim())
      const dds = [...grid!.querySelectorAll('dd')].map((el) => el.textContent?.trim())
      expect(dts).toEqual(labelsEsperados)
      expect(dds).toEqual([
        METADADOS_ESPERADOS[i].papel,
        METADADOS_ESPERADOS[i].periodo,
        METADADOS_ESPERADOS[i].ano,
        METADADOS_ESPERADOS[i].time,
      ])
    })
    app.unmount()
  })

  it('cada linha tem botão fantasma Ver projeto com seta', () => {
    const { root, app } = montarLinhas()
    linhasRenderizadas(root).forEach((linha, i) => {
      const cta = linha.querySelector('[data-testid="project-row-cta"]')
      expect(cta, `cta ausente na linha ${i}`).toBeTruthy()
      expect(cta!.textContent).toContain('Ver projeto')
      expect(cta!.querySelector('[aria-hidden="true"]'), `seta ausente na linha ${i}`).toBeTruthy()
    })
    app.unmount()
  })

  it('cada linha revela um preview de imagem em sobreposição', () => {
    const { root, app } = montarLinhas()
    linhasRenderizadas(root).forEach((linha, i) => {
      const img = linha.querySelector<HTMLImageElement>('[data-testid="project-row-preview"]')
      expect(img, `preview ausente na linha ${i}`).toBeTruthy()
      expect(img!.getAttribute('src')).toBe(projects[i].preview)
    })
    app.unmount()
  })
})

describe('regra de link na lista editorial', () => {
  it('linhas com url viram âncora inteira com target _blank e rel noopener', () => {
    const { root, app } = montarLinhas()
    const linhas = linhasRenderizadas(root)
    const hrefs = [0, 1, 2].map((i) => {
      expect(linhas[i].tagName, `linha ${i} deveria ser âncora`).toBe('A')
      return (linhas[i] as HTMLAnchorElement).href
    })
    expect(hrefs).toEqual([
      'https://adsalesbrazil.com/',
      'https://ucatech.com.br/',
      'https://github.com/AlexSilva-dev/checkallpages',
    ])
    for (const i of [0, 1, 2]) {
      const ancora = linhas[i] as HTMLAnchorElement
      expect(ancora.target).toBe('_blank')
      expect(ancora.rel).toContain('noopener')
    }
    app.unmount()
  })

  it('linha do SaaS não tem âncora nenhuma e mantém selo âmbar de dot e texto', () => {
    const { root, app } = montarLinhas()
    const saas = linhasRenderizadas(root)[3]
    expect(saas.tagName).toBe('ARTICLE')
    expect(saas.querySelector('a')).toBeNull()
    const selo = saas.querySelector('[data-testid="status-badge"]')
    expect(selo, 'selo âmbar ausente no SaaS').toBeTruthy()
    expect(selo!.classList.contains('status-badge--wip'), 'selo do SaaS deveria ser âmbar').toBe(true)
    expect(selo!.querySelector('.status-badge__dot'), 'dot ausente no selo do SaaS').toBeTruthy()
    expect(selo!.textContent).toContain(pt.items[3].badge)
    app.unmount()
  })

  it('somente o SaaS carrega selo, as outras linhas são limpas', () => {
    const { root, app } = montarLinhas()
    const linhas = linhasRenderizadas(root)
    for (const i of [0, 1, 2]) {
      expect(linhas[i].querySelector('[data-testid="status-badge"]'), `selo inesperado na linha ${i}`).toBeNull()
    }
    app.unmount()
  })
})

describe('composição editorial da linha (CSS)', () => {
  const css = () => lerComponente('ProjectRow.vue')

  it('régua fina de 1px no topo de cada linha', () => {
    expect(css()).toMatch(/\.project-row\s*\{[^}]*border-top:\s*1px solid/)
  })

  it('nome em display gigante entre 6 e 7vw', () => {
    expect(css()).toMatch(/\.project-row__nome\s*\{[^}]*font-size:\s*clamp\([^)]*6\.5vw/)
  })

  it('hover em desktop acende o nome pro violeta profundo', () => {
    expect(css()).toMatch(
      /@media \(hover: hover\)[\s\S]*?\.project-row--link:hover[\s\S]*?\.project-row__nome[\s\S]*?color:\s*var\(--color-accent-deep\)/,
    )
  })

  it('preview é sobreposição absoluta, nasce invisível e acende no hover sem empurrar layout', () => {
    expect(css()).toMatch(/\.project-row__preview\s*\{[^}]*position:\s*absolute/)
    expect(css()).toMatch(/\.project-row__preview\s*\{[^}]*opacity:\s*0/)
    expect(css()).toMatch(
      /@media \(hover: hover\)[\s\S]*?\.project-row--link:hover[\s\S]*?\.project-row__preview[\s\S]*?opacity:\s*1/,
    )
  })

  it('labels de metadados em mono maiúsculas pequenas', () => {
    expect(css()).toMatch(/\.project-row__meta dt\s*\{[^}]*font-family:\s*var\(--font-mono\)/)
    expect(css()).toMatch(/\.project-row__meta dt\s*\{[^}]*text-transform:\s*uppercase/)
  })

  it('usa só tokens, sem hex cru, e reduced motion corta a transição', () => {
    expect(css(), 'hex cru proibido fora de tokens.css').not.toMatch(/#[0-9A-Fa-f]{3,8}\b/)
    expect(css()).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?transition:\s*none/)
  })
})
