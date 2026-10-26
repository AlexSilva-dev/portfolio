import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type Component } from 'vue'

// Mesma estratégia do contact.spec: o mock aponta para o arquivo físico do
// composable, que é exatamente o módulo que o auto-import do Nuxt resolve
// dentro do SFC. Os textos afirmados são os mesmos que o site renderiza.
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

import { useLocale } from '../app/composables/useLocale'
import { getDictionary } from '../app/i18n'
import { projects } from '../app/content/projects'
import IndexPage from '../app/pages/index.vue'

const LEGADOS = ['Banner', 'AboutMe', 'Technology', 'ProjectCard', 'TechGroup']

const fonteIndex = () =>
  readFileSync(resolve(process.cwd(), 'app/pages/index.vue'), 'utf-8')

const fonteSectionHeading = () =>
  readFileSync(resolve(process.cwd(), 'app/components/SectionHeading.vue'), 'utf-8')

const fonteSectionEvolution = () =>
  readFileSync(resolve(process.cwd(), 'app/components/SectionEvolution.vue'), 'utf-8')

function montar(locale: 'pt' | 'en') {
  const { locale: localeRef } = useLocale()
  localeRef.value = locale
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp(IndexPage as Component)
  app.mount(root)
  return root
}

afterEach(() => {
  document.body.innerHTML = ''
})

function blocosNaOrdem(root: HTMLElement): string[] {
  const seletor = [
    '[data-testid="hero"]',
    '[data-testid="section-intro"]',
    '[data-testid="section-evolution"]',
    '[data-testid="home-section"]',
    '[data-testid="skillset-section"]',
    '[data-testid="contact-section"]',
  ].join(', ')
  return [...root.querySelectorAll(seletor)].map(
    (el) => el.id || el.getAttribute('data-testid'),
  )
}

describe('Home — ordem nova das seções', () => {
  it('renderiza hero, abertura narrativa, evolução, experiência, projetos, skillset e contato nessa ordem', () => {
    const root = montar('pt')
    expect(blocosNaOrdem(root)).toEqual([
      'hero',
      'section-intro',
      'sobre',
      'experiencia',
      'projetos',
      'skillset',
      'contato',
    ])
  })

  it('as âncoras do nav encontram alvo na página', () => {
    const root = montar('pt')
    for (const id of ['sobre', 'experiencia', 'projetos', 'skillset', 'contato']) {
      expect(root.querySelector(`#${id}`), `âncora #${id} sem alvo`).not.toBeNull()
    }
  })
})

describe('Home — SectionHeading com escala editorial nova', () => {
  it('experiência e projetos usam o SectionHeading com kicker e título do dicionário em pt', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const casos = [
      { id: 'experiencia', numero: '01', secao: 'experience' },
      { id: 'projetos', numero: '02', secao: 'projects' },
    ] as const
    for (const caso of casos) {
      const secao = root.querySelector(`#${caso.id}`)
      expect(secao, `seção #${caso.id} existe`).not.toBeNull()
      const kicker = secao?.querySelector('[data-testid="section-heading-kicker"]')
      const title = secao?.querySelector('[data-testid="section-heading-title"]')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = dict[caso.secao as any] as { kicker: string, heading: string }
      expect(kicker?.textContent).toContain(caso.numero)
      expect(kicker?.textContent).toContain(d.kicker)
      expect(title?.textContent?.trim()).toBe(d.heading)
    }
  })

  it('em en os kickers e títulos trocam com o idioma', () => {
    const root = montar('en')
    const dict = getDictionary('en').sections
    const experiencia = root.querySelector('#experiencia')
    expect(experiencia?.querySelector('[data-testid="section-heading-kicker"]')?.textContent).toContain(
      dict.experience.kicker,
    )
    expect(experiencia?.querySelector('[data-testid="section-heading-title"]')?.textContent?.trim()).toBe(
      dict.experience.heading,
    )
    const projetos = root.querySelector('#projetos')
    expect(projetos?.querySelector('[data-testid="section-heading-title"]')?.textContent?.trim()).toBe(
      dict.projects.heading,
    )
  })

  it('título em display gigante em torno de 8vw e kicker em mono', () => {
    const css = fonteSectionHeading()
    expect(css).toMatch(/\.section-heading__title\s*\{[^}]*font-size:\s*clamp\([^)]*8vw/)
    expect(css).toMatch(/\.section-heading__kicker\s*\{[^}]*font-family:\s*var\(--font-mono\)/)
  })

  it('título em tinta cheia sobre o papel, kicker em violeta profundo e versão clara pra área escura', () => {
    const css = fonteSectionHeading()
    // tinta cheia na área papel, sem tom lavado nem opacidade reduzida
    expect(css).toMatch(/^\.section-heading__title\s*\{[^}]*color:\s*var\(--color-ink\)/m)
    expect(css).not.toMatch(/^\.section-heading__title\s*\{[^}]*color:\s*var\(--color-text\)/m)
    // kicker numerado em violeta profundo, contraste 5,24 sobre o papel
    expect(css).toMatch(/^\.section-heading__kicker\s*\{[^}]*color:\s*var\(--color-accent-deep\)/m)
    // acabamento editorial mantido: peso alto e entrelinha apertada
    expect(css).toMatch(/^\.section-heading__title\s*\{[^}]*font-weight:\s*800/m)
    expect(css).toMatch(/^\.section-heading__title\s*\{[^}]*line-height:\s*0\.95/m)
    // se o heading for usado em seção escura, título em cor de papel e kicker no violeta claro
    expect(css).toMatch(/\.section-heading--escuro\s+\.section-heading__title\s*\{[^}]*color:\s*var\(--color-text\)/)
    expect(css).toMatch(/\.section-heading--escuro\s+\.section-heading__kicker\s*\{[^}]*color:\s*var\(--color-accent\)/)
  })
})

describe('Home — conteúdo das seções', () => {
  it('experiência renderiza um ExperienceCard por cargo do dicionário', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const cards = root.querySelectorAll('#experiencia [data-testid="experience-card"]')
    expect(cards).toHaveLength(dict.experience.items.length)
    expect(cards[0]?.textContent).toContain(dict.experience.items[0].company)
  })

  it('projetos renderiza uma ProjectRow por projeto com metadados e labels do dicionário', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const linhas = root.querySelectorAll('#projetos [data-testid="project-row"]')
    expect(linhas).toHaveLength(projects.length)
    expect(dict.projects.items).toHaveLength(projects.length)
    expect(linhas[0]?.querySelector('[data-testid="project-row-name"]')?.textContent?.trim()).toBe(
      dict.projects.items[0].name,
    )
    const grid = linhas[0]?.querySelector('[data-testid="project-row-meta"]')
    expect(grid?.textContent).toContain(dict.projects.meta.papel)
    expect(grid?.textContent).toContain(dict.projects.items[0].papel)
  })

  it('a seção de projetos renderiza 4 linhas, 3 com link externo e o case sem âncora', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const linhas = root.querySelectorAll('#projetos [data-testid="project-row"]')
    expect(linhas).toHaveLength(4)
    for (const i of [0, 1, 2]) {
      expect(linhas[i].tagName).toBe('A')
      expect(linhas[i].getAttribute('target')).toBe('_blank')
    }
    expect(linhas[3].tagName).toBe('ARTICLE')
    expect(linhas[3].querySelector('a')).toBeNull()
    expect(linhas[3].textContent).toContain(dict.projects.items[3].name)
  })

  it('skillset renderiza as 6 linhas numeradas na seção escura', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const linhas = root.querySelectorAll('#skillset [data-testid="skillset-row"]')
    expect(linhas).toHaveLength(dict.tech.groups.length)
    expect(linhas[0]?.querySelector('[data-testid="skillset-number"]')?.textContent?.trim()).toBe('01')
  })

  it('contato renderiza o cartão com o título do dicionário', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const titulo = root.querySelector('[data-testid="contact-section"] [data-testid="contact-heading"]')
    expect(titulo?.textContent?.trim()).toBe(dict.contact.heading)
  })
})

describe('Home — bloco de evolução com polaroid do GIF', () => {
  it('renderiza o parágrafo 2 do dicionário about', () => {
    const root = montar('pt')
    const texto = root.querySelector('[data-testid="evolution-texto"]')
    expect(texto?.textContent?.trim()).toBe(getDictionary('pt').sections.about.paragraphs[1])
  })

  it('em en o parágrafo troca com o idioma', () => {
    const root = montar('en')
    const texto = root.querySelector('[data-testid="evolution-texto"]')
    expect(texto?.textContent?.trim()).toBe(getDictionary('en').sections.about.paragraphs[1])
  })

  it('a polaroid exibe o GIF alex.gif com alt descritivo', () => {
    const root = montar('pt')
    const img = root.querySelector<HTMLImageElement>('[data-testid="evolution-gif"]')
    expect(img, 'imagem do GIF ausente').not.toBeNull()
    expect(img?.getAttribute('src'), 'src do GIF ausente').toBeTruthy()
    expect(img?.alt.trim().length ?? 0).toBeGreaterThan(10)
    expect(fonteSectionEvolution()).toContain('alex.gif')
  })

  it('em en o alt troca com o idioma', () => {
    const root = montar('en')
    const img = root.querySelector<HTMLImageElement>('[data-testid="evolution-gif"]')
    const altPt = montar('pt').querySelector<HTMLImageElement>('[data-testid="evolution-gif"]')?.alt
    expect(img?.alt).not.toBe(altPt)
  })

  it('polaroid inclinada com moldura clara, sombra difusa e foto em escala de cinza', () => {
    const css = fonteSectionEvolution()
    expect(css).toMatch(/\.evolucao__polaroide\s*\{[^}]*transform:\s*rotate\(-?6deg\)/)
    expect(css).toMatch(/\.evolucao__polaroide\s*\{[^}]*box-shadow:[^;}]*color-mix/)
    expect(css).toMatch(/\.evolucao__polaroide\s*\{[^}]*background:\s*var\(--color-paper\)/)
    expect(css).toMatch(/\.evolucao__polaroide img\s*\{[^}]*filter:\s*grayscale\(1\)/)
  })
})

describe('Home — limpeza de órfãos', () => {
  it('index.vue não referencia nenhum componente legado', () => {
    const fonte = fonteIndex()
    for (const nome of LEGADOS) {
      expect(fonte, `index.vue não deve citar ${nome}`).not.toMatch(new RegExp(`\\b${nome}\\b`))
    }
  })

  it('ProjectCard e TechGroup saem do projeto, StatusBadge fica com o ProjectRow', () => {
    const base = resolve(process.cwd(), 'app/components')
    expect(existsSync(resolve(base, 'ProjectCard.vue')), 'ProjectCard deveria ser removido').toBe(false)
    expect(existsSync(resolve(base, 'TechGroup.vue')), 'TechGroup deveria ser removido').toBe(false)
    expect(existsSync(resolve(base, 'StatusBadge.vue')), 'StatusBadge segue vivo com o ProjectRow').toBe(true)
  })

  it('dicionário hero não tem mais h1 e specialties, com paridade pt e en', () => {
    const heroPt = getDictionary('pt').sections.hero as Record<string, unknown>
    const heroEn = getDictionary('en').sections.hero as Record<string, unknown>
    expect(heroPt).not.toHaveProperty('h1')
    expect(heroPt).not.toHaveProperty('specialties')
    expect(heroEn).not.toHaveProperty('h1')
    expect(heroEn).not.toHaveProperty('specialties')
  })

  it('index.vue importa os componentes da composição editorial', () => {
    const fonte = fonteIndex()
    for (const nome of ['HeroSection', 'SectionIntro', 'SectionEvolution', 'ProjectRow', 'SkillsetSection', 'ContactSection']) {
      expect(fonte, `index.vue deve importar ${nome}`).toContain(nome)
    }
  })
})
