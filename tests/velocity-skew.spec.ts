import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, ref } from 'vue'
import {
  LIMITE_SKEW_GRAUS,
  calcularSkewY,
  useVelocitySkew,
} from '../app/composables/useVelocitySkew'

class FakeMediaQueryList {
  matches = false
  private listeners = new Set<() => void>()

  addEventListener(_type: string, listener: () => void) {
    this.listeners.add(listener)
  }

  removeEventListener(_type: string, listener: () => void) {
    this.listeners.delete(listener)
  }

  set(value: boolean) {
    this.matches = value
    this.listeners.forEach((listener) => listener())
  }
}

interface HostMontado {
  app: ReturnType<typeof createApp>
  el: HTMLElement
  quadros: FrameRequestCallback[]
  rafSpy: ReturnType<typeof vi.fn>
  cancelSpy: ReturnType<typeof vi.fn>
  addSpy: ReturnType<typeof vi.fn>
  removeSpy: ReturnType<typeof vi.fn>
  fakeReduced: FakeMediaQueryList
}

function montarHost({ reduzido = false, ponteiroFino = true }: { reduzido?: boolean, ponteiroFino?: boolean } = {}): HostMontado {
  const fakeReduced = new FakeMediaQueryList()
  fakeReduced.matches = reduzido
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
    if (query.includes('prefers-reduced-motion')) return fakeReduced as unknown as MediaQueryList
    return {
      matches: ponteiroFino,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList
  })

  const quadros: FrameRequestCallback[] = []
  const rafSpy = vi.fn((cb: FrameRequestCallback) => {
    quadros.push(cb)
    return quadros.length
  })
  const cancelSpy = vi.fn()
  vi.stubGlobal('requestAnimationFrame', rafSpy)
  vi.stubGlobal('cancelAnimationFrame', cancelSpy)
  const addSpy = vi.spyOn(window, 'addEventListener')
  const removeSpy = vi.spyOn(window, 'removeEventListener')

  const raiz = document.createElement('div')
  document.body.appendChild(raiz)
  const Host = {
    setup() {
      const alvo = ref<HTMLElement | null>(null)
      useVelocitySkew(alvo)
      return { alvo }
    },
    template: '<div ref="alvo" data-testid="skew-alvo"></div>',
  }
  const app = createApp(Host)
  app.mount(raiz)
  const el = raiz.querySelector('[data-testid="skew-alvo"]') as HTMLElement
  return { app, el, quadros, rafSpy, cancelSpy, addSpy, removeSpy, fakeReduced }
}

function rolarAte(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  window.dispatchEvent(new Event('scroll'))
}

function grausAplicados(el: HTMLElement): number | null {
  const bruto = el.style.transform.match(/skewY\((-?[\d.]+)deg\)/)
  return bruto ? Number(bruto[1]) : null
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})

describe('calcularSkewY', () => {
  it('rolagem parada nao distorce, skew zero', () => {
    expect(calcularSkewY(0)).toBe(0)
  })

  it('skew proporcional a velocidade, referencia de 2000 px/s para o limite', () => {
    expect(calcularSkewY(1000)).toBe(0.75)
    expect(calcularSkewY(-1000)).toBe(-0.75)
    expect(calcularSkewY(2000)).toBe(LIMITE_SKEW_GRAUS)
    expect(calcularSkewY(500)).toBe(0.375)
  })

  it('clamp simetrico no limite de 1,5 grau, rolagem absurda nao distorce mais que isso', () => {
    expect(calcularSkewY(50000)).toBe(1.5)
    expect(calcularSkewY(-50000)).toBe(-1.5)
    expect(calcularSkewY(Number.POSITIVE_INFINITY)).toBe(1.5)
    expect(calcularSkewY(Number.NEGATIVE_INFINITY)).toBe(-1.5)
  })

  it('NaN nunca distorce, dado corrompido vira zero', () => {
    expect(calcularSkewY(Number.NaN)).toBe(0)
  })

  it('configuracao invalida de limite ou referencia falha com erro claro', () => {
    expect(() => calcularSkewY(100, 0)).toThrow(RangeError)
    expect(() => calcularSkewY(100, -1)).toThrow(RangeError)
    expect(() => calcularSkewY(100, 1.5, 0)).toThrow(RangeError)
  })
})

describe('useVelocitySkew', () => {
  it('aplica skewY no elemento alvo durante a rolagem, nunca no html ou body', () => {
    const { app, el, quadros } = montarHost()
    rolarAte(900)
    expect(quadros).toHaveLength(1)
    quadros.shift()!(1000)
    const graus = grausAplicados(el)
    expect(graus).not.toBeNull()
    expect(Math.abs(graus as number)).toBeLessThanOrEqual(LIMITE_SKEW_GRAUS)
    expect(document.documentElement.style.transform).toBe('')
    expect(document.body.style.transform).toBe('')
    app.unmount()
  })

  it('o skew aplicado fica limitado mesmo com rolagem extrema', () => {
    const { app, el, quadros } = montarHost()
    rolarAte(999999)
    quadros.shift()!(1000)
    const graus = grausAplicados(el)
    expect(Math.abs(graus as number)).toBeLessThanOrEqual(LIMITE_SKEW_GRAUS)
    expect(graus as number).toBeGreaterThan(0)
    app.unmount()
  })

  it('assenta o skew de volta a zero com lerp quando a rolagem para', () => {
    const { app, el, quadros } = montarHost()
    rolarAte(900)
    quadros.shift()!(1000)
    expect(grausAplicados(el)).not.toBeNull()

    let assentou = false
    let anterior = Number.POSITIVE_INFINITY
    for (let tempo = 1016; tempo < 1016 + 120 * 16; tempo += 16) {
      const cb = quadros.shift()
      if (!cb) break
      cb(tempo)
      const graus = grausAplicados(el)
      if (graus === null) {
        assentou = true
        break
      }
      // lerp converge, o skew nunca cresce com a rolagem parada
      expect(Math.abs(graus)).toBeLessThan(anterior)
      anterior = Math.abs(graus)
    }
    expect(assentou).toBe(true)
    app.unmount()
  })

  it('reduced motion corta tudo desde o inicio, sem listener util e sem frame', () => {
    const { app, el, rafSpy, addSpy, quadros } = montarHost({ reduzido: true })
    rolarAte(900)
    expect(rafSpy).not.toHaveBeenCalled()
    expect(addSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything())
    expect(el.style.transform).toBe('')
    expect(quadros).toHaveLength(0)
    app.unmount()
  })

  it('corta o efeito em runtime quando reduced motion liga no meio do uso', async () => {
    const { app, el, quadros, rafSpy, fakeReduced } = montarHost()
    rolarAte(900)
    quadros.shift()!(1000)
    expect(grausAplicados(el)).not.toBeNull()

    fakeReduced.set(true)
    await nextTick()
    expect(el.style.transform).toBe('')

    const framesAntes = rafSpy.mock.calls.length
    rolarAte(1200)
    expect(rafSpy.mock.calls.length).toBe(framesAntes)
    app.unmount()
  })

  it('mobile sem ponteiro fino nao registra nada', () => {
    const { app, rafSpy, addSpy } = montarHost({ ponteiroFino: false })
    rolarAte(900)
    expect(rafSpy).not.toHaveBeenCalled()
    expect(addSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything())
    app.unmount()
  })

  it('no unmount limpa o frame pendente, o listener de scroll e o transform', () => {
    const { app, el, quadros, cancelSpy, addSpy, removeSpy } = montarHost()
    rolarAte(900)
    const pendente = quadros.shift()
    expect(pendente).toBeDefined()
    app.unmount()
    expect(cancelSpy).toHaveBeenCalled()
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything())
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(el.style.transform).toBe('')
  })
})
