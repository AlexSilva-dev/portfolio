<script setup lang="ts">
import gifAlex from '../assets/gifs/alex.gif'
import { useParallax } from '../composables/useParallax'
import { useTilt } from '../composables/useTilt'
import { useCursorLit } from '../composables/useCursorLit'

const { locale, dictionary } = useLocale()
const paragrafo = computed(() => dictionary.value.sections.about.paragraphs[1])

// Trecho que acende direto pro violeta profundo, por idioma.
const DESTAQUE = {
  pt: 'nadar contra a maré',
  en: 'swim against the current',
} as const
const destaque = computed(() => DESTAQUE[locale.value] ?? DESTAQUE.pt)

const textoEl = ref<HTMLElement | null>(null)

useCursorLit(textoEl, {
  texto: () => paragrafo.value,
  destaque: () => destaque.value,
})

const polaroideEl = ref<HTMLElement | null>(null)
// Parallax de scroll e tilt de ponteiro, ambos cortados com movimento reduzido
useParallax(polaroideEl)
useTilt(polaroideEl)

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
      <!-- v-once, o composable é o dono do conteúdo deste nó depois do mount -->
      <p ref="textoEl" v-once class="evolucao__texto" data-testid="evolution-texto">{{ paragrafo }}</p>
      <figure
        ref="polaroideEl"
        class="evolucao__polaroide"
        data-testid="evolution-polaroide"
      >
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

/* Palavra do acendimento por cursor, a transição curta é só a ponte entre
   o dim e a tinta cheia, o estado dim vive no inline do composable. */
.evolucao__texto :deep(.evolucao__palavra) {
  transition: opacity 0.18s ease;
}

/* O trecho contra a maré acende pro violeta profundo em vez de tinta. */
.evolucao__texto :deep(.evolucao__palavra--destaque) {
  color: var(--color-accent-deep);
}

/* Polaroid do GIF, moldura branca sobre papel sustentada pela sombra difusa.
   A variavel --polaroide-elevacao, de 0 a 1, e animada pelo tilt do ponteiro
   e faz a sombra crescer junto com a inclinacao. */
.evolucao__polaroide {
  --polaroide-elevacao: 0;
  background: var(--color-paper);
  border: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
  box-shadow:
    0
    calc(18px + var(--polaroide-elevacao) * 12px)
    calc(40px + var(--polaroide-elevacao) * 24px)
    color-mix(in srgb, var(--color-ink) 18%, transparent);
  justify-self: center;
  margin: 0;
  padding: 0.75rem;
  transform: rotate(-6deg);
  will-change: transform;
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
  .evolucao__polaroide img,
  .evolucao__texto :deep(.evolucao__palavra) {
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
