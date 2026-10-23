import { describe, expect, it, vi, afterEach } from 'vitest'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { createApp, nextTick, type Component } from 'vue'
import { en as aboutEn, pt as aboutPt } from '../app/i18n/sections/about'
import { en as techEn, pt as techPt } from '../app/i18n/sections/tech'

const { setLocaleMock } = vi.hoisted(() => ({ setLocaleMock: vi.fn() }))
vi.mock('../app/composables/useLocale', async () => {
  const { computed, ref } = await import('vue')
  const localeRef = ref('pt')
  return {
    useLocale: () => ({
      locale: localeRef,
      dictionary: computed(() => getDictionary(localeRef.value as 'pt' | 'en')),
      setLocale: setLocaleMock,
    }),
  }
})
import { getDictionary } from '../app/i18n'
import { useLocale } from '../app/composables/useLocale'

const TEXTO_JORNADA_PT =
  'Em três anos, saí do estágio pra referência técnica de um ERP em produção, cortei a inadimplência de 18% pra 7,5% recuperando R$ 15 mil por mês e coloquei IA pra resolver 80% do atendimento. Hoje sou sócio-fundador e responsável técnico da AdSalesBrazil, levando produto do zero à produção, do app Android ao backend.'

const TEXTO_ORIGEM_PT =
  'Comecei sozinho, construindo jogos e bots em casa muito antes de qualquer curso. Fui o primeiro da minha família a concluir o ensino médio e transformei essa curiosidade em profissão. De lá pra cá, foi entrega sobre entrega, do ERP ao CRM com IA homologada pela Meta.'

const TEXTO_JORNADA_EN =
  'In three years, I went from intern to the technical reference of an ERP in production, cut delinquency from 18% to 7.5% recovering R$ 15 thousand a month, and put AI to work resolving 80% of support. Today I am co-founder and technical lead at AdSalesBrazil, taking product from zero to production, from the Android app to the backend.'

const TEXTO_ORIGEM_EN =
  'I started alone, building games and bots at home long before any course. I was the first in my family to finish high school and turned that curiosity into a profession. Since then, it has been delivery after delivery, from the ERP to the AI CRM homologated by Meta.'

const DESCRICOES_SKILLSET_PT = [
  'apps multiplataforma da modelagem ao deploy',
  'interfaces Vue e Nuxt que carregam rápido',
  'APIs e regras de negócio que aguentam produção',
  'pipelines com RAG e LLMs resolvendo problema real',
  'Docker e pipelines que dormem tranquilo',
  'arquitetura limpa, DDD e TDD no dia a dia',
]

const DESCRICOES_SKILLSET_EN = [
  'cross-platform apps from modeling to deploy',
  'Vue and Nuxt interfaces that load fast',
  'APIs and business rules that survive production',
  'RAG and LLM pipelines solving real problems',
  'Docker and pipelines you can sleep on',
  'clean architecture, DDD and TDD in the daily routine',
]

async function montarSkillset(locale: 'pt' | 'en'): Promise<HTMLElement> {
  const { default: SkillsetSection } = await import('../app/components/SkillsetSection.vue')
  const { locale: localeAtual } = useLocale()
  localeAtual.value = locale
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp(SkillsetSection as Component)
  app.mount(root)
  return root
}

describe('Sobre — conteúdo narrativo', () => {
  it('parágrafo de jornada traz a trajetória de 3 anos com as métricas de resultado', () => {
    expect(aboutPt.paragraphs).toHaveLength(2)
    expect(aboutPt.paragraphs[0]).toBe(TEXTO_JORNADA_PT)
  })

  it('parágrafo de origem conta o início cedo com jogos e bots e a entrega contínua até o CRM da Meta', () => {
    expect(aboutPt.paragraphs[1]).toBe(TEXTO_ORIGEM_PT)
  })

  it('usa título Sobre mim e kicker De onde eu venho', () => {
    expect(aboutPt.heading).toBe('Sobre mim')
    expect(aboutPt.kicker).toBe('De onde eu venho')
  })

  it('tradução en espelha os 2 parágrafos um a um', () => {
    expect(aboutEn.paragraphs).toHaveLength(2)
    expect(aboutEn.paragraphs[0]).toBe(TEXTO_JORNADA_EN)
    expect(aboutEn.paragraphs[1]).toBe(TEXTO_ORIGEM_EN)
    expect(aboutEn.heading).toBe('About me')
    expect(aboutEn.kicker).toBe('Where I come from')
  })

  it('nenhum parágrafo usa dois-pontos, ponto e vírgula ou sinal de mais', () => {
    for (const paragrafo of [...aboutPt.paragraphs, ...aboutEn.paragraphs]) {
      expect(paragrafo).not.toMatch(/[:;+]/)
      expect(paragrafo.trim()).toBe(paragrafo)
    }
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

  it('usa título Skillset nos 2 idiomas pro display editorial', () => {
    expect(techPt.heading).toBe('Skillset')
    expect(techEn.heading).toBe('Skillset')
  })

  it('usa kicker Com o que eu trabalho', () => {
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

describe('Skillset — descrições curtas numeradas no dicionário', () => {
  it('cada frente ganha uma descrição curta de 1 frase em pt', () => {
    expect(techPt.groups.map((g) => g.description)).toEqual(DESCRICOES_SKILLSET_PT)
  })

  it('en espelha as 6 descrições frente a frente', () => {
    expect(techEn.groups.map((g) => g.description)).toEqual(DESCRICOES_SKILLSET_EN)
  })

  it('nenhuma descrição usa dois-pontos, ponto e vírgula ou sinal de mais', () => {
    for (const grupo of [...techPt.groups, ...techEn.groups]) {
      expect(grupo.description).not.toMatch(/[:;+]/)
      expect(grupo.description.trim()).toBe(grupo.description)
    }
  })
})

describe('SkillsetSection (componente)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renderiza título Skillset e 6 linhas numeradas de 01 a 06 com nome e descrição', async () => {
    const root = await montarSkillset('pt')
    expect(root.querySelector('[data-testid="skillset-title"]')?.textContent).toBe('Skillset')
    const numeros = [
      ...root.querySelectorAll('[data-testid="skillset-number"]'),
    ].map((n) => n.textContent?.trim())
    expect(numeros).toEqual(['01', '02', '03', '04', '05', '06'])
    const nomes = [
      ...root.querySelectorAll('[data-testid="skillset-name"]'),
    ].map((n) => n.textContent?.trim())
    expect(nomes).toEqual(techPt.groups.map((g) => g.label))
    const descricoes = [
      ...root.querySelectorAll('[data-testid="skillset-description"]'),
    ].map((d) => d.textContent?.trim())
    expect(descricoes).toEqual(DESCRICOES_SKILLSET_PT)
  })

  it('acende só a linha sob o cursor no hover e apaga ao sair', async () => {
    const root = await montarSkillset('pt')
    const linhas = [...root.querySelectorAll('[data-testid="skillset-row"]')]
    expect(linhas).toHaveLength(6)
    linhas[2].dispatchEvent(new MouseEvent('mouseenter'))
    await nextTick()
    const acesas = linhas.filter((l) => l.classList.contains('skillset__linha--ativa'))
    expect(acesas).toEqual([linhas[2]])
    linhas[2].dispatchEvent(new MouseEvent('mouseleave'))
    await nextTick()
    expect(linhas[2].classList.contains('skillset__linha--ativa')).toBe(false)
  })

  it('revela imagem decorativa própria só na linha ativa, sem alt e escondida do leitor de tela', async () => {
    const root = await montarSkillset('pt')
    expect(root.querySelector('[data-testid="skillset-image"]')).toBeNull()
    const linhas = [...root.querySelectorAll('[data-testid="skillset-row"]')]
    linhas[0].dispatchEvent(new MouseEvent('mouseenter'))
    await nextTick()
    const imagem = linhas[0].querySelector('[data-testid="skillset-image"]') as HTMLImageElement
    expect(imagem).not.toBeNull()
    expect(imagem.getAttribute('alt')).toBe('')
    expect(imagem.getAttribute('aria-hidden')).toBe('true')
    expect(imagem.getAttribute('src')).toContain('unify-eventos.webp')
    linhas[0].dispatchEvent(new MouseEvent('mouseleave'))
    await nextTick()
    expect(root.querySelector('[data-testid="skillset-image"]')).toBeNull()
  })

  it('cada linha ativa revela o asset da própria frente', async () => {
    const root = await montarSkillset('pt')
    const linhas = [...root.querySelectorAll('[data-testid="skillset-row"]')]
    const fontes = ['unify-eventos.webp', 'code.webp', 'wallhere.com.jpg', 'code.webp', 'wallhere.com.jpg', 'code.webp']
    for (const [indice, fonte] of fontes.entries()) {
      linhas[indice].dispatchEvent(new MouseEvent('mouseenter'))
      await nextTick()
      const imagem = linhas[indice].querySelector('[data-testid="skillset-image"]')
      expect(imagem?.getAttribute('src')).toContain(fonte)
      linhas[indice].dispatchEvent(new MouseEvent('mouseleave'))
      await nextTick()
    }
  })
})

describe('SkillsetSection (CSS editorial)', () => {
  const caminho = join(import.meta.dirname, '..', 'app', 'components', 'SkillsetSection.vue')
  const css = readFileSync(caminho, 'utf-8')
  const tokens = readFileSync(
    join(import.meta.dirname, '..', 'app', 'assets', 'css', 'tokens.css'),
    'utf-8',
  )

  it('token void define o preto puro da área escura', () => {
    expect(tokens).toMatch(/--color-void:\s*#0A0A0A/)
  })

  it('seção de impacto usa o preto puro do token void, sem hex no componente', () => {
    expect(css).toMatch(/\.skillset\s*\{[^}]*background:\s*var\(--color-void\)/)
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('seção é full-bleed, linhas atravessam a viewport sem container interno', () => {
    expect(css).not.toContain('class="container"')
    const regra = css.match(/\.skillset\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(regra).toContain('width: 100vw')
    expect(regra).toMatch(/margin(-inline|-left)?:\s*calc\(50% - 50vw\)/)
    expect(regra).toMatch(/padding-inline:\s*clamp\(/)
  })

  it('linha ativa expande de altura com transição e a descrição acende junto', () => {
    const linha = css.match(/\.skillset__linha\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(linha).toMatch(/transition:\s*padding-block/)
    const blocoHover = css.match(/@media \(hover: hover\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(blocoHover).toMatch(/\.skillset__linha--ativa\s*\{[^}]*padding-block:/)
    expect(blocoHover).toMatch(
      /\.skillset__linha--ativa [^{]*\.skillset__descricao[^{]*\{[^}]*color:\s*var\(--color-text\)/,
    )
  })

  it('reduced motion congela a expansão da linha', () => {
    const reduzido =
      css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(reduzido).toMatch(/\.skillset__linha\s*\{[^}]*transition:\s*none/)
  })

  it('linhas nascem acesas pra leitura sem hover e o estado apagado existe só onde há hover', () => {
    const baseNome = css.match(/\.skillset__nome\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(baseNome).toContain('color: var(--color-text)')
    const blocoHover = css.match(/@media \(hover: hover\)\s*\{([\s\S]*?)\n\}/)?.[1]
    expect(blocoHover).toBeTruthy()
    expect(blocoHover).toContain('var(--color-text-muted)')
    expect(blocoHover).toContain('.skillset__linha--ativa')
  })

  it('número acende pro violeta claro na linha ativa', () => {
    const blocoHover = css.match(/@media \(hover: hover\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(blocoHover).toMatch(/\.skillset__linha--ativa [^{]*\.skillset__numero[^{]*\{[^}]*var\(--color-accent\)/)
  })

  it('imagem decorativa é absoluta e sobrepõe as linhas vizinhas sem clip', () => {
    const regra = css.match(/\.skillset__imagem\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(regra).toContain('position: absolute')
    expect(regra).toContain('pointer-events: none')
    expect(regra).toMatch(/z-index:\s*[1-9]/)
    expect(css).not.toMatch(/\.skillset\s*\{[^}]*overflow:\s*hidden/)
    expect(css).not.toMatch(/\.skillset__linha\s*\{[^}]*overflow:\s*hidden/)
  })
})
