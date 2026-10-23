import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Preloader from '../app/components/Preloader.vue'

const raizProjeto = join(import.meta.dirname, '..')

function ler(relativo: string) {
  return readFileSync(join(raizProjeto, relativo), 'utf-8')
}

function stubMatchMedia(movimentoReduzido = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? movimentoReduzido : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
}

const appsMontadas: App[] = []

function montar() {
  const raiz = document.createElement('div')
  document.body.appendChild(raiz)
  const app = createApp(Preloader)
  appsMontadas.push(app)
  const vm = app.mount(raiz) as unknown as { reveal: () => void }
  return { app, raiz, vm }
}

afterEach(() => {
  appsMontadas.splice(0).forEach((app) => app.unmount())
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('Preloader, cortina de abertura', () => {
  it('nasce visível com nome, contador e três anéis decorativos', async () => {
    stubMatchMedia(false)
    const { raiz } = montar()
    await nextTick()

    const cortina = raiz.querySelector('[data-testid="preloader"]')
    expect(cortina).not.toBeNull()
    expect(raiz.querySelector('[data-testid="preloader-name"]')?.textContent).toBe('Alex Alves')
    expect(raiz.querySelector('[data-testid="preloader-counter"]')?.textContent).toBe('0%')

    const spinner = cortina?.querySelector('.preloader__spinner')
    expect(spinner?.getAttribute('aria-hidden')).toBe('true')
    const aneis = cortina?.querySelectorAll('.preloader__ring')
    expect(aneis?.length).toBe(3)
    aneis?.forEach((anel) => {
      expect(anel.querySelector('.preloader__ring-inner')).not.toBeNull()
    })
  })

  it('mantém a cortina no DOM com a classe de saída até o fim da animação', async () => {
    stubMatchMedia(false)
    vi.stubGlobal('requestAnimationFrame', () => 0)
    vi.stubGlobal('cancelAnimationFrame', () => {})
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    const { raiz, vm } = montar()
    vm.reveal()
    await nextTick()

    const cortina = raiz.querySelector('[data-testid="preloader"]') as HTMLElement
    expect(cortina).not.toBeNull()
    expect(cortina.classList.contains('preloader--saindo')).toBe(true)

    vi.advanceTimersByTime(520)
    await nextTick()
    expect(raiz.querySelector('[data-testid="preloader"]')).toBeNull()
  })

  it('transitionend finaliza a saída sem esperar o timeout de segurança', async () => {
    stubMatchMedia(false)
    vi.stubGlobal('requestAnimationFrame', () => 0)
    vi.stubGlobal('cancelAnimationFrame', () => {})
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    const { raiz, vm } = montar()
    vm.reveal()
    await nextTick()

    const cortina = raiz.querySelector('[data-testid="preloader"]') as HTMLElement
    const evento = new Event('transitionend', { bubbles: true })
    Object.defineProperty(evento, 'propertyName', { value: 'transform' })
    cortina.dispatchEvent(evento)
    await nextTick()

    expect(raiz.querySelector('[data-testid="preloader"]')).toBeNull()
  })

  it('remove a cortina de imediato quando o sistema pede movimento reduzido', async () => {
    stubMatchMedia(true)
    const { raiz } = montar()
    await nextTick()

    expect(raiz.querySelector('[data-testid="preloader"]')).toBeNull()
  })

  it('usa só tokens de cor, sem hex cru, e anima os anéis dentro do sistema', () => {
    const css = ler('app/components/Preloader.vue')

    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(css).toMatch(/background:\s*var\(--color-bg\)/)
    expect(css).toMatch(/var\(--color-accent\)/)
    expect(css).toMatch(/var\(--color-text-muted\)/)
    expect(css).toMatch(/animation:\s*spin 2s linear infinite/)
    expect(css).toMatch(/animation:\s*spin 5s linear infinite reverse/)
    expect(css).toMatch(/prefers-reduced-motion/)
  })
})

describe('cortina antes do primeiro paint', () => {
  it('declara a casca e a trava de scroll no CSS global', () => {
    const css = ler('app/assets/css/base.css')

    expect(css).toMatch(/\[data-testid="preloader"\]/)
    expect(css).toMatch(/html:has\(\[data-testid="preloader"\]\)\s*\{[^}]*overflow:\s*hidden/)
    expect(css).toMatch(/html\.sem-preloader \[data-testid="preloader"\]/)
    expect(css).toMatch(/html:not\(\.js\) \[data-testid="preloader"\]/)
  })

  it('entrega o Preloader direto no layout, sem ClientOnly', () => {
    const layout = ler('app/layouts/default.vue')

    expect(layout).not.toMatch(/<ClientOnly>\s*<Preloader/)
    expect(layout).toMatch(/<Preloader \/>/)
  })

  it('marca movimento reduzido no head antes do primeiro paint', () => {
    const app = ler('app/app.vue')

    expect(app).toMatch(/prefers-reduced-motion: reduce/)
    expect(app).toMatch(/sem-preloader/)
    expect(app).toMatch(/classList\.add\('js'\)/)
  })
})
