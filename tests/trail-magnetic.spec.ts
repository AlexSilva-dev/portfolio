import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, ref, type Ref } from 'vue'
import { gsap } from 'gsap'
import { computeMagneticOffset, useMagnetic } from '../app/composables/useMagnetic'
import { useImageTrail, type ItemTrilha } from '../app/composables/useImageTrail'

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

/**
 * Monta um componente hospedeiro real (createApp) para exercitar o ciclo de
 * vida completo do composable, incluindo onMounted e onUnmounted.
 */
function montarComComposable(usar: (alvo: Ref<HTMLElement | null>) => void) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const alvo = ref<HTMLElement | null>(null)
  const Hospedeiro = defineComponent({
    setup() {
      usar(alvo)
      return () => h('section', { ref: alvo, 'data-testid': 'alvo' })
    },
  })
  const app = createApp(Hospedeiro)
  app.mount(root)
  return { app, root, alvo }
}

function moverPonteiro(elemento: Element, x: number, y: number) {
  elemento.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y }))
}

function tirarPonteiro(elemento: Element) {
  elemento.dispatchEvent(new MouseEvent('pointerleave'))
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('computeMagneticOffset', () => {
  // retangulo 100x40 em (200, 100) tem centro em (250, 120)
  const rect = { left: 200, top: 100, width: 100, height: 40 }

  it('puxa o elemento na direcao do cursor com a forca padrao', () => {
    expect(computeMagneticOffset(290, 120, rect)).toEqual({ x: 14, y: 0 })
  })

  it('limita o deslocamento no maxOffset padrao de 14px', () => {
    expect(computeMagneticOffset(400, 220, rect)).toEqual({ x: 14, y: 14 })
  })

  it('desloca negativo quando o cursor fica a esquerda e acima', () => {
    expect(computeMagneticOffset(180, 60, rect)).toEqual({ x: -14, y: -14 })
  })

  it('respeita maxOffset e forca customizados', () => {
    expect(computeMagneticOffset(260, 130, rect, 10, 0.5)).toEqual({ x: 5, y: 5 })
    expect(computeMagneticOffset(300, 150, rect, 10, 0.5)).toEqual({ x: 10, y: 10 })
  })
})

describe('useMagnetic', () => {
  const opcoes = { maxOffset: 50, forca: 1, duracao: 0, duracaoRetorno: 0 }

  it('desloca o elemento na direcao do cursor no pointermove simulado', () => {
    stubMatchMedia(true, false)
    const { alvo } = montarComComposable((alvo) => useMagnetic(alvo, opcoes))
    const el = alvo.value!

    moverPonteiro(el, 100, 50)

    expect(gsap.getProperty(el, 'x')).toBe(50)
    expect(gsap.getProperty(el, 'y')).toBe(50)
  })

  it('zera o deslocamento de volta a origem no pointerleave simulado', () => {
    stubMatchMedia(true, false)
    const { alvo } = montarComComposable((alvo) => useMagnetic(alvo, opcoes))
    const el = alvo.value!

    moverPonteiro(el, 100, 50)
    tirarPonteiro(el)

    expect(gsap.getProperty(el, 'x')).toBe(0)
    expect(gsap.getProperty(el, 'y')).toBe(0)
  })

  it('nao desloca nada com movimento reduzido', () => {
    stubMatchMedia(true, true)
    const { alvo } = montarComComposable((alvo) => useMagnetic(alvo, opcoes))
    const el = alvo.value!

    moverPonteiro(el, 100, 50)

    expect(gsap.getProperty(el, 'x')).toBe(0)
    expect(gsap.getProperty(el, 'y')).toBe(0)
  })

  it('nao desloca nada sem ponteiro fino, fora do desktop', () => {
    stubMatchMedia(false, false)
    const { alvo } = montarComComposable((alvo) => useMagnetic(alvo, opcoes))
    const el = alvo.value!

    moverPonteiro(el, 100, 50)

    expect(gsap.getProperty(el, 'x')).toBe(0)
    expect(gsap.getProperty(el, 'y')).toBe(0)
  })

  it('remove os listeners de ponteiro no unmount', () => {
    stubMatchMedia(true, false)
    const { app, alvo } = montarComComposable((alvo) => useMagnetic(alvo, opcoes))
    const el = alvo.value!
    const espiao = vi.spyOn(el, 'removeEventListener')

    app.unmount()

    expect(espiao).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(espiao).toHaveBeenCalledWith('pointerleave', expect.any(Function))
  })
})

describe('useImageTrail', () => {
  const itens: ItemTrilha[] = [
    { src: 'foto-a.jpg', filtro: 'grayscale(1) contrast(1.15)' },
    { src: 'foto-b.jpg' },
    { src: 'foto-c.jpg', filtro: 'sepia(0.5)' },
  ]

  it('cria uma imagem por item da config, com filtro e aria-hidden', () => {
    stubMatchMedia(true, false)
    const { alvo } = montarComComposable((alvo) => useImageTrail(alvo, itens))
    const container = alvo.value!

    const wrapper = container.querySelector('[data-image-trail]')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true')

    const imagens = wrapper?.querySelectorAll('img') ?? []
    expect(imagens.length).toBe(3)
    expect(imagens[0].getAttribute('src')).toBe('foto-a.jpg')
    expect(imagens[0].style.filter).toBe('grayscale(1) contrast(1.15)')
    expect(imagens[1].style.filter).toBe('')
    expect(imagens[2].style.filter).toBe('sepia(0.5)')
    for (const img of imagens) {
      expect(img.getAttribute('alt')).toBe('')
    }
  })

  it('posiciona uma imagem atras do cursor a cada pointermove', () => {
    stubMatchMedia(true, false)
    const { alvo } = montarComComposable(
      (alvo) => useImageTrail(alvo, itens, { throttleMs: 0 }),
    )
    const container = alvo.value!
    const imagens = container.querySelectorAll('[data-image-trail] img')

    moverPonteiro(container, 100, 120)
    expect(imagens[0].style.left).toBe('100px')
    expect(imagens[0].style.top).toBe('120px')
    expect(gsap.getTweensOf(imagens[0]).length).toBeGreaterThanOrEqual(1)

    moverPonteiro(container, 200, 180)
    expect(imagens[1].style.left).toBe('200px')
    expect(imagens[1].style.top).toBe('180px')
  })

  it('nao cria nada com movimento reduzido', () => {
    stubMatchMedia(true, true)
    const { alvo } = montarComComposable((alvo) => useImageTrail(alvo, itens))

    expect(alvo.value?.querySelector('[data-image-trail]')).toBeNull()
  })

  it('nao cria nada sem ponteiro fino, fora do desktop', () => {
    stubMatchMedia(false, false)
    const { alvo } = montarComComposable((alvo) => useImageTrail(alvo, itens))

    expect(alvo.value?.querySelector('[data-image-trail]')).toBeNull()
  })

  it('nao cria nada com lista de imagens vazia', () => {
    stubMatchMedia(true, false)
    const { alvo } = montarComComposable((alvo) => useImageTrail(alvo, []))

    expect(alvo.value?.querySelector('[data-image-trail]')).toBeNull()
  })

  it('remove listeners e imagens no unmount', () => {
    stubMatchMedia(true, false)
    const { app, root, alvo } = montarComComposable((alvo) => useImageTrail(alvo, itens))
    const container = alvo.value!
    const espiao = vi.spyOn(container, 'removeEventListener')

    app.unmount()

    expect(espiao).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(root.querySelector('[data-image-trail]')).toBeNull()
  })
})
