<script setup lang="ts">
import fotoCodigo from '../assets/img/code.webp'
import fotoTelaCodigo from '../assets/img/2560x1600-px-code-coding-computer-Computer-screen-Java-1288551-wallhere.com.jpg'
import fotoAppEventos from '../assets/img/unify-eventos.webp'
import iconeKotlin from '../assets/icons/icons8-kotlin-96.png'
import iconeVue from '../assets/icons/icons8-vue-js-96.png'
import iconeJs from '../assets/icons/icons8-javascript-48.png'
import iconeCss from '../assets/icons/icons8-css-96.png'
import iconeHtml from '../assets/icons/icons8-html-96.png'
import iconeSpringBoot from '../assets/icons/icons8-spring-boot-48.png'
import iconePhp from '../assets/icons/icons8-php-80.png'

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

// Ícones de tecnologia por frente, decorativos, junto ao nome da linha.
// 04 IA aplicada, 05 Infra e deploy e 06 Práticas não têm ícone no acervo
// e ficam sem, nunca ícone forçado.
const ICONES_POR_FRENTE = [
  [iconeKotlin],
  [iconeVue, iconeJs, iconeCss, iconeHtml],
  [iconeSpringBoot, iconePhp],
  [],
  [],
  [],
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
        <h3 class="skillset__nome" data-testid="skillset-name">
          {{ grupo.label }}
          <span
            v-if="ICONES_POR_FRENTE[indice].length"
            class="skillset__icones"
            data-testid="skillset-icons"
          >
            <img
              v-for="icone in ICONES_POR_FRENTE[indice]"
              :key="icone"
              :src="icone"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          </span>
        </h3>
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
  </section>
</template>

<style scoped>
/* Full-bleed, escapa do main.container do layout atravessando a viewport,
   linhas 01 a 06 de borda a borda com padding lateral generoso */
.skillset {
  background: var(--color-void);
  color: var(--color-text);
  margin-inline: calc(50% - 50vw);
  padding-block: var(--space-section);
  padding-inline: clamp(1.5rem, 6vw, 6rem);
  width: 100vw;
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
  transition: padding-block 0.35s ease;
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

/* Ícones decorativos junto ao nome, fora do alcance do cursor pra não
   roubar o hover da linha */
.skillset__icones {
  display: inline-flex;
  gap: 0.5rem;
  margin-left: 0.75rem;
  vertical-align: middle;
}

.skillset__icones img {
  height: 2rem;
  object-fit: contain;
  pointer-events: none;
  width: 2rem;
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
  .skillset__linha--ativa { padding-block: clamp(2rem, 3.5vw, 3.5rem); }
  .skillset__linha--ativa .skillset__nome { color: var(--color-text); }
  .skillset__linha--ativa .skillset__numero { color: var(--color-accent); }
  .skillset__linha--ativa .skillset__descricao { color: var(--color-text); }
}

@media (prefers-reduced-motion: reduce) {
  .skillset__linha { transition: none; }
}
</style>
