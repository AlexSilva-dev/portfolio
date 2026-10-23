<script setup lang="ts">
import alexCut from '../assets/img/alex-cut.png'
import iconeCss from '../assets/icons/icons8-css-96.png'
import iconeGithub from '../assets/icons/icons8-github-100.png'
import iconeHtml from '../assets/icons/icons8-html-96.png'
import iconeJavascript from '../assets/icons/icons8-javascript-48.png'
import iconeKotlin from '../assets/icons/icons8-kotlin-96.png'
import iconeSpring from '../assets/icons/icons8-spring-boot-48.png'
import iconeVue from '../assets/icons/icons8-vue-js-96.png'
import { useImageTrail } from '../composables/useImageTrail'
import { useMagnetic } from '../composables/useMagnetic'

const { dictionary } = useLocale()
const hero = computed(() => dictionary.value.sections.hero)

const fotoEl = ref<HTMLElement | null>(null)
const ctaPrimariaEl = ref<HTMLElement | null>(null)
const ctaSecundariaEl = ref<HTMLElement | null>(null)

// Rastro de icones de tech com fundo transparente, revelado SOMENTE dentro
// do container da foto, decisao do fix visual aprovada pelo dono.
const ICONES_TRAIL = [
  iconeKotlin,
  iconeVue,
  iconeSpring,
  iconeHtml,
  iconeCss,
  iconeJavascript,
  iconeGithub,
]
const itensTrilha = ICONES_TRAIL.map((src) => ({ src }))

useImageTrail(fotoEl, itensTrilha)
useMagnetic(ctaPrimariaEl)
useMagnetic(ctaSecundariaEl)
</script>

<template>
  <section id="hero" class="hero" data-testid="hero">
    <header class="hero__cabecalho">
      <p class="hero__wordmark" data-testid="hero-wordmark">Alex Alves</p>
    </header>
    <div class="hero__linha" data-testid="hero-rule" aria-hidden="true"></div>
    <div class="hero__grade">
      <div class="hero__texto">
        <div class="hero__topo">
          <p class="hero__kicker" data-testid="hero-kicker">{{ hero.kicker }}</p>
          <p class="hero__badge" data-testid="hero-badge">
            <span class="hero__badge-dot" aria-hidden="true"></span>
            {{ hero.badge }}
          </p>
        </div>
        <h1 class="hero__titulo" data-testid="hero-title">
          <span class="hero__titulo-linha">Alex</span>
          <span class="hero__titulo-linha">Alves</span>
        </h1>
        <ul class="hero__chips" data-testid="hero-chips">
          <li
            v-for="chip in hero.chips"
            :key="chip"
            class="hero__chip"
            data-testid="hero-chip"
          >
            {{ chip }}
          </li>
        </ul>
        <p class="hero__sub" data-testid="hero-sub">{{ hero.sub }}</p>
        <div class="hero__stats">
          <div
            v-for="stat in hero.stats"
            :key="stat.rotulo"
            class="hero__stat"
            data-testid="hero-stat"
          >
            <strong class="hero__stat-valor" data-testid="stat-valor">{{ stat.valor }}</strong>
            <span class="hero__stat-rotulo" data-testid="stat-rotulo">{{ stat.rotulo }}</span>
          </div>
        </div>
        <div class="hero__ctas">
          <a
            class="hero__cta hero__cta--primario"
            href="mailto:alexdsilva.dev@gmail.com"
            ref="ctaPrimariaEl"
            data-testid="hero-cta-primary"
          >
            {{ hero.ctas.primary }}
          </a>
          <a
            class="hero__cta hero__cta--secundario"
            href="#experiencia"
            ref="ctaSecundariaEl"
            data-testid="hero-cta-secondary"
          >
            {{ hero.ctas.secondary }}
          </a>
        </div>
      </div>
      <figure ref="fotoEl" class="hero__foto" data-testid="hero-photo-container">
        <img
          :src="alexCut"
          :alt="hero.photoAlt"
          width="768"
          height="1201"
          decoding="async"
          fetchpriority="high"
          data-testid="hero-photo"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: var(--color-paper);
  color: var(--color-ink);
  display: flex;
  flex-direction: column;
  font-family: var(--font-sans);
  /* Full-bleed, escapa do main.container do layout atravessando a viewport,
     mesmo padrao de Skillset e Contato, com o overflow-x clip global */
  margin-inline: calc(50% - 50vw);
  min-height: 100dvh;
  overflow: hidden;
  padding-block: 1.5rem clamp(2rem, 4vw, 3rem);
  padding-inline: clamp(1.5rem, 6vw, 6rem);
  position: relative;
  width: 100vw;
}

.hero__grade {
  position: relative;
  z-index: 1;
}

.hero__cabecalho {
  position: relative;
  z-index: 1;
}

.hero__wordmark {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

.hero__linha {
  border-top: 1px solid var(--color-ink);
  margin-top: 0.75rem;
  width: 100%;
}

.hero__grade {
  align-items: stretch;
  display: grid;
  flex: 1;
  gap: clamp(2rem, 4vw, 4rem);
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  margin-top: clamp(1.5rem, 3vw, 3rem);
}

.hero__texto {
  display: flex;
  flex-direction: column;
  gap: clamp(0.9rem, 2vh, 1.5rem);
  min-width: 0;
}

.hero__topo {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero__kicker {
  color: var(--color-accent-deep);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  margin: 0;
}

.hero__badge {
  align-items: center;
  border: 1px solid color-mix(in srgb, var(--color-status-green) 75%, transparent);
  display: flex;
  font-size: 0.8125rem;
  gap: 0.5rem;
  margin: 0;
  padding: 0.25rem 0.75rem;
}

.hero__badge-dot {
  background: var(--color-status-green);
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
}

.hero__titulo {
  font-size: clamp(3rem, 12vw, 14rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 0.9;
  margin: 0;
  text-transform: uppercase;
}

.hero__titulo-linha {
  display: block;
}

.hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  max-width: 36rem;
  padding: 0;
}

.hero__chip {
  border: 1px solid var(--color-ink);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  padding: 0.375rem 0.875rem;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.hero__chip:hover {
  border-color: var(--color-accent-deep);
  color: var(--color-accent-deep);
}

.hero__sub {
  color: color-mix(in srgb, var(--color-ink) 75%, var(--color-paper));
  font-size: 1.0625rem;
  line-height: 1.6;
  margin: 0;
  max-width: 36rem;
}

.hero__stats {
  display: grid;
  gap: clamp(1rem, 2vw, 2rem);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 0.5rem;
}

.hero__stat {
  border-top: 1px solid var(--color-accent);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.75rem;
}

.hero__stat-valor {
  color: var(--color-accent-deep);
  font-family: var(--font-mono);
  font-size: 1.25rem;
}

.hero__stat-rotulo {
  color: color-mix(in srgb, var(--color-ink) 65%, var(--color-paper));
  font-size: 0.8125rem;
  line-height: 1.35;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.hero__cta {
  border-radius: 0.25rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  text-align: center;
  text-decoration: none;
  transition: filter 0.15s ease;
}

.hero__cta:hover {
  filter: brightness(1.1);
}

.hero__cta--primario {
  background: var(--color-ink);
  color: var(--color-paper);
}

.hero__cta--secundario {
  border: 1px solid var(--color-ink);
  color: var(--color-ink);
}

.hero__foto {
  height: 100%;
  margin: 0;
  min-height: 0;
  position: relative;
}

.hero__foto img {
  display: block;
  filter: grayscale(1);
  height: 100%;
  object-fit: contain;
  width: 100%;
}

/* Altura baixa de desktop e notebooks: display e respiros compactados pra
   nome, chips, numeros e CTAs ficarem acima da dobra em 1280x720. */
@media (min-width: 768px) and (max-height: 820px) {
  .hero {
    padding-block: 1rem 2rem;
  }

  .hero__titulo {
    font-size: clamp(2.75rem, 11vw, 8.5rem);
  }

  .hero__texto {
    gap: 0.75rem;
  }
}

@media (max-width: 767px) {
  .hero__grade {
    grid-template-columns: 1fr;
  }

  .hero__foto {
    order: 2;
  }

  .hero__cta {
    flex: 1 1 100%;
  }
}
</style>
