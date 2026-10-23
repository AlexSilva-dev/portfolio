import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type Component } from 'vue'

// Mesma estratégia do index.spec: o mock aponta para o arquivo físico do
// composable, que é o módulo que o auto-import do Nuxt resolve no SFC.
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

import MarqueeStrip, {
  calcularDuracaoMarquee,
  DURACAO_MINIMA_S,
  VELOCIDADE_MARQUEE_PX_S,
} from '../app/components/MarqueeStrip.vue'
import { getDictionary } from '../app/i18n'
import { useLocale } from '../app/composables/useLocale'
import IndexPage from '../app/pages/index.vue'

const fonteStrip = () =>
  readFileSync(join(process.cwd(), 'app', 'components', 'MarqueeStrip.vue'), 'utf-8')

const PALAVRAS = ['KOTLIN', 'ANDROID', 'VUE.JS', 'TYPESCRIPT', 'RAILS', 'IA APLICADA', 'DEVOPS']

function montarStrip({ reduzido = false }: { reduzido?: boolean } = {}) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    () =>
      ({
        matches: reduzido,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  )
  const raiz = document.createElement('div')
  document.body.appendChild(raiz)
  const app = createApp(MarqueeStrip as Component, {
    palavras: PALAVRAS,
    ariaLabel: 'Stack em destaque',
  })
  app.mount(raiz)
  return { app, raiz }
}

function montarIndex(locale: 'pt' | 'en') {
  const { locale: localeRef } = useLocale()
  localeRef.value = locale
  const raiz = document.createElement('div')
  document.body.appendChild(raiz)
  const app = createApp(IndexPage as Component)
  app.mount(raiz)
  return raiz
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('calcularDuracaoMarquee', () => {
  it('velocidade constante exige duracao proporcional a largura do conteudo', () => {
    expect(calcularDuracaoMarquee(2400, 80)).toBe(30)
    expect(calcularDuracaoMarquee(2400, 40)).toBe(60)
    expect(calcularDuracaoMarquee(1600, VELOCIDADE_MARQUEE_PX_S)).toBe(20)
  })

  it('conteudo curto nao vira carrossel frenetico, ha duracao minima', () => {
    expect(calcularDuracaoMarquee(80, 80)).toBe(DURACAO_MINIMA_S)
    expect(calcularDuracaoMarquee(1, 1000)).toBe(DURACAO_MINIMA_S)
  })

  it('rejeita largura ou velocidade nao positivas com erro claro', () => {
    expect(() => calcularDuracaoMarquee(0, 80)).toThrow(RangeError)
    expect(() => calcularDuracaoMarquee(2400, 0)).toThrow(RangeError)
    expect(() => calcularDuracaoMarquee(-100, 80)).toThrow(RangeError)
    expect(() => calcularDuracaoMarquee(2400, -80)).toThrow(RangeError)
  })

  it('rejeita entrada nao finita com erro claro, nunca NaN em segundos', () => {
    expect(() => calcularDuracaoMarquee(Number.NaN, 80)).toThrow(RangeError)
    expect(() => calcularDuracaoMarquee(Number.POSITIVE_INFINITY, 80)).toThrow(RangeError)
    expect(() => calcularDuracaoMarquee(2400, Number.NaN)).toThrow(RangeError)
  })
})

describe('MarqueeStrip — loop perfeito e acessibilidade', () => {
  it('duplica o conteudo em copia aria-hidden, com o original acessivel', () => {
    const { raiz, app } = montarStrip()
    const grupos = raiz.querySelectorAll('[data-testid="marquee-grupo"]')
    expect(grupos).toHaveLength(2)
    const original = grupos[0] as HTMLElement
    const copia = grupos[1] as HTMLElement
    expect(original.getAttribute('aria-hidden')).toBeNull()
    expect(copia.getAttribute('aria-hidden')).toBe('true')
    expect(original.textContent?.trim()).toBe(copia.textContent?.trim())
    app.unmount()
  })

  it('renderiza as 7 palavras com separador entre elas', () => {
    const { raiz, app } = montarStrip()
    const grupo = raiz.querySelector('[data-testid="marquee-grupo"]') as HTMLElement
    const palavras = grupo.querySelectorAll('.marquee__palavra')
    expect(palavras).toHaveLength(PALAVRAS.length)
    const separadores = grupo.querySelectorAll('.marquee__separador')
    expect(separadores).toHaveLength(PALAVRAS.length)
    expect(grupo.textContent).toContain('KOTLIN')
    expect(grupo.textContent).toContain('DEVOPS')
    app.unmount()
  })

  it('expoe o aria-label traduzido na faixa', () => {
    const { raiz, app } = montarStrip()
    const strip = raiz.querySelector('[data-testid="marquee-strip"]')
    expect(strip?.getAttribute('aria-label')).toBe('Stack em destaque')
    app.unmount()
  })

  it('reduced motion deixa a faixa estatica com o conteudo visivel, sem loop', () => {
    const { raiz, app } = montarStrip({ reduzido: true })
    const strip = raiz.querySelector('[data-testid="marquee-strip"]')
    expect(strip?.classList.contains('marquee--estatico')).toBe(true)
    // conteudo continua no DOM, visivel
    const palavras = raiz.querySelectorAll('.marquee__palavra')
    expect(palavras.length).toBeGreaterThan(0)
    app.unmount()
  })
})

describe('MarqueeStrip — visual editorial (CSS)', () => {
  const fonte = () => fonteStrip()

  it('faixa full-bleed em fundo tinta via token, sem hex cru', () => {
    const css = fonte()
    expect(css).toMatch(/\.marquee\s*\{[^}]*background:\s*var\(--color-ink\)/)
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('palavras em cor de papel, alternando solido e contorno via text-stroke', () => {
    const css = fonte()
    expect(css).toMatch(/\.marquee__palavra\s*\{[^}]*color:\s*var\(--color-paper\)/)
    const contorno = css.match(/\.marquee__palavra--contorno\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(contorno).toContain('color: transparent')
    expect(contorno).toContain('-webkit-text-stroke')
    expect(contorno).toContain('var(--color-paper)')
  })

  it('texto display gigante em torno de 4,5vw com piso e teto', () => {
    const css = fonte()
    expect(css).toMatch(/font-size:\s*clamp\([^)]*4\.5vw[^)]*\)/)
  })

  it('animacao linear infinita de meia-volta no track, parada no estado estatico', () => {
    const css = fonte()
    expect(css).toMatch(/\.marquee__track\s*\{[^}]*animation:\s*marquee-deslizar\s+var\(--marquee-duracao[^)]*\)\s+linear\s+infinite/)
    expect(css).toMatch(/@keyframes\s+marquee-deslizar\s*\{[^@]*translateX\(-50%\)/)
    expect(css).toMatch(/\.marquee--estatico\s+\.marquee__track\s*\{[^}]*animation:\s*none/)
  })
})

describe('dicionário layout — faixa marquee', () => {
  it('carrega as 7 palavras da stack do dono', () => {
    const { marquee } = getDictionary('pt').sections.layout
    expect(marquee.palavras).toEqual(PALAVRAS)
  })

  it('o aria-label traduz e a paridade de palavras se mantem entre pt e en', () => {
    const pt = getDictionary('pt').sections.layout.marquee
    const en = getDictionary('en').sections.layout.marquee
    expect(pt.ariaLabel).toBe('Stack em destaque')
    expect(en.ariaLabel).toBe('Featured stack')
    expect(en.palavras).toHaveLength(pt.palavras.length)
  })
})

describe('Home — faixa entre hero e abertura narrativa', () => {
  it('a faixa monta entre o HeroSection e o SectionIntro', () => {
    const raiz = montarIndex('pt')
    const blocos = [...raiz.querySelectorAll('[data-testid="hero"], [data-testid="marquee-strip"], [data-testid="section-intro"]')]
    expect(blocos.map((b) => b.getAttribute('data-testid'))).toEqual([
      'hero',
      'marquee-strip',
      'section-intro',
    ])
  })

  it('a faixa da home recebe as palavras e o aria-label do dicionário', () => {
    const raiz = montarIndex('pt')
    const strip = raiz.querySelector('[data-testid="marquee-strip"]')
    expect(strip?.getAttribute('aria-label')).toBe(getDictionary('pt').sections.layout.marquee.ariaLabel)
    expect(strip?.textContent).toContain('KOTLIN')
  })
})
