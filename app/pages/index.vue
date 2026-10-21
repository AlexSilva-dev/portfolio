<script setup lang="ts">
import { computed } from 'vue'
import { projects } from '../content/projects'
import HeroSection from '../components/HeroSection.vue'
import SectionHeading from '../components/SectionHeading.vue'
import ExperienceCard from '../components/ExperienceCard.vue'
import ProjectCard from '../components/ProjectCard.vue'
import TechGroup from '../components/TechGroup.vue'
import ContactSection from '../components/ContactSection.vue'

const { dictionary } = useLocale()

const secoes = computed(() => dictionary.value.sections)

// Conteúdo canônico e dicionário andam em paralelo por posição; o filtro
// descarta qualquer par sem texto para o card nunca receber texto indefinido.
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
  <div class="home">
    <HeroSection />

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
        <div class="home__grade home__grade--projetos">
          <ProjectCard
            v-for="{ project, text } in projetosVinculados"
            :key="project.slug"
            :project="project"
            :text="text"
          />
        </div>
      </div>
    </section>

    <section id="sobre" class="home__secao" data-testid="home-section">
      <div class="container">
        <SectionHeading numero="03" :kicker="secoes.about.kicker" :title="secoes.about.heading" />
        <div class="home__sobre">
          <p
            v-for="(paragrafo, indice) in secoes.about.paragraphs"
            :key="indice"
            class="home__paragrafo"
            data-testid="about-paragraph"
          >
            {{ paragrafo }}
          </p>
        </div>
      </div>
    </section>

    <section id="tecnologias" class="home__secao" data-testid="home-section">
      <div class="container">
        <SectionHeading numero="04" :kicker="secoes.tech.kicker" :title="secoes.tech.heading" />
        <div class="home__grade home__grade--tech">
          <TechGroup
            v-for="grupo in secoes.tech.groups"
            :key="grupo.label"
            :label="grupo.label"
            :items="grupo.items"
            :core="grupo.core"
          />
        </div>
        <p class="home__tech-fecho" data-testid="tech-closing">
          {{ secoes.tech.closing.prefix }}
          <a
            :href="secoes.tech.closing.github.href"
            target="_blank"
            rel="noopener"
          >{{ secoes.tech.closing.github.label }}</a>
          {{ secoes.tech.closing.separator }}
          <a
            :href="secoes.tech.closing.linkedin.href"
            target="_blank"
            rel="noopener"
          >{{ secoes.tech.closing.linkedin.label }}</a>{{ secoes.tech.closing.suffix }}
        </p>
      </div>
    </section>

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

.home__grade {
  display: grid;
  gap: 1.25rem;
  margin-top: 2rem;
}

.home__grade--projetos {
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
}

.home__grade--tech {
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}

.home__sobre {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.home__paragrafo {
  color: var(--color-text-muted);
  max-width: 65ch;
}

.home__tech-fecho {
  color: var(--color-text-muted);
  margin-top: 2rem;
}

.home__tech-fecho a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.home__tech-fecho a:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}
</style>
