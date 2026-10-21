<script setup lang="ts">
import StatCard from './StatCard.vue'
import fotoHero from '../assets/img/alex-hero.jpg'
import { useImageTrail } from '../composables/useImageTrail'
import { useMagnetic } from '../composables/useMagnetic'

const { dictionary } = useLocale()
const hero = computed(() => dictionary.value.sections.hero)

const heroEl = ref<HTMLElement | null>(null)
const ctaPrimariaEl = ref<HTMLElement | null>(null)
const ctaSecundariaEl = ref<HTMLElement | null>(null)

// O rastro reusa a MESMA foto do hero com tratamentos de filtro CSS,
// zero bytes novos de rede, decisao aprovada no gate 2.
const TRATAMENTOS_TRAIL = [
  'grayscale(1) contrast(1.15)',
  'sepia(0.5) saturate(1.3)',
  'hue-rotate(160deg) saturate(0.85) brightness(1.05)',
  'contrast(1.35) brightness(0.8)',
  'grayscale(0.55) sepia(0.25) contrast(1.1)',
  'hue-rotate(-45deg) saturate(1.2) contrast(1.05)',
]
const itensTrilha = TRATAMENTOS_TRAIL.map((filtro) => ({ src: fotoHero, filtro }))

useImageTrail(heroEl, itensTrilha)
useMagnetic(ctaPrimariaEl)
useMagnetic(ctaSecundariaEl)
</script>

<template>
  <section id="hero" ref="heroEl" class="hero" data-testid="hero">
    <div class="hero__conteudo">
      <div class="hero__texto">
        <p class="hero__kicker" data-testid="hero-kicker">{{ hero.kicker }}</p>
        <p class="hero__badge" data-testid="hero-badge">
          <span class="hero__badge-dot" aria-hidden="true"></span>
          {{ hero.badge }}
        </p>
        <h1 class="hero__titulo" data-testid="hero-title">{{ hero.h1 }}</h1>
        <p class="hero__especialidades" data-testid="hero-specialties">{{ hero.specialties }}</p>
        <p class="hero__sub" data-testid="hero-sub">{{ hero.sub }}</p>
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
      <figure class="hero__foto">
        <img
          :src="fotoHero"
          :alt="hero.photoAlt"
          width="768"
          height="960"
          decoding="async"
          fetchpriority="high"
          data-testid="hero-photo"
        />
      </figure>
    </div>
    <div class="hero__stats">
      <StatCard
        v-for="stat in hero.stats"
        :key="stat.rotulo"
        :valor="stat.valor"
        :rotulo="stat.rotulo"
      />
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  overflow: hidden;
  padding-block: var(--space-section);
  padding-inline: clamp(1.25rem, 5vw, 4rem);
  position: relative;
}

.hero__conteudo,
.hero__stats {
  position: relative;
  z-index: 1;
}

.hero__conteudo {
  align-items: center;
  display: grid;
  gap: clamp(2rem, 5vw, 4rem);
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  margin-inline: auto;
  max-width: 64rem;
}

.hero__texto {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero__kicker {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  margin: 0;
}

.hero__badge {
  align-items: center;
  align-self: flex-start;
  border: 1px solid color-mix(in srgb, var(--color-status-green) 45%, transparent);
  border-radius: 999px;
  color: var(--color-text);
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
  color: var(--color-text);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  margin: 0;
}

.hero__especialidades {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 1rem;
  margin: 0;
}

.hero__sub {
  color: var(--color-text-muted);
  font-size: 1.0625rem;
  line-height: 1.6;
  margin: 0;
  max-width: 34rem;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.hero__cta {
  border-radius: 0.5rem;
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
  background: var(--color-accent);
  color: var(--color-bg);
}

.hero__cta--secundario {
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}

.hero__foto {
  margin: 0;
  max-width: 24rem;
}

.hero :deep([data-image-trail] img) {
  aspect-ratio: 4 / 5;
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  border-radius: 0.5rem;
  box-shadow: 0 12px 32px color-mix(in srgb, var(--color-text) 25%, transparent);
  object-fit: cover;
  width: 7.5rem;
}

.hero__foto img {
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
  border-radius: 0.75rem;
  display: block;
  height: auto;
  width: 100%;
}

.hero__stats {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: clamp(2rem, 5vw, 3rem) auto 0;
  max-width: 64rem;
}

/* Altura baixa de desktop e notebooks: compacta respiros, título e foto
   pra kicker, selo, título, especialidades, sub, foto e os 3 números
   caberem acima da dobra em 1280x720 (evidência qa-ux). */
@media (min-width: 768px) and (max-height: 820px) {
  .hero {
    padding-block: 3rem;
  }

  .hero__texto {
    gap: 0.75rem;
  }

  .hero__titulo {
    font-size: clamp(2rem, 3.5vw, 2.5rem);
  }

  .hero__foto {
    max-width: 18rem;
  }

  .hero__stats {
    margin-top: 1.5rem;
  }
}

@media (max-width: 767px) {
  .hero__conteudo {
    grid-template-columns: 1fr;
  }

  .hero__foto {
    order: 1;
  }

  .hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hero__cta {
    flex: 1 1 100%;
  }
}
</style>
