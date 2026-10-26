<script setup lang="ts">
const { locale } = useLocale()

// O desenho é o mesmo nos dois idiomas, só o titulo acessível muda. A cena
// não carrega texto para não duplicar idioma nem virar letra miúda na moldura.
const TITULOS = {
  pt: 'Ilustração de um monitor antigo sobre a mesa, com uma janela aberta para a noite e um caminho pontilhado em violeta saindo da tela até um nó de inteligência artificial',
  en: 'Illustration of an old monitor on a desk, with a window open to the night and a dotted violet path rising from the screen to an artificial intelligence node',
} as const
const titulo = computed(() => TITULOS[locale.value] ?? TITULOS.pt)

const raiz = ref<SVGSVGElement | null>(null)
const animavel = ref(false)
const visivel = ref(false)
let observador: IntersectionObserver | undefined

// O caminho e o nó só são escondidos quando existe IntersectionObserver e o
// visitante aceita movimento. Sem JS, sem observer ou com movimento reduzido,
// o desenho nasce inteiro e estático.
onMounted(() => {
  if (typeof window === 'undefined') return
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!('IntersectionObserver' in window) || !raiz.value) return

  animavel.value = true
  observador = new IntersectionObserver(
    (entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) {
        visivel.value = true
        observador?.disconnect()
      }
    },
    { threshold: 0.4 },
  )
  observador.observe(raiz.value)
})

onBeforeUnmount(() => observador?.disconnect())
</script>

<template>
  <svg
    ref="raiz"
    class="evolucao-ilustracao"
    :class="{ 'is-animavel': animavel, 'is-visivel': visivel }"
    viewBox="0 0 864 864"
    role="img"
    aria-labelledby="evolucao-ilustracao-titulo"
    data-testid="evolution-ilustracao"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title id="evolucao-ilustracao-titulo">{{ titulo }}</title>

    <g fill="none" stroke="var(--color-ink)" stroke-linecap="round" stroke-linejoin="round">
      <rect x="548" y="96" width="240" height="264" rx="6" stroke-width="6" />
      <path d="M668 100V356M552 228H784" stroke-width="4" opacity="0.4" />
      <circle cx="722" cy="164" r="26" stroke-width="4" />
    </g>
    <g fill="var(--color-ink)" opacity="0.45">
      <circle cx="594" cy="140" r="3" />
      <circle cx="764" cy="270" r="3" />
      <circle cx="628" cy="288" r="2.5" />
      <circle cx="742" cy="118" r="2" />
    </g>

    <g fill="none" stroke="var(--color-ink)" stroke-linecap="round">
      <path d="M88 668q344-12 692-4" stroke-width="6" />
      <path d="M124 692h612" stroke-width="3" opacity="0.28" />
    </g>

    <g stroke="var(--color-ink)" stroke-linecap="round" stroke-linejoin="round">
      <rect
        x="150"
        y="318"
        width="330"
        height="252"
        rx="16"
        fill="var(--color-paper)"
        stroke-width="6"
      />
      <rect
        x="172"
        y="340"
        width="286"
        height="196"
        rx="8"
        fill="var(--color-paper)"
        stroke-width="4"
      />
      <g fill="none" stroke-width="4" opacity="0.7">
        <path d="M196 386h118" />
        <path d="M196 418h176" />
        <path d="M196 450h84" />
      </g>
      <rect x="292" y="438" width="12" height="22" fill="var(--color-accent-deep)" stroke="none" />
      <path d="M292 570h46l14 38h-74z" fill="var(--color-paper)" stroke-width="5" />
      <path d="M250 608h136" stroke-width="6" />
    </g>

    <g stroke="var(--color-ink)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M206 640h212l20 32H184z" fill="var(--color-paper)" stroke-width="5" />
      <g fill="none" stroke-width="3" opacity="0.55">
        <path d="M222 652h16M248 652h16M274 652h16M300 652h16M326 652h16M352 652h16M378 652h18" />
        <path d="M216 662h18M244 662h18M272 662h18M300 662h18M328 662h18M356 662h18M384 662h18" />
      </g>
    </g>

    <g stroke="var(--color-ink)" stroke-linejoin="round">
      <path
        d="M660 596h64v40a12 12 0 0 1-12 12h-40a12 12 0 0 1-12-12z"
        fill="var(--color-paper)"
        stroke-width="5"
      />
      <path d="M724 610h8a14 14 0 0 1 0 28h-8" fill="none" stroke-width="5" />
    </g>
    <g
      fill="none"
      stroke="var(--color-ink)"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.5"
    >
      <path d="M678 580c-8-12 8-18 0-30" />
      <path d="M700 580c-8-12 8-18 0-30" />
    </g>

    <g fill="var(--color-paper)" stroke="var(--color-ink)" stroke-width="4" stroke-linejoin="round">
      <rect x="96" y="702" width="118" height="16" rx="3" />
      <rect x="104" y="718" width="102" height="14" rx="3" />
      <rect x="112" y="732" width="86" height="12" rx="3" />
      <path d="M118 702v16M134 718v14M142 732v12" fill="none" stroke-width="3" opacity="0.45" />
    </g>

    <g fill="none" stroke="var(--color-ink)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M762 724h44l-6 44h-32z" fill="var(--color-paper)" stroke-width="4" />
      <path d="M784 724v-18" stroke-width="3" opacity="0.6" />
      <path d="M784 706c-14-2-22-12-20-24 12-2 22 8 20 24z" fill="var(--color-paper)" stroke-width="3" />
      <path d="M784 706c14-2 22-12 20-24-12-2-22 8-20 24z" fill="var(--color-paper)" stroke-width="3" />
    </g>

    <g
      class="evolucao-ilustracao__caminho"
      fill="none"
      stroke="var(--color-accent-deep)"
      stroke-width="5"
      stroke-linecap="round"
      stroke-dasharray="1 15"
    >
      <path d="M456 424c44-34 68 40 112 24 44-16 68 16 118 4" />
    </g>

    <g
      class="evolucao-ilustracao__no"
      stroke="var(--color-accent-deep)"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle
        class="evolucao-ilustracao__glow"
        cx="700"
        cy="452"
        r="58"
        fill="var(--color-accent-deep)"
        stroke="none"
        opacity="0"
      />
      <g fill="var(--color-paper)" stroke-width="5">
        <circle cx="700" cy="452" r="17" />
        <circle cx="748" cy="418" r="9" />
        <circle cx="748" cy="486" r="9" />
      </g>
      <g fill="none" stroke-width="4">
        <path d="M714 441l26-16" />
        <path d="M714 463l26 16" />
      </g>
      <circle cx="700" cy="452" r="5" fill="var(--color-accent-deep)" stroke="none" />
    </g>
  </svg>
</template>

<style scoped>
.evolucao-ilustracao {
  display: block;
  height: auto;
  width: 100%;
}

.evolucao-ilustracao__glow {
  opacity: 0;
  transition: opacity 0.35s ease;
}

@media (prefers-reduced-motion: no-preference) {
  .evolucao-ilustracao.is-animavel .evolucao-ilustracao__caminho,
  .evolucao-ilustracao.is-animavel .evolucao-ilustracao__no {
    opacity: 0;
  }

  .evolucao-ilustracao.is-animavel.is-visivel .evolucao-ilustracao__caminho {
    opacity: 1;
    transition: opacity 0.9s ease 0.1s;
  }

  .evolucao-ilustracao.is-animavel.is-visivel .evolucao-ilustracao__no {
    opacity: 1;
    transition: opacity 0.5s ease 0.8s;
  }
}
</style>
