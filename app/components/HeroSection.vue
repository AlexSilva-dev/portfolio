<script setup lang="ts">
import StatCard from './StatCard.vue'
import fotoHero from '../assets/img/alex-hero.jpg'

const { dictionary } = useLocale()
const hero = computed(() => dictionary.value.sections.hero)
</script>

<template>
  <section id="hero" class="hero" data-testid="hero">
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
            data-testid="hero-cta-primary"
          >
            {{ hero.ctas.primary }}
          </a>
          <a
            class="hero__cta hero__cta--secundario"
            href="#experiencia"
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
  padding-block: var(--space-section);
  padding-inline: clamp(1.25rem, 5vw, 4rem);
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
