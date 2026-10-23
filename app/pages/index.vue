<script setup lang="ts">
import { computed, ref } from 'vue'
import { projects } from '../content/projects'
import HeroSection from '../components/HeroSection.vue'
import MarqueeStrip from '../components/MarqueeStrip.vue'
import SectionIntro from '../components/SectionIntro.vue'
import SectionEvolution from '../components/SectionEvolution.vue'
import SectionHeading from '../components/SectionHeading.vue'
import ExperienceCard from '../components/ExperienceCard.vue'
import ProjectRow from '../components/ProjectRow.vue'
import SkillsetSection from '../components/SkillsetSection.vue'
import ContactSection from '../components/ContactSection.vue'
import { useVelocitySkew } from '../composables/useVelocitySkew'

const { dictionary } = useLocale()

const secoes = computed(() => dictionary.value.sections)
const layout = computed(() => dictionary.value.sections.layout)

// Wrapper interno do main recebe a distorcao por velocidade, nunca o html
// ou body inteiro, para nao borrar o cabecalho fixo e o cursor.
const wrapperSkew = ref<HTMLElement | null>(null)
useVelocitySkew(wrapperSkew)

// Conteúdo canônico e dicionário andam em paralelo por posição; o filtro
// descarta qualquer par sem texto para a linha nunca receber texto indefinido.
const projetosVinculados = computed(() =>
  projects
    .map((project, indice) => ({
      project,
      text: secoes.value.projects.items[indice],
    }))
    .filter(({ text }) => Boolean(text)),
)
</script>

<template>
  <div ref="wrapperSkew" class="home">
    <HeroSection />

    <MarqueeStrip :palavras="layout.marquee.palavras" :aria-label="layout.marquee.ariaLabel" />

    <SectionIntro />

    <SectionEvolution />

    <section id="experiencia" class="home__secao" data-testid="home-section">
      <div class="container">
        <SectionHeading numero="01" :kicker="secoes.experience.kicker" :title="secoes.experience.heading" />
        <div class="home__pilha">
          <ExperienceCard
            v-for="item in secoes.experience.items"
            :key="item.company"
            :item="item"
          />
        </div>
      </div>
    </section>

    <section id="projetos" class="home__secao" data-testid="home-section">
      <div class="container">
        <SectionHeading numero="02" :kicker="secoes.projects.kicker" :title="secoes.projects.heading" />
        <div class="home__linhas">
          <ProjectRow
            v-for="{ project, text } in projetosVinculados"
            :key="project.slug"
            :project="project"
            :text="text"
            :labels="secoes.projects.meta"
            :ver-projeto="secoes.projects.verProjeto"
          />
        </div>
      </div>
    </section>

    <SkillsetSection />

    <ContactSection />
  </div>
</template>

<style scoped>
.home__secao {
  padding-block: var(--space-section);
}

.home__pilha {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
}

.home__linhas {
  margin-top: 2rem;
}
</style>
