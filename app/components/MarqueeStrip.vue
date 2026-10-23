<script lang="ts">
/**
 * Velocidade constante da faixa em px por segundo, lenta de propósito.
 * A duracao da animacao e derivada da largura real do conteudo, entao
 * qualquer ajuste de palavras mantem o mesmo ritmo.
 */
export const VELOCIDADE_MARQUEE_PX_S = 80

/** Piso de duracao em segundos, conteudo curto nao vira carrossel frenetico. */
export const DURACAO_MINIMA_S = 8

/**
 * Duracao do loop em segundos para o conteudo percorrer a propria largura.
 * Erro de configuracao (largura ou velocidade nao positivas, nao finitas)
 * falha com RangeError, seguindo o padrao das funções puras do projeto.
 */
export function calcularDuracaoMarquee(
  larguraConteudoPx: number,
  velocidadePxPorSegundo: number,
): number {
  const entradasValidas =
    Number.isFinite(larguraConteudoPx) &&
    Number.isFinite(velocidadePxPorSegundo) &&
    larguraConteudoPx > 0 &&
    velocidadePxPorSegundo > 0
  if (!entradasValidas) {
    throw new RangeError(
      `largura e velocidade da marquee precisam ser positivas e finitas, recebi ${larguraConteudoPx}px a ${velocidadePxPorSegundo}px/s`,
    )
  }
  return Math.max(larguraConteudoPx / velocidadePxPorSegundo, DURACAO_MINIMA_S)
}
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePrefersReducedMotion } from '../composables/usePrefersReducedMotion'
import { calcularDuracaoMarquee } from './MarqueeStrip.vue'

defineProps<{
  palavras: string[]
  ariaLabel: string
}>()

const { prefersReducedMotion } = usePrefersReducedMotion()

const track = ref<HTMLElement | null>(null)
const duracao = ref('')

/**
 * Velocidade constante exige duracao proporcional a largura real. Largura
 * zero (SSR, teste, display none) cai no fallback do CSS em silencio, na
 * borda do DOM a medida pode falhar sem que o componente quebre.
 */
const medir = () => {
  if (prefersReducedMotion.value) return
  const larguraGrupo = (track.value?.scrollWidth ?? 0) / 2
  if (larguraGrupo <= 0) return
  duracao.value = `${calcularDuracaoMarquee(larguraGrupo, VELOCIDADE_MARQUEE_PX_S)}s`
}

onMounted(medir)
</script>

<template>
  <section
    class="marquee"
    :class="{ 'marquee--estatico': prefersReducedMotion }"
    :aria-label="ariaLabel"
    data-testid="marquee-strip"
  >
    <div ref="track" class="marquee__track" data-testid="marquee-track">
      <p class="marquee__grupo" data-testid="marquee-grupo">
        <template v-for="(palavra, indice) in palavras" :key="palavra">
          <span
            class="marquee__palavra"
            :class="{ 'marquee__palavra--contorno': indice % 2 === 1 }"
          >{{ palavra }}</span>
          <span class="marquee__separador" aria-hidden="true">*</span>
        </template>
      </p>
      <p class="marquee__grupo" data-testid="marquee-grupo" aria-hidden="true">
        <template v-for="(palavra, indice) in palavras" :key="palavra">
          <span
            class="marquee__palavra"
            :class="{ 'marquee__palavra--contorno': indice % 2 === 1 }"
          >{{ palavra }}</span>
          <span class="marquee__separador" aria-hidden="true">*</span>
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
/*
 * Fundo tinta escolhido pelo contraste com o texto em papel (18,1 contra
 * 16,6 do navy) e pela coesao com os blocos full-bleed existentes.
 */
.marquee {
  overflow: hidden;
  background: var(--color-ink);
  padding-block: clamp(0.75rem, 1.25vw, 1.5rem);
}

.marquee__track {
  display: flex;
  width: max-content;
  animation: marquee-deslizar var(--marquee-duracao, 40s) linear infinite;
  will-change: transform;
}

.marquee__grupo {
  display: flex;
  align-items: baseline;
  margin: 0;
  white-space: nowrap;
  font-family: var(--font-sans);
  font-size: clamp(2.25rem, 4.5vw, 7rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.marquee__palavra {
  color: var(--color-paper);
}

.marquee__palavra--contorno {
  color: transparent;
  -webkit-text-stroke: 0.02em var(--color-paper);
}

.marquee__separador {
  color: var(--color-paper);
  margin-inline: 0.35em;
}

@keyframes marquee-deslizar {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

.marquee--estatico .marquee__track {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .marquee__track {
    animation: none;
  }
}
</style>
