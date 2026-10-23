import { effectScope } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  INICIO_BRILHO_RODAPE,
  PRELOADER_CEILING_MS,
  computeProgress,
  intensidadeBrilhoRodape,
  interpolar,
  limitar,
} from '../app/utils/motion'
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

describe('intensidadeBrilhoRodape', () => {
  it('apagado no topo e em todo o trecho antes do inicio da faixa', () => {
    expect(intensidadeBrilhoRodape(0)).toBe(0)
    expect(intensidadeBrilhoRodape(0.5)).toBe(0)
    expect(intensidadeBrilhoRodape(INICIO_BRILHO_RODAPE)).toBe(0)
  })

  it('comeca a acender depois do inicio com curva suave', () => {
    expect(intensidadeBrilhoRodape(0.9)).toBeCloseTo(0.5, 5)
    expect(intensidadeBrilhoRodape(0.95)).toBeCloseTo(0.84375, 5)
  })

  it('aceso por completo no fim da rolagem', () => {
    expect(intensidadeBrilhoRodape(1)).toBe(1)
  })

  it('satura em 1 acima do fim e nunca fica negativo abaixo de zero', () => {
    expect(intensidadeBrilhoRodape(1.4)).toBe(1)
    expect(intensidadeBrilhoRodape(-2)).toBe(0)
  })

  it('trata NaN como zero, nunca brilho fantasma', () => {
    expect(intensidadeBrilhoRodape(Number.NaN)).toBe(0)
  })

  it('rejeita inicio fora do intervalo meio aberto [0, 1) com erro claro', () => {
    expect(() => intensidadeBrilhoRodape(0.5, 1)).toThrow(RangeError)
    expect(() => intensidadeBrilhoRodape(0.5, 1.2)).toThrow(RangeError)
    expect(() => intensidadeBrilhoRodape(0.5, -0.1)).toThrow(RangeError)
  })
})

describe('limitar', () => {
  it('devolve o proprio valor quando esta dentro da faixa', () => {
    expect(limitar(5, 0, 10)).toBe(5)
    expect(limitar(0, 0, 10)).toBe(0)
    expect(limitar(10, 0, 10)).toBe(10)
  })

  it('presa no minimo quando fica abaixo da faixa', () => {
    expect(limitar(-1, 0, 10)).toBe(0)
    expect(limitar(-50, 0, 10)).toBe(0)
  })

  it('presa no maximo quando fica acima da faixa', () => {
    expect(limitar(11, 0, 10)).toBe(10)
    expect(limitar(5000, 0, 680)).toBe(680)
  })

  it('faixa degenerada com min igual a max devolve o limite comum', () => {
    expect(limitar(7, 0, 0)).toBe(0)
  })

  it('trata NaN como o minimo, nunca posição fantasma', () => {
    expect(limitar(Number.NaN, 0, 10)).toBe(0)
  })

  it('rejeita faixa invertida com erro claro', () => {
    expect(() => limitar(5, 10, 0)).toThrow(RangeError)
  })
})

describe('interpolar', () => {
  it('fica no ponto atual com fator zero', () => {
    expect(interpolar(3, 9, 0)).toBe(3)
  })

  it('chega no alvo com fator um', () => {
    expect(interpolar(3, 9, 1)).toBe(9)
  })

  it('caminha proporcional no meio da distancia', () => {
    expect(interpolar(0, 10, 0.5)).toBe(5)
    expect(interpolar(2, 8, 0.5)).toBe(5)
  })

  it('interpola em direção negativa, rotação voltando pro repouso', () => {
    expect(interpolar(5, -10, 0.5)).toBe(-2.5)
  })

  it('fator fora de zero a um extrapola, sem erro', () => {
    expect(interpolar(0, 10, 2)).toBe(20)
    expect(interpolar(0, 10, -1)).toBe(-10)
  })
})
