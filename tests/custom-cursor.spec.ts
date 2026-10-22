import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import type { Component } from 'vue'
import CustomCursor from '../app/components/CustomCursor.vue'

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

function stubMatchMedia(ponteiroFino: boolean, movimentoReduzido = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      const lista = new FakeMediaQueryList()
      lista.matches = query.includes('pointer') ? ponteiroFino : movimentoReduzido
      return lista
    }),
  )
}

// Fila de quadros controlada pelos testes, um rAF determinístico.
let filaQuadros: Array<() => void> = []

function stubRaf() {
  filaQuadros = []
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: () => void) => {
      filaQuadros.push(callback)
      return filaQuadros.length
    }),
  )
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => {
      filaQuadros[id - 1] = () => {}
    }),
  )
}

function rodarQuadros() {
  const quadros = filaQuadros
  filaQuadros = []
  quadros.forEach((callback) => callback())
}

const appsMontados: ReturnType<typeof createApp>[] = []

async function montarCursor(componente: Component = CustomCursor) {
  const raiz = document.createElement('div')
  document.body.appendChild(raiz)
  const app = createApp(componente)
  appsMontados.push(app)
  app.mount(raiz)
  await nextTick()
  return raiz
}

function moverMouse(x: number, y: number) {
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }))
}

const transformDe = (raiz: HTMLElement, teste: string) =>
  (raiz.querySelector(`[data-testid="${teste}"]`) as HTMLElement | null)?.style
    .transform ?? ''

afterEach(() => {
  appsMontados.splice(0).forEach((app) => app.unmount())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  document.documentElement.className = ''
})

describe('CustomCursor — ativação', () => {
  it('no desktop com ponteiro fino monta ponto e anel e assume o cursor', async () => {
    stubMatchMedia(true)
    stubRaf()
    const raiz = await montarCursor()

    expect(raiz.querySelector('[data-testid="custom-cursor-dot"]')).not.toBeNull()
    expect(raiz.querySelector('[data-testid="custom-cursor-ring"]')).not.toBeNull()
    expect(document.documentElement.classList.contains('cursor-custom-ativo')).toBe(
      true,
    )
  })

  it('no touch com ponteiro grosso nada existe, nem classe nem escuta', async () => {
    stubMatchMedia(false)
    stubRaf()
    const raiz = await montarCursor()

    expect(raiz.querySelector('[data-testid="custom-cursor"]')).toBeNull()
    expect(document.documentElement.classList.contains('cursor-custom-ativo')).toBe(
      false,
    )
    expect(() => moverMouse(50, 50)).not.toThrow()
    expect(filaQuadros).toHaveLength(0)
  })

  it('nasce invisível e só aparece depois do primeiro movimento', async () => {
    stubMatchMedia(true)
    stubRaf()
    const raiz = await montarCursor()
    const cursor = raiz.querySelector('[data-testid="custom-cursor"]') as HTMLElement

    expect(cursor.classList.contains('cursor-custom--visivel')).toBe(false)

    moverMouse(30, 40)

    expect(cursor.classList.contains('cursor-custom--visivel')).toBe(true)
  })
})

describe('CustomCursor — seguimento', () => {
  it('o ponto segue o ponteiro na hora e o anel corre atrás com inércia', async () => {
    stubMatchMedia(true)
    stubRaf()
    const raiz = await montarCursor()

    moverMouse(100, 200)

    expect(transformDe(raiz, 'custom-cursor-dot')).toContain(
      'translate3d(100px, 200px',
    )
    expect(transformDe(raiz, 'custom-cursor-ring')).not.toContain(
      'translate3d(100px, 200px',
    )

    rodarQuadros()

    expect(transformDe(raiz, 'custom-cursor-ring')).toContain('translate3d(20px, 40px')
  })

  it('com movimento reduzido o anel acompanha direto, sem fila de quadros', async () => {
    stubMatchMedia(true, true)
    stubRaf()
    const raiz = await montarCursor()

    moverMouse(100, 200)

    expect(transformDe(raiz, 'custom-cursor-dot')).toContain(
      'translate3d(100px, 200px',
    )
    expect(transformDe(raiz, 'custom-cursor-ring')).toContain(
      'translate3d(100px, 200px',
    )
    expect(filaQuadros).toHaveLength(0)
  })
})

describe('CustomCursor — elementos interativos', () => {
  it('passar sobre um link cresce o anel, sair devolve o estado', async () => {
    stubMatchMedia(true)
    stubRaf()
    const raiz = await montarCursor()
    const cursor = raiz.querySelector('[data-testid="custom-cursor"]') as HTMLElement

    const link = document.createElement('a')
    link.href = '#sobre'
    document.body.appendChild(link)

    link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    expect(cursor.classList.contains('cursor-custom--interativo')).toBe(true)

    link.dispatchEvent(
      new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }),
    )
    expect(cursor.classList.contains('cursor-custom--interativo')).toBe(false)
  })

  it('button, role button e input também contam como interativos', async () => {
    stubMatchMedia(true)
    stubRaf()
    const raiz = await montarCursor()
    const cursor = raiz.querySelector('[data-testid="custom-cursor"]') as HTMLElement

    const casos: Array<() => HTMLElement> = [
      () => Object.assign(document.createElement('button'), { textContent: 'ok' }),
      () => {
        const div = document.createElement('div')
        div.setAttribute('role', 'button')
        return div
      },
      () => Object.assign(document.createElement('input'), { type: 'text' }),
    ]

    for (const criar of casos) {
      const elemento = criar()
      document.body.appendChild(elemento)
      elemento.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      expect(cursor.classList.contains('cursor-custom--interativo')).toBe(true)
      elemento.dispatchEvent(
        new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }),
      )
      expect(cursor.classList.contains('cursor-custom--interativo')).toBe(false)
    }
  })

  it('passar sobre texto comum não ativa o estado interativo', async () => {
    stubMatchMedia(true)
    stubRaf()
    const raiz = await montarCursor()
    const cursor = raiz.querySelector('[data-testid="custom-cursor"]') as HTMLElement

    const paragrafo = document.createElement('p')
    paragrafo.textContent = 'texto simples'
    document.body.appendChild(paragrafo)

    paragrafo.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    expect(cursor.classList.contains('cursor-custom--interativo')).toBe(false)
  })
})

describe('CustomCursor — limpeza', () => {
  it('no unmount devolve o cursor nativo, cancela quadros e para de escutar', async () => {
    stubMatchMedia(true)
    stubRaf()
    const raiz = await montarCursor()
    const app = appsMontados[0]

    moverMouse(10, 10)
    rodarQuadros()

    app.unmount()

    expect(document.documentElement.classList.contains('cursor-custom-ativo')).toBe(
      false,
    )
    expect(vi.mocked(cancelAnimationFrame)).toHaveBeenCalled()

    const chamadasAntes = vi.mocked(requestAnimationFrame).mock.calls.length
    moverMouse(60, 60)
    rodarQuadros()
    expect(vi.mocked(requestAnimationFrame).mock.calls.length).toBe(chamadasAntes)
    expect(raiz.querySelector('[data-testid="custom-cursor"]')).toBeNull()
  })
})
