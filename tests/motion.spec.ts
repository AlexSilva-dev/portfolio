import { effectScope } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PRELOADER_CEILING_MS, computeProgress } from '../app/utils/motion'
import { usePrefersReducedMotion } from '../app/composables/usePrefersReducedMotion'

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

function setupComposable() {
  const scope = effectScope()
  const composable = scope.run(() => usePrefersReducedMotion())!
  return { scope, composable }
}

describe('PRELOADER_CEILING_MS', () => {
  it('vale 3000 ms, o teto duro de 3 segundos', () => {
    expect(PRELOADER_CEILING_MS).toBe(3000)
  })
})

describe('computeProgress', () => {
  it('comeca em 0 com tempo zero', () => {
    expect(computeProgress(0, PRELOADER_CEILING_MS)).toBe(0)
  })

  it('calcula progresso parcial em valores intermediarios', () => {
    expect(computeProgress(1500, PRELOADER_CEILING_MS)).toBe(50)
    expect(computeProgress(750, PRELOADER_CEILING_MS)).toBe(25)
    expect(computeProgress(2250, PRELOADER_CEILING_MS)).toBe(75)
  })

  it('satura em 100 exatamente no teto', () => {
    expect(computeProgress(PRELOADER_CEILING_MS, PRELOADER_CEILING_MS)).toBe(100)
  })

  it('satura em 100 e ignora tempo acima do teto de 3000 ms', () => {
    expect(computeProgress(4500, PRELOADER_CEILING_MS)).toBe(100)
    expect(computeProgress(30000, PRELOADER_CEILING_MS)).toBe(100)
  })

  it('trata tempo negativo como zero, nunca progresso negativo', () => {
    expect(computeProgress(-100, PRELOADER_CEILING_MS)).toBe(0)
  })

  it('rejeita teto nao positivo com erro claro', () => {
    expect(() => computeProgress(100, 0)).toThrow(RangeError)
    expect(() => computeProgress(100, -3000)).toThrow(RangeError)
  })
})

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('comeca desligado quando o sistema nao declara reduced motion', () => {
    const mediaQuery = new FakeMediaQueryList()
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

    const { composable } = setupComposable()

    expect(composable.prefersReducedMotion.value).toBe(false)
  })

  it('liga o sinal quando o sistema declara prefers-reduced-motion', () => {
    const mediaQuery = new FakeMediaQueryList()
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

    const { composable } = setupComposable()
    mediaQuery.set(true)

    expect(composable.prefersReducedMotion.value).toBe(true)
  })

  it('desliga o sinal quando o sistema para de declarar reduced motion', () => {
    const mediaQuery = new FakeMediaQueryList()
    mediaQuery.matches = true
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

    const { composable } = setupComposable()
    expect(composable.prefersReducedMotion.value).toBe(true)

    mediaQuery.set(false)
    expect(composable.prefersReducedMotion.value).toBe(false)
  })

  it('defaults em false fora do browser, no servidor', () => {
    vi.stubGlobal('window', undefined)

    const { composable } = setupComposable()

    expect(composable.prefersReducedMotion.value).toBe(false)
  })
})
