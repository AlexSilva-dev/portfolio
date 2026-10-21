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

describe('dicionário hero', () => {
  it('pt tem os textos exatos da ui-spec', () => {
    expect(heroPt.kicker).toBe('Sócio-fundador e responsável técnico na AdSalesBrazil')
    expect(heroPt.h1).toBe('Engenheiro de Software Full Stack')
    expect(heroPt.specialties).toBe('Kotlin, Android e Vue.js')
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
    expect(heroEn.h1).toBe('Full Stack Software Engineer')
    expect(heroEn.specialties).toBe('Kotlin, Android and Vue.js')
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

  it('renderiza kicker, selo, título, especialidades e sub em pt', () => {
    const root = montar('pt')
    expect(root.querySelector('[data-testid="hero-kicker"]')?.textContent).toBe(
      'Sócio-fundador e responsável técnico na AdSalesBrazil',
    )
    expect(root.querySelector('[data-testid="hero-badge"]')?.textContent?.trim()).toBe(
      'Disponível pra oportunidades',
    )
    expect(root.querySelector('[data-testid="hero-title"]')?.textContent).toBe(
      'Engenheiro de Software Full Stack',
    )
    expect(root.querySelector('[data-testid="hero-specialties"]')?.textContent).toBe(
      'Kotlin, Android e Vue.js',
    )
    expect(root.querySelector('[data-testid="hero-sub"]')?.textContent).toBe(
      'Há 3 anos levo produto do zero à produção, do app Android ao backend com IA.',
    )
  })

  it('renderiza em en com números em real sem conversão', () => {
    const root = montar('en')
    expect(root.querySelector('[data-testid="hero-title"]')?.textContent).toBe(
      'Full Stack Software Engineer',
    )
    expect(root.textContent).toContain('R$ 15 mil')
  })

  it('renderiza os 3 números', () => {
    const root = montar('pt')
    const valores = [...root.querySelectorAll('[data-testid="stat-valor"]')].map(
      (el) => el.textContent,
    )
    expect(valores).toEqual(['R$ 15 mil', '80%', '3'])
  })

  it('CTA primário aponta pro mailto e secundário pra âncora de experiência', () => {
    const root = montar('pt')
    const primario = root.querySelector('[data-testid="hero-cta-primary"]') as HTMLAnchorElement
    const secundario = root.querySelector('[data-testid="hero-cta-secondary"]') as HTMLAnchorElement
    expect(primario.getAttribute('href')).toBe('mailto:alexdsilva.dev@gmail.com')
    expect(secundario.getAttribute('href')).toBe('#experiencia')
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
})
