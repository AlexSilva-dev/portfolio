<script setup lang="ts">
import bgCodigo from '../assets/img/2560x1600-px-code-coding-computer-Computer-screen-Java-1288551-wallhere.com.jpg'

const { dictionary } = useLocale()
const contato = computed(() => dictionary.value.sections.contact)

const EMAIL = 'alexdsilva.dev@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/alex-da-silva1'
const GITHUB_URL = 'https://github.com/AlexSilva-dev'

const { copied, copyEmail } = useCopyEmail(EMAIL)
</script>

<template>
  <section id="contato" class="contato" data-testid="contact-section">
    <img
      class="contato__bg"
      :src="bgCodigo"
      alt=""
      aria-hidden="true"
      decoding="async"
      data-testid="contact-bg"
    />
    <div class="contato__veu" aria-hidden="true"></div>

    <article class="contato__cartao" data-testid="contact-card">
      <p class="contato__kicker" data-testid="contact-kicker">( {{ contato.kicker }} )</p>
      <h2 class="contato__titulo" data-testid="contact-heading">{{ contato.heading }}</h2>

      <p class="contato__direto" data-testid="contact-direct">
        {{ contato.writeDirect }}
        <a
          class="contato__email"
          :href="`mailto:${EMAIL}`"
          data-testid="contact-email"
        >{{ EMAIL }}</a>
      </p>

      <div class="contato__acoes">
        <a
          class="contato__acao contato__acao--primaria"
          :href="`mailto:${EMAIL}`"
          data-testid="contact-send-email"
        >
          {{ contato.sendEmail }}
          <span class="contato__seta" aria-hidden="true">→</span>
        </a>
        <button
          type="button"
          class="contato__acao contato__acao--secundaria"
          data-testid="contact-copy-email"
          @click="copyEmail()"
        >
          {{ contato.copyEmail }}
        </button>
        <span
          v-if="copied"
          class="contato__feedback"
          role="status"
          data-testid="contact-copy-feedback"
        >
          {{ contato.copyFeedback }}
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
            {{ contato.linkedinLabel }}
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
            {{ contato.githubLabel }}
          </a>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
/* Fundo escuro da seção sobrepõe o anel de foco pro tom claro da área
   escura (base.css, tokens da change), tinta de cartão herda o anel */
.contato {
  --focus-ring: 2px solid var(--color-accent);

  overflow: hidden;
  padding-block: clamp(6rem, 12vw, 10rem);
  padding-inline: 1.5rem;
  position: relative;
}

.contato__bg {
  height: 100%;
  inset: 0;
  object-fit: cover;
  position: absolute;
  width: 100%;
}

.contato__veu {
  background: color-mix(in srgb, var(--color-bg) 82%, transparent);
  inset: 0;
  position: absolute;
}

.contato__cartao {
  background: var(--color-ink);
  border-radius: 1.25rem;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-inline: auto;
  max-width: 72rem;
  padding-block: clamp(3rem, 7vw, 6rem);
  padding-inline: clamp(1.5rem, 4vw, 3rem);
  position: relative;
  text-align: center;
  width: 60%;
  z-index: 1;
}

.contato__kicker {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  margin: 0;
}

.contato__titulo {
  color: var(--color-text);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 0.95;
  margin: 0;
}

.contato__direto {
  color: var(--color-text-muted);
  font-size: 1.125rem;
  margin: 0;
}

.contato__email {
  color: var(--color-text);
  display: block;
  font-size: clamp(1.375rem, 3vw, 2.5rem);
  font-weight: 700;
  margin-top: 0.5rem;
  overflow-wrap: anywhere;
  text-decoration: underline;
  text-decoration-color: var(--color-accent);
  text-decoration-thickness: 3px;
  text-underline-offset: 8px;
}

.contato__email:hover {
  color: var(--color-accent);
}

.contato__acoes {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.contato__acao {
  align-items: center;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
}

.contato__acao--primaria {
  background: var(--color-text);
  color: var(--color-ink);
}

.contato__acao--secundaria {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--color-accent) 60%, transparent);
  color: var(--color-text);
}

.contato__acao:hover {
  filter: brightness(1.1);
}

.contato__seta {
  font-size: 1.125rem;
}

.contato__feedback {
  color: var(--color-status-green);
  font-size: 0.875rem;
}

.contato__links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0.5rem 0 0;
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

.contato__acao:focus-visible,
.contato__email:focus-visible,
.contato__link:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .contato__cartao {
    width: 100%;
  }
}
</style>
