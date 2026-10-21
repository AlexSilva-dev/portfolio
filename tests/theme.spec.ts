import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { contrastRatio } from '../app/utils/contrast'
import LangToggle from '../app/components/LangToggle.vue'

// Contrato do useLocale (task 2) mockado no arquivo físico, que é exatamente
// o módulo que o auto-import do Nuxt resolve dentro do SFC. O locale é um
// ref real porque o template do componente conta com o unwrap de refs
const { setLocaleMock } = vi.hoisted(() => ({ setLocaleMock: vi.fn() }))
vi.mock('../app/composables/useLocale', async () => {
  const { ref } = await import('vue')
  const localeRef = ref('pt')
  return { useLocale: () => ({ locale: localeRef, setLocale: setLocaleMock }) }
})
import { useLocale } from '../app/composables/useLocale'

const tokensPath = join(import.meta.dirname, '..', 'app', 'assets', 'css', 'tokens.css')

function readToken(name: string): string {
  const css = readFileSync(tokensPath, 'utf-8')
  const match = css.match(new RegExp(`--${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`))
  if (!match) {
    throw new Error(`token --${name} não definido em tokens.css`)
  }
  return match[1]
}

describe('contrastRatio', () => {
  it('retorna 21 para branco contra preto', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1)
  })

  it('retorna 1 para a mesma cor', () => {
    expect(contrastRatio('#8B7A9F', '#8B7A9F')).toBeCloseTo(1, 2)
  })

  it('lança erro claro para hex inválido', () => {
    expect(() => contrastRatio('azul', '#000000')).toThrow(/inválida/)
    expect(() => contrastRatio('#12345', '#000000')).toThrow(/inválida/)
  })
})

describe('pares de contraste dos tokens', () => {
  const pares = [
    { fg: 'color-text', bg: 'color-bg', min: 4.5 },
    { fg: 'color-accent', bg: 'color-bg', min: 4.5 },
    { fg: 'color-text', bg: 'color-surface', min: 4.5 },
    { fg: 'color-text-muted', bg: 'color-bg', min: 4.5 },
    { fg: 'color-text-muted', bg: 'color-surface', min: 4.5 },
  ] as const

  for (const { fg, bg, min } of pares) {
    it(`${fg} contra ${bg} atinge no mínimo ${min}`, () => {
      const razao = contrastRatio(readToken(fg), readToken(bg))
      expect(razao).toBeGreaterThanOrEqual(min)
    })
  }
})

describe('tokens do tema', () => {
  it('declara o accent extraído da foto', () => {
    expect(readToken('color-accent').toUpperCase()).toBe('#8B7A9F')
  })

  it('declara o foco de 2px violeta', () => {
    const css = readFileSync(tokensPath, 'utf-8')
    expect(css).toMatch(/--focus-ring\s*:\s*2px solid (var\()?--color-accent/)
  })
})

describe('uso de tokens no Preloader', () => {
  const preloaderPath = join(import.meta.dirname, '..', 'app', 'components', 'Preloader.vue')

  it('cortina usa os tokens de tokens.css e não as vars legadas', () => {
    const css = readFileSync(preloaderPath, 'utf-8')
    expect(css).not.toMatch(/var\(--color-background\)/)
    expect(css).not.toMatch(/var\(--color-heading\)/)
    expect(css).toMatch(/background:\s*var\(--color-bg\)/)
    expect(css).toMatch(/color:\s*var\(--color-text\)/)
  })
})

describe('LangToggle', () => {
  function montar(localeInicial: string) {
    const { locale } = useLocale()
    locale.value = localeInicial as 'pt' | 'en'
    setLocaleMock.mockClear()
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(LangToggle)
    app.mount(root)
    return { root, setLocale: setLocaleMock, app }
  }

  function botao(root: HTMLElement, teste: string) {
    const el = root.querySelector(`[data-testid="${teste}"]`)
    if (!el) throw new Error(`botão ${teste} não encontrado`)
    return el as HTMLButtonElement
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('marca o idioma ativo com aria-pressed', () => {
    const { root, app } = montar('pt')
    expect(botao(root, 'lang-toggle-pt').getAttribute('aria-pressed')).toBe('true')
    expect(botao(root, 'lang-toggle-en').getAttribute('aria-pressed')).toBe('false')
    expect(botao(root, 'lang-toggle-pt').classList.contains('is-active')).toBe(true)
    expect(botao(root, 'lang-toggle-en').classList.contains('is-active')).toBe(false)
    app.unmount()
  })

  it('marca o outro idioma quando ele está ativo', () => {
    const { root, app } = montar('en')
    expect(botao(root, 'lang-toggle-en').getAttribute('aria-pressed')).toBe('true')
    expect(botao(root, 'lang-toggle-pt').classList.contains('is-active')).toBe(false)
    app.unmount()
  })

  it('clicar no outro idioma chama setLocale com ele', () => {
    const { root, setLocale, app } = montar('pt')
    botao(root, 'lang-toggle-en').click()
    expect(setLocale).toHaveBeenCalledWith('en')
    app.unmount()
  })

  it('clicar no idioma já ativo chama setLocale com ele', () => {
    const { root, setLocale, app } = montar('pt')
    botao(root, 'lang-toggle-pt').click()
    expect(setLocale).toHaveBeenCalledWith('pt')
    app.unmount()
  })
})
