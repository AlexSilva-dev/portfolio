import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createApp, nextTick } from 'vue'

const h = vi.hoisted(() => ({
  localeRef: null as null | { value: string },
}))

vi.mock('../app/composables/useLocale', async () => {
  const { computed, ref } = await import('vue')
  const localeRef = ref('pt')
  h.localeRef = localeRef
  return {
    useLocale: () => ({
      locale: localeRef,
      dictionary: computed(() => getDictionary(localeRef.value as 'pt' | 'en')),
      setLocale: (next: 'pt' | 'en') => {
        localeRef.value = next
      },
    }),
  }
})

import { getDictionary } from '../app/i18n'
import { pt as layoutPt, en as layoutEn } from '../app/i18n/sections/layout'
import SiteHeader from '../app/components/SiteHeader.vue'
import SiteFooter from '../app/components/SiteFooter.vue'

function keysOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((_, i) => String(i))
  if (value !== null && typeof value === 'object') return Object.keys(value).sort()
  return []
}

function assertSameShape(pt: unknown, en: unknown, path = ''): void {
  expect(keysOf(pt), `chaves divergentes em "${path || 'raiz'}"`).toEqual(keysOf(en))
  if (pt !== null && typeof pt === 'object' && en !== null && typeof en === 'object') {
    for (const key of keysOf(pt)) {
      assertSameShape(
        (pt as Record<string, unknown>)[key],
        (en as Record<string, unknown>)[key],
        path ? `${path}.${key}` : key,
      )
    }
  }
}

describe('dicionário layout', () => {
  it('exporta pt e en', () => {
    expect(layoutPt).toBeTruthy()
    expect(layoutEn).toBeTruthy()
  })

  it('tem paridade de chaves entre pt e en', () => {
    assertSameShape(layoutPt, layoutEn, 'layout')
  })

  it('nav pt tem os 5 rótulos das âncoras', () => {
    expect(layoutPt.nav).toEqual({
      label: 'Navegação principal',
      sobre: 'Sobre',
      experiencia: 'Experiência',
      projetos: 'Projetos',
      tecnologias: 'Skillset',
      contato: 'Contato',
    })
  })

  it('nav en traduz os 5 rótulos das âncoras', () => {
    expect(layoutEn.nav).toEqual({
      label: 'Main navigation',
      sobre: 'About',
      experiencia: 'Experience',
      projetos: 'Projects',
      tecnologias: 'Skillset',
      contato: 'Contact',
    })
  })

  it('footer traz o copyright em pt e en', () => {
    expect(layoutPt.footer.copyright).toBe(
      '2026 Alex Alves · construído com Nuxt e publicado no GitHub Pages',
    )
    expect(layoutEn.footer.copyright).toBe(
      '2026 Alex Alves · Built with Nuxt and published on GitHub Pages',
    )
  })

  it('está registrado no Dictionary de pt e en', () => {
    expect(getDictionary('pt').sections.layout).toBe(layoutPt)
    expect(getDictionary('en').sections.layout).toBe(layoutEn)
  })
})

describe('módulo experience', () => {
  it('chips da Tedsys carregam a stack completa e espelham pt na tradução en', () => {
    const tedsysEn = getDictionary('en').sections.experience.items.find(
      (i) => i.company === 'Tedsys',
    )
    const tedsysPt = getDictionary('pt').sections.experience.items.find(
      (i) => i.company === 'Tedsys',
    )
    expect(tedsysEn?.chips).toEqual(['PHP', 'Laminas', 'Vue 3', 'Firebird', 'n8n', 'RAG', 'OCR', 'Bitrix', 'Jira', 'AWS'])
    expect(tedsysEn?.chips).toEqual(tedsysPt?.chips)
  })
})

describe('SiteHeader', () => {
  function montar() {
    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    const app = createApp(SiteHeader)
    app.component('LangToggle', { template: '<button data-testid="lang-toggle-stub" />' })
    app.mount(raiz)
    return { app, raiz }
  }

  afterEach(() => {
    document.body.innerHTML = ''
    if (h.localeRef) h.localeRef.value = 'pt'
  })

  it('renderiza as 5 âncoras com os rótulos pt por padrão', () => {
    const { raiz, app } = montar()

    const rotulos = [...raiz.querySelectorAll('.site-header__link')].map(
      (a) => a.textContent?.trim(),
    )
    expect(rotulos).toEqual(['Sobre', 'Experiência', 'Projetos', 'Skillset', 'Contato'])
    const hrefs = [...raiz.querySelectorAll('.site-header__link')].map((a) =>
      a.getAttribute('href'),
    )
    expect(hrefs).toEqual(['#sobre', '#experiencia', '#projetos', '#skillset', '#contato'])

    app.unmount()
  })

  it('troca os rótulos pra en quando setLocale("en") roda, sem remontar', async () => {
    const { raiz, app } = montar()

    const { useLocale } = await import('../app/composables/useLocale')
    useLocale().setLocale('en')
    await nextTick()

    const rotulos = [...raiz.querySelectorAll('.site-header__link')].map(
      (a) => a.textContent?.trim(),
    )
    expect(rotulos).toEqual(['About', 'Experience', 'Projects', 'Skillset', 'Contact'])

    app.unmount()
  })

  it('traduz o aria-label da navegação', async () => {
    const { raiz, app } = montar()

    const nav = raiz.querySelector('nav')
    expect(nav?.getAttribute('aria-label')).toBe('Navegação principal')

    const { useLocale } = await import('../app/composables/useLocale')
    useLocale().setLocale('en')
    await nextTick()

    expect(nav?.getAttribute('aria-label')).toBe('Main navigation')

    app.unmount()
  })
})

describe('SiteHeader (CSS editorial)', () => {
  const fonte = readFileSync(
    join(import.meta.dirname, '..', 'app', 'components', 'SiteHeader.vue'),
    'utf-8',
  )

  it('links da nav em tinta plena com hover em violeta profundo', () => {
    const link = fonte.match(/\.site-header__link\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(link).toContain('color: var(--color-ink)')
    const hover = fonte.match(/\.site-header__link:hover\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(hover).toContain('color: var(--color-accent-deep)')
  })

  it('nenhum hex cru no componente, tudo via token', () => {
    expect(fonte).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

describe('SiteFooter (CSS editorial)', () => {
  const fonte = readFileSync(
    join(import.meta.dirname, '..', 'app', 'components', 'SiteFooter.vue'),
    'utf-8',
  )

  it('rodapé é seção preta com o token void, wordmark em papel e copyright claro', () => {
    const rodape = fonte.match(/\.site-footer\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(rodape).toContain('background: var(--color-void)')
    expect(rodape).toMatch(/--focus-ring:\s*2px solid var\(--color-accent\)/)
    const wordmark = fonte.match(/\.site-footer__wordmark\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(wordmark).toContain('color: var(--color-paper)')
    const texto = fonte.match(/\.site-footer__texto\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(texto).toContain('color: var(--color-text-muted)')
  })

  it('borda de topo em tom claro sutil e nenhum hex cru no componente', () => {
    const rodape = fonte.match(/\.site-footer\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(rodape).toMatch(/border-top:\s*1px solid color-mix\(in srgb, var\(--color-text\)/)
    expect(fonte).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

describe('SiteFooter brilho (CSS editorial)', () => {
  const fonte = readFileSync(
    join(import.meta.dirname, '..', 'app', 'components', 'SiteFooter.vue'),
    'utf-8',
  )

  it('colunas de luz em violeta via token, com gradiente linear e radial empilhados', () => {
    const coluna = fonte.match(/\.site-footer__coluna\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(coluna).toContain('linear-gradient')
    expect(coluna).toContain('var(--color-accent)')
    const poca = fonte.match(/\.site-footer__brilho\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(poca).toContain('radial-gradient')
  })

  it('bordas de coluna em pontilhado fino com repeating-linear-gradient', () => {
    const borda = fonte.match(/\.site-footer__coluna-borda\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(borda).toContain('repeating-linear-gradient')
    expect(borda).toContain('var(--color-accent)')
  })

  it('grão de noise embutido como data URI SVG com feTurbulence, sem asset externo', () => {
    const grao = fonte.match(/\.site-footer__grao\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(grao).toContain('data:image/svg+xml')
    expect(grao).toContain('feTurbulence')
  })

  it('camada de brilho anima só opacity, sem repaint pesado', () => {
    const brilho = fonte.match(/\.site-footer__brilho\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(brilho).toContain('will-change: opacity')
  })

  it('nenhum hex cru no brilho nem no grão', () => {
    expect(fonte).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

describe('SiteFooter brilho ligado a rolagem', () => {
  function montar({ reduzido = false }: { reduzido?: boolean } = {}) {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () =>
        ({
          matches: reduzido,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as MediaQueryList,
    )

    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    const app = createApp(SiteFooter)
    app.mount(raiz)
    return { app, raiz }
  }

  function definirRolagem(scrollY: number): void {
    Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 5000,
      configurable: true,
    })
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })
  }

  afterEach(() => {
    document.body.innerHTML = ''
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    vi.restoreAllMocks()
  })

  it('comeca apagado com a pagina no topo', () => {
    definirRolagem(0)
    const { raiz, app } = montar()

    const brilho = raiz.querySelector('[data-testid="footer-brilho"]') as HTMLElement
    expect(brilho).toBeTruthy()
    expect(brilho.style.opacity).toBe('0')

    app.unmount()
  })

  it('fica aceso por completo quando a rolagem chega ao fim da pagina', async () => {
    definirRolagem(0)
    const { raiz, app } = montar()

    definirRolagem(5000)
    window.dispatchEvent(new Event('scroll'))
    await nextTick()

    const brilho = raiz.querySelector('[data-testid="footer-brilho"]') as HTMLElement
    expect(brilho.style.opacity).toBe('1')

    app.unmount()
  })

  it('reduced motion deixa o brilho estatico num brilho medio, sem ouvir rolagem', async () => {
    definirRolagem(5000)
    const { raiz, app } = montar({ reduzido: true })
    await nextTick()

    const brilho = raiz.querySelector('[data-testid="footer-brilho"]') as HTMLElement
    expect(Number(brilho.style.opacity)).toBeCloseTo(0.5, 5)

    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(Number(brilho.style.opacity)).toBeCloseTo(0.5, 5)

    app.unmount()
  })
})

describe('SiteFooter', () => {
  function montar() {
    const raiz = document.createElement('div')
    document.body.appendChild(raiz)
    const app = createApp(SiteFooter)
    app.mount(raiz)
    return { app, raiz }
  }

  afterEach(() => {
    document.body.innerHTML = ''
    if (h.localeRef) h.localeRef.value = 'pt'
  })

  it('renderiza o copyright pt por padrão', () => {
    const { raiz, app } = montar()

    const texto = raiz.querySelector('[data-testid="site-footer"] p')?.textContent?.trim()
    expect(texto).toBe('2026 Alex Alves · construído com Nuxt e publicado no GitHub Pages')

    app.unmount()
  })

  it('troca o copyright pra en quando setLocale("en") roda', async () => {
    const { raiz, app } = montar()

    const { useLocale } = await import('../app/composables/useLocale')
    useLocale().setLocale('en')
    await nextTick()

    const texto = raiz.querySelector('[data-testid="site-footer"] p')?.textContent?.trim()
    expect(texto).toBe('2026 Alex Alves · Built with Nuxt and published on GitHub Pages')

    app.unmount()
  })
})
