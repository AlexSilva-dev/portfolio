import { afterEach, describe, expect, it, vi } from 'vitest'
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
  it('chip de IA da Tedsys vira AI na tradução en', () => {
    const tedsys = layoutEn && getDictionary('en').sections.experience.items.find(
      (i) => i.company === 'Tedsys',
    )
    expect(tedsys?.chips).toEqual(['PHP', 'Vue 3', 'AI'])
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
