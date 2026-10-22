<script setup lang="ts">
import fotoHero from '../assets/img/alex-hero.jpg'
import { useTextFill } from '../composables/useTextFill'

const { locale, dictionary } = useLocale()
const paragrafo = computed(() => dictionary.value.sections.about.paragraphs[0])

// A foto da polaroid é a mesma real do hero, o alt reaproveita o dicionário.
const altFoto = computed(() => dictionary.value.sections.hero.photoAlt)

// Rótulos e trecho de destaque por idioma, cobertos nos dois dicionários.
const ROTULOS = { pt: 'TRAJETÓRIA', en: 'TRAJECTORY' } as const
const rotulo = computed(() => ROTULOS[locale.value] ?? ROTULOS.pt)

const DESTAQUES = {
  pt: 'o primeiro da minha família',
  en: 'the first in my family',
} as const
const destaque = computed(() => DESTAQUES[locale.value] ?? DESTAQUES.pt)

const textoEl = ref<HTMLElement | null>(null)

useTextFill(textoEl, {
  texto: () => dictionary.value.sections.about.paragraphs[0],
  destaque: () => destaque.value,
})
</script>

<template>
  <section class="intro" data-testid="section-intro">
    <div class="intro__miolo">
      <div class="intro__bloco">
        <p class="intro__rotulo" data-testid="intro-rotulo">({{ rotulo }})</p>
        <!-- v-once, o composable é o dono do conteúdo deste nó depois do mount -->
        <p ref="textoEl" v-once class="intro__texto" data-testid="intro-texto">{{ paragrafo }}</p>
      </div>
      <figure class="intro__polaroide" data-testid="intro-polaroide">
        <img
          :src="fotoHero"
          :alt="altFoto"
          width="768"
          height="960"
          decoding="async"
          loading="lazy"
          data-testid="intro-foto"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.intro {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
  padding-block: var(--space-section);
  padding-inline: clamp(1.25rem, 5vw, 4rem);
}

.intro__miolo {
  align-items: center;
  display: grid;
  gap: clamp(2rem, 5vw, 4rem);
  margin-inline: auto;
  max-width: 72rem;
}

.intro__rotulo {
  color: color-mix(in srgb, var(--color-ink) 60%, var(--color-paper));
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  margin: 0 0 1.5rem;
}

.intro__texto {
  font-size: clamp(1.5rem, 3vw, 2.75rem);
  line-height: 1.5;
  margin: 0;
  max-width: 58rem;
}

.intro__texto :deep(.intro__palavra--destaque) {
  color: var(--color-accent-deep);
}

.intro__polaroide {
  background: var(--color-paper);
  border: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
  box-shadow: 0 18px 40px color-mix(in srgb, var(--color-ink) 18%, transparent);
  justify-self: center;
  margin: 0;
  padding: 0.75rem;
  transform: rotate(6deg);
}

.intro__polaroide img {
  display: block;
  filter: grayscale(1);
  height: auto;
  width: clamp(11rem, 22vw, 17rem);
}

@media (max-width: 767px) {
  .intro__polaroide {
    order: -1;
  }
}

@media (min-width: 768px) {
  .intro__miolo {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}
</style>
