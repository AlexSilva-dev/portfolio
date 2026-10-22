<script setup lang="ts">
import gifAlex from '../assets/gifs/alex.gif'

const { locale, dictionary } = useLocale()
const paragrafo = computed(() => dictionary.value.sections.about.paragraphs[1])

// Alt descritivo por idioma, mesmo padrão de rótulos do SectionIntro
const ALTS = {
  pt: 'GIF antigo de Alex Alves programando no computador, registro da trajetória dele até hoje',
  en: 'Old GIF of Alex Alves coding on a computer, a record of his journey to the present',
} as const
const alt = computed(() => ALTS[locale.value] ?? ALTS.pt)
</script>

<template>
  <section id="sobre" class="evolucao" data-testid="section-evolution">
    <div class="evolucao__miolo">
      <p class="evolucao__texto" data-testid="evolution-texto">{{ paragrafo }}</p>
      <figure class="evolucao__polaroide" data-testid="evolution-polaroide">
        <img
          :src="gifAlex"
          :alt="alt"
          width="864"
          height="864"
          decoding="async"
          loading="lazy"
          data-testid="evolution-gif"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.evolucao {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
  padding-block: var(--space-section);
  padding-inline: clamp(1.25rem, 5vw, 4rem);
}

.evolucao__miolo {
  align-items: center;
  display: grid;
  gap: clamp(2rem, 5vw, 4rem);
  margin-inline: auto;
  max-width: 72rem;
}

.evolucao__texto {
  font-size: clamp(1.25rem, 2.5vw, 2rem);
  line-height: 1.55;
  margin: 0;
  max-width: 58rem;
}

/* Polaroid do GIF, moldura branca sobre papel sustentada pela sombra difusa */
.evolucao__polaroide {
  background: var(--color-paper);
  border: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
  box-shadow: 0 18px 40px color-mix(in srgb, var(--color-ink) 18%, transparent);
  justify-self: center;
  margin: 0;
  padding: 0.75rem;
  transform: rotate(-6deg);
}

.evolucao__polaroide img {
  display: block;
  filter: grayscale(1);
  height: auto;
  transition: filter 0.3s ease;
  width: clamp(11rem, 22vw, 17rem);
}

@media (hover: hover) {
  .evolucao__polaroide:hover img {
    filter: grayscale(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .evolucao__polaroide img {
    transition: none;
  }
}

@media (max-width: 767px) {
  .evolucao__polaroide {
    order: -1;
  }
}

@media (min-width: 768px) {
  .evolucao__miolo {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}
</style>
