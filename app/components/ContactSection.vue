<script setup lang="ts">
const { dictionary } = useLocale()

const EMAIL = 'alexdsilva.dev@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/alex-da-silva1'
const GITHUB_URL = 'https://github.com/AlexSilva-dev'

const { copied, copyEmail } = useCopyEmail(EMAIL)
</script>

<template>
  <section id="contato" class="contato" aria-labelledby="contato-titulo" data-testid="contact-section">
    <p class="contato__kicker">{{ dictionary.sections.contact.kicker }}</p>
    <h2 id="contato-titulo" class="contato__heading">
      {{ dictionary.sections.contact.heading }}
    </h2>
    <p class="contato__sub">{{ dictionary.sections.contact.sub }}</p>

    <p class="contato__email" data-testid="contact-email">{{ EMAIL }}</p>

    <div class="contato__acoes">
      <a
        class="contato__acao contato__acao--primaria"
        :href="`mailto:${EMAIL}`"
        data-testid="contact-send-email"
      >
        {{ dictionary.sections.contact.sendEmail }}
      </a>
      <button
        type="button"
        class="contato__acao contato__acao--secundaria"
        data-testid="contact-copy-email"
        @click="copyEmail()"
      >
        {{ dictionary.sections.contact.copyEmail }}
      </button>
      <span
        v-if="copied"
        class="contato__feedback"
        role="status"
        data-testid="contact-copy-feedback"
      >
        {{ dictionary.sections.contact.copyFeedback }}
      </span>
    </div>

    <ul class="contato__links">
      <li>
        <a
          :href="LINKEDIN_URL"
          target="_blank"
          rel="noopener"
          class="contato__link"
          data-testid="contact-linkedin"
        >
          {{ dictionary.sections.contact.linkedinLabel }}
        </a>
      </li>
      <li>
        <a
          :href="GITHUB_URL"
          target="_blank"
          rel="noopener"
          class="contato__link"
          data-testid="contact-github"
        >
          {{ dictionary.sections.contact.githubLabel }}
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.contato {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-block: var(--space-section);
  text-align: center;
}

.contato__kicker {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  margin: 0;
}

.contato__heading {
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin: 0;
}

.contato__sub {
  color: var(--color-text-muted);
  margin: 0;
}

.contato__email {
  color: var(--color-text);
  font-family: var(--font-mono);
  margin: 0;
}

.contato__acoes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.contato__acao {
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
}

.contato__acao:focus-visible,
.contato__link:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

.contato__acao--primaria {
  background: var(--color-accent);
  color: var(--color-bg);
}

.contato__acao--secundaria {
  background: transparent;
  border: 1px solid var(--color-accent);
  color: var(--color-text);
}

.contato__feedback {
  color: var(--color-status-green);
  font-family: var(--font-sans);
  font-size: 0.875rem;
}

.contato__links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.contato__link {
  color: var(--color-text);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.contato__link:hover {
  color: var(--color-accent);
}
</style>
