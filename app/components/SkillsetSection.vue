<script setup lang="ts">
import fotoCodigo from '../assets/img/code.webp'
import fotoTelaCodigo from '../assets/img/2560x1600-px-code-coding-computer-Computer-screen-Java-1288551-wallhere.com.jpg'
import fotoAppEventos from '../assets/img/unify-eventos.webp'

const { dictionary } = useLocale()
const tech = computed(() => dictionary.value.sections.tech)

// Linha sob o cursor, null com o cursor fora da lista
const ativa = ref<number | null>(null)

// Assets próprios, 1 por frente, puramente decorativos e já no bundle
const IMAGENS_POR_FRENTE = [
  fotoAppEventos,
  fotoCodigo,
  fotoTelaCodigo,
  fotoCodigo,
  fotoTelaCodigo,
  fotoCodigo,
]

const NUMEROS = ['01', '02', '03', '04', '05', '06']

function acender(indice: number) {
  ativa.value = indice
}

function apagar() {
  ativa.value = null
}
</script>

<template>
  <section id="skillset" class="skillset" data-testid="skillset-section">
    <div class="container">
      <h2 class="skillset__titulo" data-testid="skillset-title">{{ tech.heading }}</h2>
      <ol class="skillset__lista">
        <li
          v-for="(grupo, indice) in tech.groups"
          :key="grupo.label"
          class="skillset__linha"
          :class="{ 'skillset__linha--ativa': indice === ativa }"
          data-testid="skillset-row"
          @mouseenter="acender(indice)"
          @mouseleave="apagar"
        >
          <span class="skillset__numero" data-testid="skillset-number">{{ NUMEROS[indice] }}</span>
          <h3 class="skillset__nome" data-testid="skillset-name">{{ grupo.label }}</h3>
          <p class="skillset__descricao" data-testid="skillset-description">
            {{ grupo.description }}
          </p>
          <img
            v-if="indice === ativa"
            :src="IMAGENS_POR_FRENTE[indice]"
            alt=""
            aria-hidden="true"
            decoding="async"
            class="skillset__imagem"
            data-testid="skillset-image"
          />
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.skillset {
  background: var(--color-bg);
  color: var(--color-text);
  padding-block: var(--space-section);
}

.skillset__titulo {
  color: var(--color-text);
  font-size: clamp(3rem, 8vw, 8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 0.95;
  margin: 0 0 clamp(2rem, 4vw, 4rem);
}

.skillset__lista {
  border-top: 1px solid color-mix(in srgb, var(--color-text-muted) 30%, transparent);
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.skillset__linha {
  align-items: baseline;
  border-bottom: 1px solid color-mix(in srgb, var(--color-text-muted) 30%, transparent);
  display: grid;
  gap: clamp(1rem, 2vw, 2rem);
  grid-template-columns: 3.5rem 1fr minmax(0, 22rem);
  padding-block: clamp(1.25rem, 2vw, 2rem);
  position: relative;
}

.skillset__numero {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.skillset__nome {
  color: var(--color-text);
  font-size: clamp(1.75rem, 3.5vw, 3.25rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.05;
  margin: 0;
}

.skillset__descricao {
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  text-align: right;
}

.skillset__imagem {
  height: 9rem;
  object-fit: cover;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16rem;
  z-index: 1;
}

@media (max-width: 767px) {
  .skillset__linha {
    grid-template-columns: 2.5rem 1fr;
  }
  .skillset__descricao {
    grid-column: 2;
    text-align: left;
  }
}

@media (hover: hover) {
  .skillset__linha .skillset__nome { color: var(--color-text-muted); }
  .skillset__linha .skillset__numero { color: var(--color-text-muted); }
  .skillset__linha--ativa .skillset__nome { color: var(--color-text); }
  .skillset__linha--ativa .skillset__numero { color: var(--color-accent); }
}
</style>
