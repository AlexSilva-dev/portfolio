import { beforeEach, describe, expect, it, vi } from 'vitest'
import { unref } from 'vue'

type VNodeLike = { value: unknown }

const h = vi.hoisted(() => ({
  stateMap: new Map<string, VNodeLike>(),
  preloadedState: new Map<string, unknown>(),
  cookieRefs: new Map<string, VNodeLike>(),
  cookieOptions: new Map<string, Record<string, unknown>>(),
  headOptions: [] as Array<Record<string, unknown>>,
}))

vi.mock('nuxt/app', async () => {
  const { computed, ref } = await import('vue')
  return {
    computed,
    tryUseNuxtApp: () => ({}),
    useState: (key: string, init: () => VNodeLike) => {
      // Emula o Nuxt real: estado vindo do payload de prerender ignora o
      // inicializador, exatamente o que acontece na hidratação de um site SSG.
      if (h.preloadedState.has(key)) {
        if (!h.stateMap.has(key)) h.stateMap.set(key, ref(h.preloadedState.get(key)))
        return h.stateMap.get(key)
      }
      if (!h.stateMap.has(key)) h.stateMap.set(key, ref(init()))
      return h.stateMap.get(key)
    },
    useCookie: (name: string, options?: Record<string, unknown>) => {
      const opts = options ?? {}
      h.cookieOptions.set(name, opts)
      if (!h.cookieRefs.has(name)) {
        const fallback = typeof opts.default === 'function' ? (opts.default as () => unknown)() : null
        h.cookieRefs.set(name, ref(fallback))
      }
      return h.cookieRefs.get(name)
    },
    useHead: (options: Record<string, unknown>) => {
      h.headOptions.push(options)
      return {}
    },
  }
})

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { getDictionary, locales } from '../app/i18n'
import { useLocale } from '../app/composables/useLocale'
import * as hero from '../app/i18n/sections/hero'
import * as experience from '../app/i18n/sections/experience'
import * as projects from '../app/i18n/sections/projects'
import * as about from '../app/i18n/sections/about'
import * as tech from '../app/i18n/sections/tech'
import * as contact from '../app/i18n/sections/contact'
import * as notfound from '../app/i18n/sections/notfound'

const sectionModules = [
  ['hero', hero],
  ['experience', experience],
  ['projects', projects],
  ['about', about],
  ['tech', tech],
  ['contact', contact],
  ['notfound', notfound],
] as const

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

beforeEach(() => {
  h.stateMap.clear()
  h.preloadedState.clear()
  h.cookieRefs.clear()
  h.cookieOptions.clear()
  h.headOptions.length = 0
})

describe('módulos de seção', () => {
  it('exporta pt e en nos 7 módulos esperados', () => {
    expect(sectionModules).toHaveLength(7)
    for (const [, mod] of sectionModules) {
      expect(mod.pt, 'módulo deve exportar pt').toBeTruthy()
      expect(mod.en, 'módulo deve exportar en').toBeTruthy()
    }
  })

  for (const [name, mod] of sectionModules) {
    it(`"${name}" tem paridade de chaves entre pt e en`, () => {
      assertSameShape(mod.pt, mod.en, name)
    })
  }
})

describe('getDictionary', () => {
  it('retorna o dicionário pt com meta de title e description', () => {
    const dict = getDictionary('pt')
    expect(dict.meta.title).toBe('Alex Alves · Engenheiro de Software Full Stack')
    expect(dict.meta.description.length).toBeGreaterThan(0)
    expect(dict.sections.hero).toBe(hero.pt)
  })

  it('retorna o dicionário en com a mesma estrutura do pt', () => {
    const dict = getDictionary('en')
    assertSameShape(getDictionary('pt'), dict, 'dictionary')
    expect(dict.sections.hero).toBe(hero.en)
  })
})

describe('useLocale', () => {
  it('primeira visita sem cookie nasce em pt', () => {
    const { locale, dictionary } = useLocale()
    expect(locale.value).toBe('pt')
    expect(dictionary.value.meta.title).toBe('Alex Alves · Engenheiro de Software Full Stack')
  })

  it('cookie com valor inválido faz fallback para pt', () => {
    h.cookieRefs.set('locale', { value: 'es' } as VNodeLike)
    const { locale } = useLocale()
    expect(locale.value).toBe('pt')
  })

  it('cookie com en válido inicializa em en', () => {
    h.cookieRefs.set('locale', { value: 'en' } as VNodeLike)
    const { locale, dictionary } = useLocale()
    expect(locale.value).toBe('en')
    expect(dictionary.value.sections.hero).toBe(hero.en)
  })

  it('cookie é gravado com path / e maxAge de 1 ano', () => {
    const { setLocale } = useLocale()
    setLocale('en')
    expect(h.cookieOptions.get('locale')?.path).toBe('/')
    expect(h.cookieOptions.get('locale')?.maxAge).toBe(60 * 60 * 24 * 365)
    expect(unref(h.cookieRefs.get('locale') as VNodeLike)).toBe('en')
  })

  it('hidratação com payload congelado em pt e cookie en restaura en (persistência)', () => {
    // Site SSG, o useState foi serializado no payload do build com pt
    h.preloadedState.set('locale', 'pt')
    // o browser tem o cookie gravado pelo toggle em visita anterior
    h.cookieRefs.set('locale', { value: 'en' } as VNodeLike)
    const { locale, dictionary } = useLocale()
    expect(locale.value).toBe('en')
    expect(dictionary.value.sections.hero).toBe(hero.en)
  })

  it('setLocale("en") troca o dicionário retornado sem recarregar', () => {
    const { locale, dictionary, setLocale } = useLocale()
    expect(dictionary.value.sections.hero).toBe(hero.pt)
    setLocale('en')
    expect(locale.value).toBe('en')
    expect(dictionary.value.sections.hero).toBe(hero.en)
  })

  it('setLocale atualiza o title e a description do useHead reativamente', () => {
    const { setLocale } = useLocale()
    setLocale('en')
    const head = h.headOptions[h.headOptions.length - 1]
    const metaList = head.meta as Array<{ name: string; content: unknown }>
    expect(unref(head.title as VNodeLike)).toBe('Alex Alves · Full Stack Software Engineer')
    const description = metaList.find((m) => m.name === 'description')
    expect(unref(description?.content as VNodeLike)).toBe(getDictionary('en').meta.description)
  })

  it('setLocale emite aviso de troca para aria-live', () => {
    const { announcement, setLocale } = useLocale()
    expect(announcement.value).toBe('')
    setLocale('en')
    expect(announcement.value.length).toBeGreaterThan(0)
    expect(announcement.value).toBe(getDictionary('en').meta.languageSwitched)
  })

  it('locales aceita apenas pt e en', () => {
    expect(locales).toEqual(['pt', 'en'])
  })
})

describe('layout default', () => {
  // O layout depende do runtime do Nuxt (auto-import de ClientOnly), então o
  // contrato de a11y é validado no template, e o binding do announcement é
  // coberto pelos testes do composable acima.
  const layoutSource = readFileSync(join(process.cwd(), 'app/layouts/default.vue'), 'utf-8')

  it('template tem região role status com aria-live polite', () => {
    expect(layoutSource).toMatch(/role="status"/)
    expect(layoutSource).toMatch(/aria-live="polite"/)
  })

  it('região status está ligada ao announcement do useLocale', () => {
    expect(layoutSource).toMatch(/\{\{\s*announcement\s*\}\}/)
    expect(layoutSource).toMatch(/useLocale\(\)/)
  })
})
