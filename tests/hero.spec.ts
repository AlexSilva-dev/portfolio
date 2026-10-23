import { join } from 'node:path'
import { readFileSync, statSync } from 'node:fs'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { gsap } from 'gsap'

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
  { valor: '3+', rotulo: 'anos de experiência com produto em produção' },
]

const STATS_EN = [
  { valor: 'R$ 15 mil', rotulo: 'recovered per month by reducing delinquency' },
  { valor: '80%', rotulo: 'of support resolved by an AI pipeline' },
  { valor: '3+', rotulo: 'years of experience with product in production' },
]

const CHIPS_PT = ['Kotlin', 'Android', 'Vue.js', 'IA aplicada', 'DevOps']
const CHIPS_EN = ['Kotlin', 'Android', 'Vue.js', 'AI applied', 'DevOps']

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
    expect(heroEn.stats.map((s) => s.valor)).toEqual(['R$ 15 mil', '80%', '3+'])
  })

  it('en tem os rótulos dos 3 números traduzidos', () => {
    expect(heroEn.stats).toEqual(STATS_EN)
  })

  it('chips com paridade pt e en, IA aplicada como único termo traduzido', () => {
    expect(heroPt.chips).toEqual(CHIPS_PT)
    expect(heroEn.chips).toEqual(CHIPS_EN)
    expect(heroEn.chips).toHaveLength(heroPt.chips.length)
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
    expect(chips).toEqual(CHIPS_PT)
  })

  it('renderiza os chips traduzidos em en, IA aplicada vira AI applied', () => {
    const root = montar('en')
    const chips = [...root.querySelectorAll('[data-testid="hero-chip"]')].map(
      (el) => el.textContent?.trim(),
    )
    expect(chips).toEqual(CHIPS_EN)
  })

  it('renderiza os 3 números com rótulos preenchidos', () => {
    const root = montar('pt')
    const valores = [...root.querySelectorAll('[data-testid="stat-valor"]')].map(
      (el) => el.textContent,
    )
    expect(valores).toEqual(['R$ 15 mil', '80%', '3+'])
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

  it('foto usa o recorte sem fundo 768x1201 com alt descritivo em pt', () => {
    const root = montar('pt')
    const foto = root.querySelector('[data-testid="hero-photo"]') as HTMLImageElement
    expect(foto).not.toBeNull()
    expect(foto.getAttribute('src')).toMatch(/alex-cut\.png$/)
    expect(foto.getAttribute('width')).toBe('768')
    expect(foto.getAttribute('height')).toBe('1201')
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

  it('display do nome escala por largura E altura com min(), peso alto e entrelinha apertada', () => {
    const tamanho = css.match(/\.hero__titulo\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(tamanho).toMatch(/font-size:\s*min\(\s*14rem,\s*\d+vw,\s*\d+vh\s*\)/)
    expect(tamanho).toMatch(/font-weight:\s*800/)
    expect(tamanho).toMatch(/line-height:\s*0\.9/)
    const linha = css.match(/\.hero__titulo-linha\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(linha).toMatch(/display:\s*block/)
  })

  it('recorte do dono flutua em escala de cinza com altura limitada pela dobra em vh', () => {
    expect(css).toMatch(/filter:\s*grayscale\(1\)/)
    expect(css).toMatch(/object-fit:\s*contain/)
    const foto = css.match(/\.hero__foto img\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(foto).toMatch(/max-height:\s*\d+vh/)
  })

  it('chips com borda tinta e hover com borda e texto em violeta profundo', () => {
    const chip = css.match(/\.hero__chip\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(chip).toMatch(/border:\s*1px solid var\(--color-ink\)/)
    const chips = css.match(/\.hero__chips\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(chips).toMatch(/flex-wrap:\s*wrap/)
    const hover = css.match(/\.hero__chip:hover\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(hover).toMatch(/border-color:\s*var\(--color-accent-deep\)/)
    expect(hover).toMatch(/color:\s*var\(--color-accent-deep\)/)
  })

  it('kicker em violeta profundo e selo verde com borda definida', () => {
    const kicker = css.match(/\.hero__kicker\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(kicker).toMatch(/color:\s*var\(--color-accent-deep\)/)
    const badge = css.match(/\.hero__badge\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(badge).toMatch(
      /color-mix\(in srgb,\s*var\(--color-status-green\)\s*75%,\s*transparent\)/,
    )
  })

  it('números em violeta profundo com régua accent e fonte mono', () => {
    const stat = css.match(/\.hero__stat\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(stat).toMatch(/border-top:\s*1px solid var\(--color-accent\)/)
    const valor = css.match(/\.hero__stat-valor\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(valor).toMatch(/font-family:\s*var\(--font-mono\)/)
    expect(valor).toMatch(/color:\s*var\(--color-accent-deep\)/)
  })

  it('CTA primário sólido tinta e secundário fantasma', () => {
    const primario = css.match(/\.hero__cta--primario\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(primario).toMatch(/background:\s*var\(--color-ink\)/)
    expect(primario).toMatch(/color:\s*var\(--color-paper\)/)
    const secundario = css.match(/\.hero__cta--secundario\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(secundario).toMatch(/border:\s*1px solid var\(--color-ink\)/)
    expect(secundario).not.toMatch(/background:\s*var\(--color-ink\)/)
  })

  it('hero full-bleed atravessa a viewport no padrao de skillset e contato', () => {
    const raiz = css.match(/\.hero\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(raiz).toMatch(/width:\s*100vw/)
    expect(raiz).toMatch(/margin-inline:\s*calc\(50% - 50vw\)/)
    expect(raiz).toMatch(/padding-inline:\s*clamp\(1\.5rem,\s*6vw,\s*6rem\)/)
  })

  it('nome display gigante com teto em rem e foto ocupando meia tela', () => {
    const tamanho = css.match(/\.hero__titulo\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(tamanho).toMatch(/font-size:\s*min\(\s*14rem,\s*\d+vw,\s*\d+vh\s*\)/)
    const grade = [...css.matchAll(/\.hero__grade\s*\{([^}]*)\}/g)].map(
      (m) => m[1],
    ).find((bloco) => bloco.includes('grid-template-columns')) ?? ''
    expect(grade).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(0,\s*1fr\)/)
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

  it('media query de altura baixa revogado, sizing contínuo por min() cobre todas as alturas', () => {
    expect(css).not.toMatch(/@media[^{]*max-height/)
    expect(css).not.toContain('8.5vw')
  })

  it('hero com altura ligada à viewport, 100svh menos o header, com fallback vh e dvh', () => {
    const raiz = css.match(/\.hero\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(raiz).toMatch(/--hero-header-altura:\s*4\.5rem/)
    const alturas =
      raiz.match(/min-height:\s*calc\(100[svd]{0,2}h - var\(--hero-header-altura\)\)/g) ?? []
    const cadeia = alturas.join('\n')
    expect(cadeia).toContain('100vh')
    expect(cadeia).toContain('100dvh')
    expect(cadeia).toContain('100svh')
    // svh por último, unit de viewport estável vence quando suportada
    expect(alturas.at(-1)).toContain('100svh')
  })

  it('coluna de texto comprime sem estourar, gap flexível por altura e min-height 0', () => {
    const texto = css.match(/\.hero__texto\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(texto).toMatch(/min-height:\s*0/)
    expect(texto).toMatch(/gap:\s*clamp\([^,]+,\s*[\d.]+vh,\s*[^)]+\)/)
    const grade = [...css.matchAll(/\.hero__grade\s*\{([^}]*)\}/g)]
      .map((m) => m[1])
      .find((bloco) => bloco.includes('grid-template-columns')) ?? ''
    expect(grade).toMatch(/min-height:\s*0/)
  })

  it('rótulos dos 3 números nunca truncados, quebra de linha preservada', () => {
    const rotulo = css.match(/\.hero__stat-rotulo\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(rotulo).not.toMatch(/white-space:\s*nowrap/)
    expect(rotulo).not.toMatch(/text-overflow:\s*ellipsis/)
    expect(rotulo).toMatch(/line-height/)
  })

  it('tratamentos CSS da foto antiga no rastro morreram', () => {
    expect(css).not.toMatch(/hue-rotate|sepia/)
    expect(css).not.toMatch(/aspect-ratio:\s*4\s*\/\s*5/)
    expect(css).not.toMatch(/data-image-trail/)
    expect(css).not.toContain('alex-hero')
  })
})

describe('HeroSection recorte e rastro de ícones', () => {
  const ASSINATURA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  class FakeMediaQueryList {
    matches = false
    private listeners = new Set<() => void>()

    addEventListener(_type: string, listener: () => void) {
      this.listeners.add(listener)
    }

    removeEventListener(_type: string, listener: () => void) {
      this.listeners.delete(listener)
    }
  }

  function stubMatchMedia(ponteiroFino: boolean, movimentoReduzido: boolean) {
    const criar = (query: string) => {
      const lista = new FakeMediaQueryList()
      lista.matches = query.includes('pointer') ? ponteiroFino : movimentoReduzido
      return lista
    }
    vi.stubGlobal('matchMedia', vi.fn((query: string) => criar(query)))
  }

  function montarComRastro() {
    stubMatchMedia(true, false)
    const { locale: localeRef } = useLocale()
    localeRef.value = 'pt'
    setLocaleMock.mockClear()
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(HeroSection)
    app.mount(root)
    return root
  }

  function moverPonteiro(elemento: Element, x: number, y: number) {
    elemento.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y }))
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('asset alex-cut.png existe, é PNG com canal alfa e dimensões 768x1201', () => {
    const caminho = join(import.meta.dirname, '..', 'app', 'assets', 'img', 'alex-cut.png')
    const bytes = readFileSync(caminho)
    expect(bytes.subarray(0, 8)).toEqual(ASSINATURA_PNG)
    expect([4, 6]).toContain(bytes[25])
    expect(bytes.readUInt32BE(16)).toBe(768)
    expect(bytes.readUInt32BE(20)).toBe(1201)
  })

  it('script do processo do recorte está commitado e executável', () => {
    const caminho = join(import.meta.dirname, '..', 'scripts', 'process-cutout.sh')
    const conteudo = readFileSync(caminho, 'utf-8')
    expect(conteudo).toContain('rembg')
    expect(conteudo).toContain('Minha-foto.jpg')
    expect(statSync(caminho).mode & 0o111).not.toBe(0)
  })

  it('rastro usa os 7 ícones de tech e nunca a foto do dono', () => {
    const root = montarComRastro()
    const imagens = [...root.querySelectorAll('[data-image-trail] img')]
    expect(imagens).toHaveLength(7)
    const nomes = imagens.map((img) => img.getAttribute('src') ?? '')
    expect(nomes.some((src) => src.includes('alex'))).toBe(false)
    for (const icone of [
      'icons8-kotlin-96.png',
      'icons8-vue-js-96.png',
      'icons8-spring-boot-48.png',
      'icons8-html-96.png',
      'icons8-css-96.png',
      'icons8-javascript-48.png',
      'icons8-github-100.png',
    ]) {
      expect(nomes.some((src) => src.includes(icone))).toBe(true)
    }
  })

  it('rastro nasce dentro do container da foto e só vale nela', () => {
    const root = montarComRastro()
    const container = root.querySelector('[data-testid="hero-photo-container"]')
    expect(container).not.toBeNull()
    const wrapper = container?.querySelector('[data-image-trail]')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.parentElement).toBe(container)
    expect(root.querySelectorAll('[data-image-trail]')).toHaveLength(1)

    // ponteiro fora do container, sobre o título, nao revela nada
    const titulo = root.querySelector('[data-testid="hero-title"]')
    moverPonteiro(titulo!, 10, 10)
    const imagens = [...(wrapper?.querySelectorAll('img') ?? [])]
    for (const img of imagens) {
      expect(gsap.getTweensOf(img)).toHaveLength(0)
    }

    // ponteiro dentro do container revela o primeiro icone
    moverPonteiro(container!, 50, 60)
    expect(gsap.getTweensOf(imagens[0]).length).toBeGreaterThanOrEqual(1)
  })

  it('ícones do rastro medem 100px, dentro da faixa de 80 a 120px', () => {
    const root = montarComRastro()
    const container = root.querySelector('[data-testid="hero-photo-container"]')!
    const imagens = [...container.querySelectorAll('[data-image-trail] img')]
    moverPonteiro(container, 40, 40)
    const largura = Number.parseFloat(imagens[0].style.width)
    expect(largura).toBeGreaterThanOrEqual(80)
    expect(largura).toBeLessThanOrEqual(120)
  })

  it('CSS ancora o rastro no container da foto, sem estilizar imagens dele', () => {
    const css = readFileSync(
      join(import.meta.dirname, '..', 'app', 'components', 'HeroSection.vue'),
      'utf-8',
    )
    const foto = css.match(/\.hero__foto\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(foto).toMatch(/position:\s*relative/)
  })
})

describe('coreografia de entrada do hero', () => {
  type HeroEntrada = typeof import('../app/utils/heroEntrada')
  let heroEntrada: HeroEntrada

  beforeAll(async () => {
    heroEntrada = await import('../app/utils/heroEntrada')
  })

  describe('decomporValorStat', () => {
    it('separa R$ 15 mil em prefixo, número e sufixo', () => {
      expect(heroEntrada.decomporValorStat('R$ 15 mil')).toEqual({
        prefixo: 'R$ ',
        numero: 15,
        sufixo: ' mil',
      })
    })

    it('separa 80% e 3+ sem prefixo', () => {
      expect(heroEntrada.decomporValorStat('80%')).toEqual({ prefixo: '', numero: 80, sufixo: '%' })
      expect(heroEntrada.decomporValorStat('3+')).toEqual({ prefixo: '', numero: 3, sufixo: '+' })
    })

    it('string sem número devolve null e o texto fica estático', () => {
      expect(heroEntrada.decomporValorStat('sem número')).toBeNull()
    })
  })

  describe('valorContado', () => {
    it('começa no valor inicial no tempo zero', () => {
      expect(heroEntrada.valorContado(0, { ate: 15, duracaoMs: 1200 })).toBe(0)
    })

    it('termina no valor final quando o tempo atinge a duração', () => {
      expect(heroEntrada.valorContado(1200, { ate: 15, duracaoMs: 1200 })).toBe(15)
      expect(heroEntrada.valorContado(9999, { ate: 80, duracaoMs: 1200 })).toBe(80)
    })

    it('easing linear passa pelo meio do caminho', () => {
      expect(heroEntrada.valorContado(600, { ate: 80, duracaoMs: 1200, easing: (t) => t })).toBe(40)
    })

    it('respeita valor inicial diferente de zero com linear', () => {
      expect(
        heroEntrada.valorContado(1000, { de: 10, ate: 20, duracaoMs: 1000, easing: (t) => t }),
      ).toBe(20)
    })

    it('easeOutExpo sai de 0, chega em 1 e é monotônico crescente', () => {
      expect(heroEntrada.easeOutExpo(0)).toBe(0)
      expect(heroEntrada.easeOutExpo(1)).toBe(1)
      let anterior = 0
      for (let i = 1; i <= 10; i += 1) {
        const valor = heroEntrada.easeOutExpo(i / 10)
        expect(valor).toBeGreaterThanOrEqual(anterior)
        anterior = valor
      }
    })

    it('tempo NaN conta como zero e duração inválida lança RangeError', () => {
      expect(heroEntrada.valorContado(Number.NaN, { ate: 15, duracaoMs: 1200 })).toBe(0)
      expect(() => heroEntrada.valorContado(0, { ate: 15, duracaoMs: 0 })).toThrow(RangeError)
    })
  })

  describe('formatarContado', () => {
    it('monta o valor com o sufixo e prefixo informados por idioma', () => {
      expect(heroEntrada.formatarContado(15, { prefixo: 'R$ ', sufixo: ' mil' })).toBe('R$ 15 mil')
      expect(heroEntrada.formatarContado(80, { sufixo: '%' })).toBe('80%')
      expect(heroEntrada.formatarContado(3, { sufixo: '+' })).toBe('3+')
    })

    it('arredonda por padrão e aceita casas decimais', () => {
      expect(heroEntrada.formatarContado(14.7, { sufixo: ' mil' })).toBe('15 mil')
      expect(heroEntrada.formatarContado(2.5, { casas: 1 })).toBe('2,5')
    })
  })

  describe('construirCoreografiaEntrada', () => {
    it('movimento reduzido corta tudo, nenhum passo', () => {
      expect(heroEntrada.construirCoreografiaEntrada(true)).toEqual([])
    })

    it('ordem editorial nome, foto, chips, stats e fecho', () => {
      const passos = heroEntrada.construirCoreografiaEntrada(false)
      expect(passos.map((p) => p.alvo)).toEqual([
        'linha-nome',
        'foto',
        'chip',
        'stats',
        'fecho',
      ])
    })

    it('nome abre em zero com stagger de 0,08 entre linhas e ease expo', () => {
      const [nome] = heroEntrada.construirCoreografiaEntrada(false)
      expect(nome.inicioS).toBe(0)
      expect(nome.staggerS).toBeCloseTo(0.08)
      expect(nome.ease).toContain('expo')
    })

    it('foto entra 0,15 depois do nome com duração positiva', () => {
      const [, foto] = heroEntrada.construirCoreografiaEntrada(false)
      expect(foto.inicioS).toBeCloseTo(0.15)
      expect(foto.duracaoS).toBeGreaterThan(0)
    })

    it('chips entram em pop com stagger de 0,05 e ease back', () => {
      const [, , chip] = heroEntrada.construirCoreografiaEntrada(false)
      expect(chip.staggerS).toBeCloseTo(0.05)
      expect(chip.ease).toContain('back')
    })

    it('contagem dos stats dura o mesmo que DURACAO_CONTAGEM_MS', () => {
      const [, , , stats] = heroEntrada.construirCoreografiaEntrada(false)
      expect(stats.duracaoS).toBe(heroEntrada.DURACAO_CONTAGEM_MS / 1000)
    })

    it('fecho é o último passo da coreografia', () => {
      const passos = heroEntrada.construirCoreografiaEntrada(false)
      const fecho = passos.at(-1)!
      for (const passo of passos.slice(0, -1)) {
        expect(fecho.inicioS).toBeGreaterThanOrEqual(passo.inicioS)
      }
      expect(fecho.alvo).toBe('fecho')
    })
  })

  describe('observarSaidaPreloader', () => {
    function criarPreloader() {
      const preloader = document.createElement('div')
      preloader.setAttribute('data-testid', 'preloader')
      document.body.appendChild(preloader)
      return preloader
    }

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('sem preloader em cena devolve jaSaiu true e não chama callback', () => {
      const aoSair = vi.fn()
      const { jaSaiu, cancelar } = heroEntrada.observarSaidaPreloader(document, aoSair)
      expect(jaSaiu).toBe(true)
      expect(aoSair).not.toHaveBeenCalled()
      cancelar()
    })

    it('com preloader em cena espera a saída e dispara uma vez só', async () => {
      const preloader = criarPreloader()
      const aoSair = vi.fn()
      const { jaSaiu } = heroEntrada.observarSaidaPreloader(document, aoSair)
      expect(jaSaiu).toBe(false)

      preloader.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(aoSair).toHaveBeenCalledTimes(1)

      document.body.appendChild(preloader)
      preloader.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(aoSair).toHaveBeenCalledTimes(1)
    })

    it('cancelar impede o disparo depois', async () => {
      const preloader = criarPreloader()
      const aoSair = vi.fn()
      const { cancelar } = heroEntrada.observarSaidaPreloader(document, aoSair)
      cancelar()
      preloader.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(aoSair).not.toHaveBeenCalled()
    })
  })

  describe('HeroSection na cena', () => {
    const cssHero = readFileSync(
      join(import.meta.dirname, '..', 'app', 'components', 'HeroSection.vue'),
      'utf-8',
    )

    class FakeMediaQueryList {
      matches = false
      private listeners = new Set<() => void>()

      addEventListener(_type: string, listener: () => void) {
        this.listeners.add(listener)
      }

      removeEventListener(_type: string, listener: () => void) {
        this.listeners.delete(listener)
      }
    }

    function montarHero(ponteiroFino: boolean, movimentoReduzido: boolean) {
      const criar = (query: string) => {
        const lista = new FakeMediaQueryList()
        lista.matches = query.includes('pointer') ? ponteiroFino : movimentoReduzido
        return lista
      }
      vi.stubGlobal('matchMedia', vi.fn((query: string) => criar(query)))
      const { locale: localeRef } = useLocale()
      localeRef.value = 'pt'
      setLocaleMock.mockClear()
      const root = document.createElement('div')
      document.body.appendChild(root)
      const app = createApp(HeroSection)
      app.mount(root)
      return { root, app }
    }

    afterEach(() => {
      vi.unstubAllGlobals()
      document.body.innerHTML = ''
    })

    it('cada linha do display tem máscara com o texto interno pronto pra subir', () => {
      const { root } = montarHero(true, true)
      const linhas = [...root.querySelectorAll('.hero__titulo-linha')]
      expect(linhas).toHaveLength(2)
      for (const linha of linhas) {
        expect(linha.querySelector('.hero__titulo-texto')).not.toBeNull()
      }
      const mascara = cssHero.match(/\.hero__titulo-linha\s*\{([^}]*)\}/)?.[1] ?? ''
      expect(mascara).toMatch(/overflow:\s*hidden/)
    })

    it('estado inicial escondido nasce do JS, nunca do CSS', () => {
      const { root } = montarHero(true, false)
      const textos = [...root.querySelectorAll('.hero__titulo-texto')] as HTMLElement[]
      expect(textos.length).toBeGreaterThan(0)
      expect(textos.every((el) => el.style.transform.includes('translate'))).toBe(true)

      const foto = root.querySelector('[data-testid="hero-photo-container"]') as HTMLElement
      expect(foto.style.transform).toContain('scale')
      expect(foto.style.opacity).toBe('0')

      const chips = [...root.querySelectorAll('[data-testid="hero-chip"]')] as HTMLElement[]
      expect(chips.every((el) => el.style.transform.includes('scale'))).toBe(true)

      const sub = root.querySelector('[data-testid="hero-sub"]') as HTMLElement
      expect(sub.style.opacity).toBe('0')

      const seletoresCoreografados =
        /\.hero__(titulo-texto|foto|chip|sub|cta)\b[^{]*\{[^}]*opacity:\s*0/
      expect(cssHero).not.toMatch(seletoresCoreografados)
    })

    it('movimento reduzido não aplica nenhum estado inicial, tudo posicionado', () => {
      const { root } = montarHero(true, true)
      const textos = [...root.querySelectorAll('.hero__titulo-texto')] as HTMLElement[]
      expect(textos.every((el) => el.style.transform === '')).toBe(true)
      const foto = root.querySelector('[data-testid="hero-photo-container"]') as HTMLElement
      expect(foto.style.transform).toBe('')
      expect(foto.style.opacity).toBe('')
      const chips = [...root.querySelectorAll('[data-testid="hero-chip"]')] as HTMLElement[]
      expect(chips.every((el) => el.style.transform === '')).toBe(true)
      const sub = root.querySelector('[data-testid="hero-sub"]') as HTMLElement
      expect(sub.style.opacity).toBe('')
    })

    it('valores finais dos stats no DOM antes de qualquer contagem', () => {
      const { root } = montarHero(true, false)
      const valores = [...root.querySelectorAll('[data-testid="stat-valor"]')].map(
        (el) => el.textContent,
      )
      expect(valores).toEqual(['R$ 15 mil', '80%', '3+'])
    })

    it('revert no unmount devolve os estilos inline ao estado original', () => {
      const { root, app } = montarHero(true, false)
      const texto = root.querySelector('.hero__titulo-texto') as HTMLElement
      expect(texto.style.transform).not.toBe('')
      app.unmount()
      expect(texto.style.transform).toBe('')
    })
  })
})
