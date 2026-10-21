import { readFileSync } from 'node:fs'
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

const LEGADOS = ['Banner', 'AboutMe', 'Technology', 'Projects', 'Project', 'Contact']

const fonteIndex = () =>
  readFileSync(resolve(process.cwd(), 'app/pages/index.vue'), 'utf-8')

const fonteContactSection = () =>
  readFileSync(resolve(process.cwd(), 'app/components/ContactSection.vue'), 'utf-8')

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

function secoesNaOrdem(root: HTMLElement): string[] {
  return [
    ...root.querySelectorAll(
      '[data-testid="hero"], [data-testid="home-section"], [data-testid="contact-section"]',
    ),
  ].map((el) => el.id)
}

describe('Home — ordem das seções', () => {
  it('renderiza as 6 seções na ordem da ui-spec', () => {
    const root = montar('pt')
    expect(secoesNaOrdem(root)).toEqual([
      'hero',
      'experiencia',
      'projetos',
      'sobre',
      'tecnologias',
      'contato',
    ])
  })
})

describe('Home — SectionHeading com kicker e título do dicionário', () => {
  const CASOS_PT = [
    { id: 'experiencia', numero: '01', secao: 'experience' },
    { id: 'projetos', numero: '02', secao: 'projects' },
    { id: 'sobre', numero: '03', secao: 'about' },
    { id: 'tecnologias', numero: '04', secao: 'tech' },
    { id: 'contato', numero: '05', secao: 'contact' },
  ] as const

  it('cada seção numerada traz kicker e title do dicionário em pt', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    for (const caso of CASOS_PT) {
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
    const contato = root.querySelector('#contato')
    expect(contato?.querySelector('[data-testid="section-heading-title"]')?.textContent?.trim()).toBe(
      dict.contact.heading,
    )
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

  it('projetos renderiza um ProjectCard por projeto do conteúdo canônico', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const cards = root.querySelectorAll('#projetos [data-testid="project-card"]')
    expect(cards).toHaveLength(projects.length)
    expect(dict.projects.items).toHaveLength(projects.length)
    expect(cards[0]?.textContent).toContain(dict.projects.items[0].name)
  })

  it('sobre renderiza os 2 parágrafos do dicionário com largura de leitura de 65ch', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const paragrafos = root.querySelectorAll('#sobre [data-testid="about-paragraph"]')
    expect(paragrafos).toHaveLength(dict.about.paragraphs.length)
    expect(paragrafos[0]?.textContent).toBe(dict.about.paragraphs[0])
    expect(paragrafos[1]?.textContent).toBe(dict.about.paragraphs[1])
    const fonte = fonteIndex()
    expect(fonte).toContain('65ch')
  })

  it('tecnologias renderiza 6 grupos com core marcado e fecho com links', () => {
    const root = montar('pt')
    const dict = getDictionary('pt').sections
    const grupos = root.querySelectorAll('#tecnologias [data-testid="tech-group"]')
    expect(grupos).toHaveLength(dict.tech.groups.length)
    expect(dict.tech.groups.filter((g) => g.core)).toHaveLength(2)
    expect(root.querySelectorAll('#tecnologias .tech-group--core')).toHaveLength(2)

    const fecho = root.querySelector('[data-testid="tech-closing"]')
    expect(fecho?.textContent).toContain(dict.tech.closing.prefix)
    const links = [...fecho?.querySelectorAll('a') ?? []] as HTMLAnchorElement[]
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      dict.tech.closing.github.href,
      dict.tech.closing.linkedin.href,
    ])
  })
})

describe('Home — limpeza do legado', () => {
  it('index.vue não referencia nenhum componente legado', () => {
    const fonte = fonteIndex()
    for (const nome of LEGADOS) {
      expect(fonte, `index.vue não deve citar ${nome}`).not.toMatch(new RegExp(`\\b${nome}\\b`))
    }
  })

  it('ContactSection não tem h2 próprio e usa o SectionHeading', () => {
    expect(fonteContactSection()).not.toContain('<h2')
    const root = montar('pt')
    const title = root.querySelector(
      '[data-testid="contact-section"] [data-testid="section-heading-title"]',
    )
    expect(title?.textContent?.trim()).toBe('Vamos conversar')
  })
})
