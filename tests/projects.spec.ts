import { existsSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import type { Component } from 'vue'
import ProjectRow from '../app/components/ProjectRow.vue'
import StatusBadge from '../app/components/StatusBadge.vue'
import { projects } from '../app/content/projects'
import { en, pt } from '../app/i18n/sections/projects'

vi.mock('../app/composables/useLocale', async () => {
  const { computed, ref } = await import('vue')
  const localeRef = ref('pt')
  return {
    useLocale: () => ({
      locale: localeRef,
      dictionary: computed(() => getDictionary(localeRef.value as 'pt' | 'en')),
      setLocale: vi.fn(),
    }),
  }
})
import { getDictionary } from '../app/i18n'

const componentesPath = join(import.meta.dirname, '..', 'app', 'components')

function lerComponente(nome: string): string {
  return readFileSync(join(componentesPath, nome), 'utf-8')
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
    expect(projects.map((p) => p.status)).toEqual(['production', 'wip', 'tool', 'neutral'])
  })

  it('linka CRM ao site oficial, UcaTech ao site oficial e Check All Pages ao repositório', () => {
    expect(projects[0].url).toBe('https://adsalesbrazil.com')
    expect(projects[1].url).toBe('https://ucatech.com.br')
    expect(projects[2].url).toBe('https://github.com/AlexSilva-dev/checkallpages')
  })

  it('SaaS de marketplaces não tem url pública', () => {
    expect(projects[3].url).toBeUndefined()
  })

  it('conteúdo canônico não carrega texto de idioma, metadados vivem no dicionário', () => {
    for (const project of projects) {
      expect(project, `papel não deveria viver no conteúdo do projeto ${project.slug}`).not.toHaveProperty('papel')
      expect(project, `período não deveria viver no conteúdo do projeto ${project.slug}`).not.toHaveProperty('periodo')
      expect(project, `time não deveria viver no conteúdo do projeto ${project.slug}`).not.toHaveProperty('time')
    }
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
      expect(Object.keys(item).sort()).toEqual([
        'badge',
        'chips',
        'name',
        'papel',
        'periodo',
        'summary',
        'time',
      ])
    }
  })

  it('metadados papel, período e time em pt', () => {
    expect(pt.items.map((item) => ({ papel: item.papel, periodo: item.periodo, time: item.time }))).toEqual([
      { papel: 'Sócio-fundador e responsável técnico', periodo: '2026 até hoje', time: 'AdSalesBrazil' },
      { papel: 'Idealizador e desenvolvedor solo', periodo: '2025 a 2026', time: 'Projeto pessoal' },
      { papel: 'Autor', periodo: '2025', time: 'Projeto pessoal' },
      { papel: 'Idealizador', periodo: 'Em desenvolvimento', time: 'Projeto pessoal' },
    ])
  })

  it('metadados papel, período e time traduzidos em en', () => {
    expect(en.items.map((item) => ({ papel: item.papel, periodo: item.periodo, time: item.time }))).toEqual([
      { papel: 'Co-founder and technical lead', periodo: '2026 to today', time: 'AdSalesBrazil' },
      { papel: 'Creator and solo developer', periodo: '2025 to 2026', time: 'Personal project' },
      { papel: 'Author', periodo: '2025', time: 'Personal project' },
      { papel: 'Creator', periodo: 'In development', time: 'Personal project' },
    ])
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
      'Em desenvolvimento',
      'Ferramenta de linha de comando',
      'Projeto próprio',
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
      'In development',
      'Command line tool',
      'Own project',
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

describe('selos de status', () => {
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

describe('regras visuais', () => {
  it('selo usa tokens de status e fundo translúcido nas variantes coloridas', () => {
    const css = lerComponente('StatusBadge.vue')
    expect(css).toMatch(/status-badge--production[\s\S]*?var\(--color-status-green\)/)
    expect(css).toMatch(/status-badge--wip[\s\S]*?var\(--color-status-amber\)/)
    expect(css).toMatch(/color-mix\(in srgb, var\(--color-status-green\)/)
    expect(css).toMatch(/color-mix\(in srgb, var\(--color-status-amber\)/)
  })
})

/*
 * Task de fixes pós-validação. Papel, período e time são texto de idioma e
 * moram no dicionário (pt e en em paridade); o conteúdo canônico guarda só
 * slug, status, url, ano e preview. ProjectRow lê os valores do item do
 * dicionário que o pai já entrega.
 */

function montarLinhas(dicionario: typeof pt | typeof en = pt) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp({
    render: () =>
      projects.map((project, i) =>
        h(ProjectRow, {
          project,
          text: dicionario.items[i],
          labels: dicionario.meta,
          verProjeto: dicionario.verProjeto,
        }),
      ),
  })
  app.mount(root)
  return { root, app }
}

describe('preview dos projetos no conteúdo', () => {
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
        pt.items[i].papel,
        pt.items[i].periodo,
        projects[i].ano,
        pt.items[i].time,
      ])
    })
    app.unmount()
  })

  it('cada linha traz os metadados traduzidos em en', () => {
    const { root, app } = montarLinhas(en)
    const labelsEsperados = [en.meta.papel, en.meta.periodo, en.meta.ano, en.meta.time]
    linhasRenderizadas(root).forEach((linha, i) => {
      const grid = linha.querySelector('[data-testid="project-row-meta"]')
      expect(grid, `grid de metadados ausente na linha ${i}`).toBeTruthy()
      const dts = [...grid!.querySelectorAll('dt')].map((el) => el.textContent?.trim())
      const dds = [...grid!.querySelectorAll('dd')].map((el) => el.textContent?.trim())
      expect(dts).toEqual(labelsEsperados)
      expect(dds).toEqual([
        en.items[i].papel,
        en.items[i].periodo,
        projects[i].ano,
        en.items[i].time,
      ])
      expect(dds).not.toContain('2026 até hoje')
      expect(dds).not.toContain('Projeto pessoal')
    })
    app.unmount()
  })

  it('linhas com url têm o botão fantasma Ver projeto com seta', () => {
    const { root, app } = montarLinhas()
    linhasRenderizadas(root).forEach((linha, i) => {
      if (!projects[i].url) return
      const cta = linha.querySelector('[data-testid="project-row-cta"]')
      expect(cta, `cta ausente na linha ${i}`).toBeTruthy()
      expect(cta!.textContent).toContain('Ver projeto')
      expect(cta!.querySelector('[aria-hidden="true"]'), `seta ausente na linha ${i}`).toBeTruthy()
    })
    app.unmount()
  })

  it('linha sem url não renderiza rótulo de ação nenhum, o selo de status já comunica', () => {
    const { root, app } = montarLinhas()
    const saas = linhasRenderizadas(root)[3]
    expect(saas.querySelector('[data-testid="project-row-cta"]'), 'cta fantasma no SaaS').toBeNull()
    expect(saas.textContent).not.toContain(pt.verProjeto)
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

  it('UcaTech carrega o selo âmbar Em desenvolvimento com dot e texto', () => {
    const { root, app } = montarLinhas()
    const uca = linhasRenderizadas(root)[1]
    const selo = uca.querySelector('[data-testid="status-badge"]')
    expect(selo, 'selo ausente no UcaTech').toBeTruthy()
    expect(selo!.classList.contains('status-badge--wip'), 'selo do UcaTech deveria ser âmbar').toBe(true)
    expect(selo!.querySelector('.status-badge__dot'), 'dot ausente no selo do UcaTech').toBeTruthy()
    expect(selo!.textContent).toContain(pt.items[1].badge)
    app.unmount()
  })

  it('linha do SaaS não tem âncora nenhuma e mantém selo neutro de Projeto próprio', () => {
    const { root, app } = montarLinhas()
    const saas = linhasRenderizadas(root)[3]
    expect(saas.tagName).toBe('ARTICLE')
    expect(saas.querySelector('a')).toBeNull()
    const selo = saas.querySelector('[data-testid="status-badge"]')
    expect(selo, 'selo neutro ausente no SaaS').toBeTruthy()
    expect(selo!.classList.contains('status-badge--neutral'), 'selo do SaaS deveria ser neutro').toBe(true)
    expect(selo!.querySelector('.status-badge__dot'), 'dot ausente no selo do SaaS').toBeTruthy()
    expect(selo!.textContent).toContain(pt.items[3].badge)
    app.unmount()
  })

  it('UcaTech e SaaS carregam selo, CRM e Check All Pages são linhas limpas', () => {
    const { root, app } = montarLinhas()
    const linhas = linhasRenderizadas(root)
    expect(linhas[1].querySelector('[data-testid="status-badge"]'), 'selo ausente no UcaTech').toBeTruthy()
    expect(linhas[3].querySelector('[data-testid="status-badge"]'), 'selo ausente no SaaS').toBeTruthy()
    for (const i of [0, 2]) {
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

/*
 * Ícones de tecnologia no skillset, config no componente (apresentação não
 * vai pro dicionário). As frentes 04, 05 e 06 não têm ícone no acervo e
 * ficam sem, nunca ícone forçado.
 */

async function montarSkillset(): Promise<HTMLElement> {
  const { default: SkillsetSection } = await import('../app/components/SkillsetSection.vue')
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp(SkillsetSection as Component)
  app.mount(root)
  return root
}

describe('ícones de tecnologia no skillset', () => {
  const iconesPath = join(import.meta.dirname, '..', 'app', 'assets', 'icons')

  it('linhas 01 a 03 carregam 7 ícones no total e 04 a 06 ficam sem ícone', async () => {
    const root = await montarSkillset()
    const linhas = [...root.querySelectorAll('[data-testid="skillset-row"]')]
    expect(linhas, 'esperava 6 linhas no skillset').toHaveLength(6)
    const contagens = linhas.map(
      (linha) => linha.querySelectorAll('[data-testid="skillset-icons"] img').length,
    )
    expect(contagens).toEqual([1, 4, 2, 0, 0, 0])
  })

  it('ícones servidos são exatamente os arquivos do acervo, na ordem das linhas', async () => {
    const root = await montarSkillset()
    const srcs = [...root.querySelectorAll<HTMLImageElement>('[data-testid="skillset-icons"] img')].map(
      (img) => img.getAttribute('src') ?? '',
    )
    const esperados = [
      'icons8-kotlin-96.png',
      'icons8-vue-js-96.png',
      'icons8-javascript-48.png',
      'icons8-css-96.png',
      'icons8-html-96.png',
      'icons8-spring-boot-48.png',
      'icons8-php-80.png',
    ]
    expect(srcs).toHaveLength(esperados.length)
    esperados.forEach((nome, i) => {
      expect(srcs[i], `ícone da posição ${i} deveria ser ${nome}`).toContain(nome)
      expect(existsSync(join(iconesPath, nome)), `${nome} não existe em app/assets/icons`).toBe(true)
    })
  })

  it('ícones são decorativos, alt vazio e aria-hidden, e o hover existente fica intacto', async () => {
    const root = await montarSkillset()
    for (const img of [...root.querySelectorAll('[data-testid="skillset-icons"] img')]) {
      expect(img.getAttribute('alt'), 'alt deveria ser vazio').toBe('')
      expect(img.getAttribute('aria-hidden'), 'ícone deveria ser aria-hidden').toBe('true')
    }
    const css = lerComponente('SkillsetSection.vue')
    expect(css).toMatch(/\.skillset__icones img\s*\{[^}]*pointer-events:\s*none/)
    expect(css).toMatch(/\.skillset__icones img\s*\{[^}]*height:\s*(1\.75rem|2rem|2\.5rem)/)
  })
})
