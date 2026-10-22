import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'

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

import { pt as heroPt, en as heroEn } from '../app/i18n/sections/hero'
import HeroSection from '../app/components/HeroSection.vue'
import StatCard from '../app/components/StatCard.vue'

const STATS_PT = [
  { valor: 'R$ 15 mil', rotulo: 'recuperados por mês com a queda de inadimplência' },
  { valor: '80%', rotulo: 'do atendimento resolvido por pipeline de IA' },
  { valor: '3', rotulo: 'anos de experiência com produto em produção' },
]

const STATS_EN = [
  { valor: 'R$ 15 mil', rotulo: 'recovered per month by reducing delinquency' },
  { valor: '80%', rotulo: 'of support resolved by an AI pipeline' },
  { valor: '3', rotulo: 'years of experience with product in production' },
]

const CHIPS = ['Kotlin', 'Android', 'Vue.js', 'IA aplicada', 'DevOps']

describe('dicionário hero', () => {
  it('pt tem os textos exatos da ui-spec', () => {
    expect(heroPt.kicker).toBe('Sócio-fundador e responsável técnico na AdSalesBrazil')
    expect(heroPt.sub).toBe(
      'Há 3 anos levo produto do zero à produção, do app Android ao backend com IA.',
    )
    expect(heroPt.badge).toBe('Disponível pra oportunidades')
    expect(heroPt.ctas.primary).toBe('Vamos conversar')
    expect(heroPt.ctas.secondary).toBe('Ver experiência')
  })

  it('pt tem os 3 números com rótulos exatos', () => {
    expect(heroPt.stats).toEqual(STATS_PT)
  })

  it('en traduz os textos e mantém os números em real sem conversão', () => {
    expect(heroEn.kicker).toBe('Co-founder and technical lead at AdSalesBrazil')
    expect(heroEn.sub).toBe(
      'For 3 years I have taken product from zero to production, from the Android app to the AI backend.',
    )
    expect(heroEn.badge).toBe('Available for opportunities')
    expect(heroEn.ctas.primary).toBe("Let's talk")
    expect(heroEn.ctas.secondary).toBe('See experience')
    expect(heroEn.stats.map((s) => s.valor)).toEqual(['R$ 15 mil', '80%', '3'])
  })

  it('en tem os rótulos dos 3 números traduzidos', () => {
    expect(heroEn.stats).toEqual(STATS_EN)
  })
})

describe('StatCard', () => {
  function montar(props: { valor: string, rotulo: string }) {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp({ render: () => h(StatCard, props) })
    app.mount(root)
    return root
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renderiza número e rótulo com data-testid', () => {
    const root = montar(STATS_PT[0])
    const card = root.querySelector('[data-testid="stat-card"]')
    expect(card).not.toBeNull()
    expect(card?.querySelector('[data-testid="stat-valor"]')?.textContent).toBe('R$ 15 mil')
    expect(card?.querySelector('[data-testid="stat-rotulo"]')?.textContent).toBe(
      'recuperados por mês com a queda de inadimplência',
    )
  })

  it('renderiza os 3 números da ui-spec', () => {
    for (const stat of STATS_PT) {
      const root = montar(stat)
      expect(root.textContent).toContain(stat.valor)
      expect(root.textContent).toContain(stat.rotulo)
      document.body.innerHTML = ''
    }
  })
})

describe('HeroSection', () => {
  function montar(locale: 'pt' | 'en') {
    const { locale: localeRef } = useLocale()
    localeRef.value = locale
    setLocaleMock.mockClear()
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(HeroSection)
    app.mount(root)
    return root
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renderiza kicker e selo de disponibilidade com dot verde em pt', () => {
    const root = montar('pt')
    expect(root.querySelector('[data-testid="hero-kicker"]')?.textContent).toBe(
      'Sócio-fundador e responsável técnico na AdSalesBrazil',
    )
    const badge = root.querySelector('[data-testid="hero-badge"]')
    expect(badge?.textContent?.trim()).toBe('Disponível pra oportunidades')
    expect(badge?.querySelector('.hero__badge-dot')).not.toBeNull()
  })

  it('renderiza kicker e sub em en', () => {
    const root = montar('en')
    expect(root.querySelector('[data-testid="hero-kicker"]')?.textContent).toBe(
      'Co-founder and technical lead at AdSalesBrazil',
    )
    expect(root.querySelector('[data-testid="hero-sub"]')?.textContent).toBe(
      'For 3 years I have taken product from zero to production, from the Android app to the AI backend.',
    )
  })

  it('nome em display de 2 linhas Alex e Alves', () => {
    const root = montar('pt')
    const linhas = [...root.querySelectorAll('[data-testid="hero-title"] .hero__titulo-linha')]
    expect(linhas).toHaveLength(2)
    expect(linhas[0].textContent).toBe('Alex')
    expect(linhas[1].textContent).toBe('Alves')
  })

  it('renderiza os 5 chips de especialidade na ordem da spec', () => {
    const root = montar('pt')
    const chips = [...root.querySelectorAll('[data-testid="hero-chip"]')].map(
      (el) => el.textContent?.trim(),
    )
    expect(chips).toEqual(CHIPS)
  })

  it('renderiza os 3 números com rótulos preenchidos', () => {
    const root = montar('pt')
    const valores = [...root.querySelectorAll('[data-testid="stat-valor"]')].map(
      (el) => el.textContent,
    )
    expect(valores).toEqual(['R$ 15 mil', '80%', '3'])
    const rotulos = [...root.querySelectorAll('[data-testid="stat-rotulo"]')].map(
      (el) => el.textContent?.trim() ?? '',
    )
    expect(rotulos).toEqual(STATS_PT.map((s) => s.rotulo))
  })

  it('CTA primário aponta pro mailto e secundário pra âncora de experiência', () => {
    const root = montar('pt')
    const primario = root.querySelector('[data-testid="hero-cta-primary"]') as HTMLAnchorElement
    const secundario = root.querySelector('[data-testid="hero-cta-secondary"]') as HTMLAnchorElement
    expect(primario.getAttribute('href')).toBe('mailto:alexdsilva.dev@gmail.com')
    expect(primario.textContent?.trim()).toBe('Vamos conversar')
    expect(secundario.getAttribute('href')).toBe('#experiencia')
    expect(secundario.textContent?.trim()).toBe('Ver experiência')
  })

  it('foto tem dimensões 768x960 declaradas e alt descritivo em pt', () => {
    const root = montar('pt')
    const foto = root.querySelector('[data-testid="hero-photo"]') as HTMLImageElement
    expect(foto).not.toBeNull()
    expect(foto.getAttribute('width')).toBe('768')
    expect(foto.getAttribute('height')).toBe('960')
    expect(foto.getAttribute('alt')?.length ?? 0).toBeGreaterThan(10)
    expect(foto.getAttribute('alt')).toContain('Alex')
  })

  it('alt da foto muda com o idioma e é real nos dois', () => {
    const altPt = montar('pt').querySelector('[data-testid="hero-photo"]')?.getAttribute('alt')
    document.body.innerHTML = ''
    const altEn = montar('en').querySelector('[data-testid="hero-photo"]')?.getAttribute('alt')
    expect(altPt).toBeTruthy()
    expect(altEn).toBeTruthy()
    expect(altPt).not.toBe(altEn)
  })

  it('linha fina de 1px sob o header no topo do hero', () => {
    const root = montar('pt')
    expect(root.querySelector('[data-testid="hero-rule"]')).not.toBeNull()
  })
})

describe('HeroSection composição editorial (CSS)', () => {
  const css = readFileSync(
    join(import.meta.dirname, '..', 'app', 'components', 'HeroSection.vue'),
    'utf-8',
  )

  it('display do nome entre 11 e 13vw, peso alto e entrelinha apertada em 2 blocos', () => {
    const tamanho = css.match(/\.hero__titulo\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(tamanho).toMatch(/font-size:\s*clamp\([^,]*,\s*12vw,\s*[^)]*\)/)
    expect(tamanho).toMatch(/font-weight:\s*800/)
    expect(tamanho).toMatch(/line-height:\s*0\.9/)
    const linha = css.match(/\.hero__titulo-linha\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(linha).toMatch(/display:\s*block/)
  })

  it('foto em escala de cinza cobrindo a meia tela com altura da dobra', () => {
    expect(css).toMatch(/filter:\s*grayscale\(1\)/)
    expect(css).toMatch(/object-fit:\s*cover/)
    expect(css).toMatch(/min-height:\s*100dvh/)
  })

  it('chips em caixa com borda de 1px e container que quebra em 2 fileiras', () => {
    const chip = css.match(/\.hero__chip\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(chip).toMatch(/border:\s*1px solid/)
    const chips = css.match(/\.hero__chips\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(chips).toMatch(/flex-wrap:\s*wrap/)
  })

  it('números em linha mono com réguas finas de 1px', () => {
    const stat = css.match(/\.hero__stat\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(stat).toMatch(/border-top:\s*1px solid/)
    const valor = css.match(/\.hero__stat-valor\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(valor).toMatch(/font-family:\s*var\(--font-mono\)/)
  })

  it('CTA primário sólido tinta e secundário fantasma', () => {
    const primario = css.match(/\.hero__cta--primario\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(primario).toMatch(/background:\s*var\(--color-ink\)/)
    expect(primario).toMatch(/color:\s*var\(--color-paper\)/)
    const secundario = css.match(/\.hero__cta--secundario\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(secundario).toMatch(/border:\s*1px solid var\(--color-ink\)/)
    expect(secundario).not.toMatch(/background:\s*var\(--color-ink\)/)
  })

  it('nenhum hex cru no componente, cor só via token', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('mobile mantém grade compacta, foto abaixo e CTAs full width', () => {
    const bloco = css.match(/@media \(max-width: 767px\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(bloco).toMatch(/grid-template-columns:\s*1fr/)
    expect(bloco).toMatch(/order:\s*2/)
    expect(bloco).toMatch(/flex:\s*1 1 100%/)
  })
})
