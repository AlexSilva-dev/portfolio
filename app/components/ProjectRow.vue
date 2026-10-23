<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import type { Project } from '../content/projects'
import type { ProjectsDict } from '../i18n/sections/projects'
import StatusBadge from './StatusBadge.vue'
import { usePrefersReducedMotion } from '../composables/usePrefersReducedMotion'
import { interpolar, limitar } from '../utils/motion'

const props = defineProps<{
  project: Project
  text: ProjectsDict['items'][number]
  labels: ProjectsDict['meta']
  verProjeto: string
}>()

/* Perseguição do preview no padrão Dennis Snellenberg, só no desktop com
   ponteiro fino e sem movimento reduzido. A rotação acompanha a velocidade
   do cursor suavizada por interpolação e satura pra não virar piada. */
const FATOR_ROTACAO = 0.2
const LIMITE_ROTACAO_GRAUS = 10
const SUAVIZACAO_ROTACAO = 0.5
const DURACAO_PERSEGUICAO_SEG = 0.5
const DURACAO_FADE_SEG = 0.3

// Com url a linha inteira é clicável, sem url nenhum elemento clicável.
// O SaaS (sem url) mantém o selo neutro de dot e texto e nenhuma âncora.
const linkAttrs = computed(() =>
  props.project.url
    ? { href: props.project.url, target: '_blank', rel: 'noopener' }
    : {},
)

const { prefersReducedMotion } = usePrefersReducedMotion()

const raiz = ref<HTMLElement | null>(null)
const preview = ref<HTMLImageElement | null>(null)

let contexto: ReturnType<typeof gsap.context> | null = null
let seguirX: ((x: number) => void) | null = null
let inclinar: ((rotacao: number) => void) | null = null
let anteriorX = 0
let velocidadeSuavizada = 0
let desligar = () => {}

const podePerseguir = () =>
  typeof window !== 'undefined' &&
  !!props.project.url &&
  !prefersReducedMotion.value &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

const aoEntrar = (evento: MouseEvent) => {
  const alvo = preview.value
  if (!contexto || !alvo) return
  anteriorX = evento.clientX
  velocidadeSuavizada = 0
  gsap.to(alvo, { opacity: 1, duration: DURACAO_FADE_SEG, overwrite: 'auto' })
}

const aoMover = (evento: MouseEvent) => {
  const linha = raiz.value
  const alvo = preview.value
  if (!contexto || !linha || !alvo || !seguirX || !inclinar) return
  const largura = alvo.offsetWidth
  if (!largura) return
  const faixa = linha.getBoundingClientRect()
  seguirX(
    limitar(evento.clientX - faixa.left - largura / 2, 0, Math.max(faixa.width - largura, 0)),
  )

  const bruta = limitar(
    (evento.clientX - anteriorX) * FATOR_ROTACAO,
    -LIMITE_ROTACAO_GRAUS,
    LIMITE_ROTACAO_GRAUS,
  )
  anteriorX = evento.clientX
  velocidadeSuavizada = interpolar(velocidadeSuavizada, bruta, SUAVIZACAO_ROTACAO)
  inclinar(velocidadeSuavizada)
}

const aoSair = () => {
  const alvo = preview.value
  if (!contexto || !alvo) return
  velocidadeSuavizada = 0
  inclinar?.(0)
  gsap.to(alvo, { opacity: 0, duration: DURACAO_FADE_SEG, overwrite: 'auto' })
}

onMounted(() => {
  if (!podePerseguir()) return
  const linha = raiz.value
  const alvo = preview.value
  if (!linha || !alvo) return

  contexto = gsap.context(() => {
    // O gsap assume o transform, a base replica o estado estático do CSS.
    gsap.set(alvo, { yPercent: -50, rotate: -3 })
    seguirX = gsap.quickTo(alvo, 'x', {
      duration: DURACAO_PERSEGUICAO_SEG,
      ease: 'power3.out',
    })
    inclinar = gsap.quickTo(alvo, 'rotation', {
      duration: DURACAO_PERSEGUICAO_SEG,
      ease: 'power3.out',
    })
  }, linha)

  linha.addEventListener('mouseenter', aoEntrar)
  linha.addEventListener('mousemove', aoMover)
  linha.addEventListener('mouseleave', aoSair)
  desligar = () => {
    linha.removeEventListener('mouseenter', aoEntrar)
    linha.removeEventListener('mousemove', aoMover)
    linha.removeEventListener('mouseleave', aoSair)
  }
})

onUnmounted(() => {
  desligar()
  desligar = () => {}
  contexto?.revert()
  contexto = null
  seguirX = null
  inclinar = null
})
</script>

<template>
  <component
    :is="project.url ? 'a' : 'article'"
    ref="raiz"
    class="project-row"
    :class="{ 'project-row--link': !!project.url }"
    data-testid="project-row"
    v-bind="linkAttrs"
  >
    <StatusBadge
      v-if="project.status === 'wip' || project.status === 'neutral'"
      :variant="project.status"
      :label="text.badge"
    />
    <span class="project-row__topo">
      <h3 class="project-row__nome" data-testid="project-row-name">{{ text.name }}</h3>
      <span
        v-if="project.url"
        class="project-row__cta"
        data-testid="project-row-cta"
      >
        {{ verProjeto }}
        <span aria-hidden="true" class="project-row__seta">→</span>
      </span>
    </span>
    <img
      ref="preview"
      class="project-row__preview"
      :src="project.preview"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      data-testid="project-row-preview"
    />
    <dl class="project-row__meta" data-testid="project-row-meta">
      <div class="project-row__meta-item">
        <dt>{{ labels.papel }}</dt>
        <dd>{{ text.papel }}</dd>
      </div>
      <div class="project-row__meta-item">
        <dt>{{ labels.periodo }}</dt>
        <dd>{{ text.periodo }}</dd>
      </div>
      <div class="project-row__meta-item">
        <dt>{{ labels.ano }}</dt>
        <dd>{{ project.ano }}</dd>
      </div>
      <div class="project-row__meta-item">
        <dt>{{ labels.time }}</dt>
        <dd>{{ text.time }}</dd>
      </div>
    </dl>
  </component>
</template>

<style scoped>
.project-row {
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 20%, transparent);
  color: var(--color-ink);
  display: block;
  padding: clamp(1.5rem, 3vw, 2.5rem) 0;
  position: relative;
  text-decoration: none;
}

.project-row__topo {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  justify-content: space-between;
}

.project-row__nome {
  color: var(--color-ink);
  font-size: clamp(2.25rem, 6.5vw, 5.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0;
  transition: color 0.3s ease;
}

.project-row__cta {
  align-items: center;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--color-ink) 40%, transparent);
  border-radius: 999px;
  color: var(--color-ink);
  display: inline-flex;
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  gap: 0.5rem;
  letter-spacing: 0.08em;
  padding: 0.625rem 1rem;
  text-transform: uppercase;
  transition: border-color 0.3s ease, color 0.3s ease;
  white-space: nowrap;
}

.project-row__preview {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: clamp(1rem, 4vw, 4rem);
  top: 50%;
  transform: translateY(-50%) rotate(-3deg);
  transition: opacity 0.3s ease;
  width: clamp(180px, 22vw, 320px);
  z-index: 1;
  box-shadow: 0 1.5rem 3rem color-mix(in srgb, var(--color-ink) 25%, transparent);
}

.project-row__meta {
  display: grid;
  gap: 1rem 1.5rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 1.5rem 0 0;
}

.project-row__meta dd {
  color: var(--color-ink);
  margin: 0.25rem 0 0;
}

.project-row__meta dt {
  color: color-mix(in srgb, var(--color-ink) 60%, transparent);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (hover: hover) {
  .project-row--link:hover .project-row__nome {
    color: var(--color-accent-deep);
  }

  .project-row--link:hover .project-row__cta {
    border-color: var(--color-accent-deep);
    color: var(--color-accent-deep);
  }

  .project-row--link:hover .project-row__preview {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-row__cta,
  .project-row__nome,
  .project-row__preview {
    transition: none;
  }
}

@media (max-width: 767px) {
  .project-row__meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
