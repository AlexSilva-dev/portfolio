<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { usePrefersReducedMotion } from '../composables/usePrefersReducedMotion'

const CONSULTA_PONTEIRO_FINO = '(pointer: fine)'
const SELETOR_INTERATIVO = 'a, button, [role="button"], input'
const CLASSE_ATIVA = 'cursor-custom-ativo'
const CLASSE_VISIVEL = 'cursor-custom--visivel'
const CLASSE_INTERATIVO = 'cursor-custom--interativo'
/** Fator de perseguição do anel por quadro, quanto maior mais colado no ponteiro. */
const FATOR_LERP = 0.2

/**
 * Cursor customizado, substituto do nativo em desktop com ponteiro fino.
 * O ponto segue o ponteiro na hora e o anel corre atrás com inércia via
 * rAF próprio, com mix-blend-mode difference o par lê como tinta sobre
 * o papel e como papel sobre as seções escuras, sem medir o DOM.
 * Movimento reduzido mantém o cursor (é substituto do nativo) só sem
 * inércia, o anel acompanha direto. Em touch nada existe.
 */
const { prefersReducedMotion } = usePrefersReducedMotion()

const ativo = ref(false)
const raiz = ref<HTMLElement | null>(null)
const pontoEl = ref<HTMLElement | null>(null)
const anelEl = ref<HTMLElement | null>(null)

let alvoX = 0
let alvoY = 0
let anelX = 0
let anelY = 0
let quadro = 0
let animando = false

const posicionar = (el: HTMLElement | null, x: number, y: number) => {
  el?.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`)
}

const animar = () => {
  if (prefersReducedMotion.value) {
    anelX = alvoX
    anelY = alvoY
  } else {
    anelX += (alvoX - anelX) * FATOR_LERP
    anelY += (alvoY - anelY) * FATOR_LERP
  }
  posicionar(anelEl.value, anelX, anelY)
  quadro = requestAnimationFrame(animar)
}

const aoMover = (evento: MouseEvent) => {
  alvoX = evento.clientX
  alvoY = evento.clientY
  posicionar(pontoEl.value, alvoX, alvoY)
  raiz.value?.classList.add(CLASSE_VISIVEL)

  if (prefersReducedMotion.value) {
    anelX = alvoX
    anelY = alvoY
    posicionar(anelEl.value, anelX, anelY)
    return
  }

  if (!animando) {
    animando = true
    quadro = requestAnimationFrame(animar)
  }
}

const definirInterativo = (alvo: EventTarget | null) => {
  const elemento = alvo as Element | null
  raiz.value?.classList.toggle(
    CLASSE_INTERATIVO,
    Boolean(elemento?.closest?.(SELETOR_INTERATIVO)),
  )
}

const aoSobrepor = (evento: MouseEvent) => definirInterativo(evento.target)
const aoSair = (evento: MouseEvent) => definirInterativo(evento.relatedTarget)

onMounted(() => {
  if (typeof window === 'undefined') return
  if (!window.matchMedia(CONSULTA_PONTEIRO_FINO).matches) return

  ativo.value = true
  document.documentElement.classList.add(CLASSE_ATIVA)
  window.addEventListener('mousemove', aoMover)
  document.addEventListener('mouseover', aoSobrepor)
  document.addEventListener('mouseout', aoSair)
})

onUnmounted(() => {
  if (!ativo.value) return

  cancelAnimationFrame(quadro)
  animando = false
  window.removeEventListener('mousemove', aoMover)
  document.removeEventListener('mouseover', aoSobrepor)
  document.removeEventListener('mouseout', aoSair)
  document.documentElement.classList.remove(CLASSE_ATIVA)
})
</script>

<template>
  <div
    v-if="ativo"
    ref="raiz"
    class="cursor-custom"
    data-testid="custom-cursor"
    aria-hidden="true"
  >
    <div
      ref="anelEl"
      class="cursor-custom__anel"
      data-testid="custom-cursor-ring"
    >
      <span class="cursor-custom__anel-miolo" />
    </div>
    <div
      ref="pontoEl"
      class="cursor-custom__ponto"
      data-testid="custom-cursor-dot"
    >
      <span class="cursor-custom__ponto-miolo" />
    </div>
  </div>
</template>

<style>
/* Cursor customizado ativo substitui o nativo, padrão de mercado em
   portfólios editoriais, sem dupla indicação de ponteiro. Só entra em
   cena via JavaScript com ponteiro fino, teclado e touch ficam intactos. */
html.cursor-custom-ativo,
html.cursor-custom-ativo * {
  cursor: none;
}
</style>

<style scoped>
.cursor-custom {
  inset: 0 auto auto 0;
  mix-blend-mode: difference;
  opacity: 0;
  pointer-events: none;
  position: fixed;
  z-index: 90;
}

.cursor-custom--visivel {
  opacity: 1;
}

.cursor-custom__ponto,
.cursor-custom__anel {
  left: 0;
  position: fixed;
  top: 0;
  will-change: transform;
}

.cursor-custom__ponto-miolo {
  background: var(--color-paper);
  border-radius: 50%;
  display: block;
  height: 8px;
  margin: -4px;
  transition: transform 0.25s ease;
  width: 8px;
}

.cursor-custom__anel-miolo {
  border: 1.5px solid var(--color-paper);
  border-radius: 50%;
  display: block;
  height: 36px;
  margin: -18px;
  transition: transform 0.25s ease;
  width: 36px;
}

.cursor-custom--interativo .cursor-custom__anel-miolo {
  transform: scale(1.6);
}

.cursor-custom--interativo .cursor-custom__ponto-miolo {
  transform: scale(0.5);
}
</style>
