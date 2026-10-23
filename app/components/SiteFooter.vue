<script setup lang="ts">
import {
  BRILHO_MEDIO_RODAPE,
  intensidadeBrilhoRodape,
} from '../utils/motion'

const { dictionary } = useLocale()
const layout = computed(() => dictionary.value.sections.layout)
const { prefersReducedMotion } = usePrefersReducedMotion()

/** Intensidade do brilho, 0 a 1, dirigida pelo progresso de rolagem. */
const brilho = ref(0)
let ouvindo = false

const medirBrilho = () => {
  const alcance = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1,
  )
  brilho.value = intensidadeBrilhoRodape(window.scrollY / alcance)
}

const ouvir = () => {
  if (ouvindo) return
  window.addEventListener('scroll', medirBrilho, { passive: true })
  ouvindo = true
  medirBrilho()
}

const calar = () => {
  if (!ouvindo) return
  window.removeEventListener('scroll', medirBrilho)
  ouvindo = false
}

onMounted(() => {
  if (prefersReducedMotion.value) {
    brilho.value = BRILHO_MEDIO_RODAPE
    return
  }
  ouvir()
})

watch(prefersReducedMotion, (reduzido) => {
  if (reduzido) {
    calar()
    brilho.value = BRILHO_MEDIO_RODAPE
    return
  }
  brilho.value = 0
  ouvir()
})

onUnmounted(calar)
</script>

<template>
  <footer class="site-footer" data-testid="site-footer">
    <div
      class="site-footer__brilho"
      aria-hidden="true"
      data-testid="footer-brilho"
      :style="{ opacity: brilho }"
    >
      <span class="site-footer__coluna site-footer__coluna--b">
        <span class="site-footer__coluna-borda" />
        <span class="site-footer__coluna-borda site-footer__coluna-borda--direita" />
      </span>
      <span class="site-footer__coluna site-footer__coluna--a">
        <span class="site-footer__coluna-borda" />
        <span class="site-footer__coluna-borda site-footer__coluna-borda--direita" />
      </span>
      <span class="site-footer__coluna site-footer__coluna--c">
        <span class="site-footer__coluna-borda" />
        <span class="site-footer__coluna-borda site-footer__coluna-borda--direita" />
      </span>
      <span class="site-footer__grao" />
    </div>
    <div class="site-footer__conteudo">
      <div
        class="site-footer__wordmark"
        aria-hidden="true"
        data-testid="footer-wordmark"
      >
        {{ layout.footer.wordmark }}
      </div>
      <p class="site-footer__texto">{{ layout.footer.copyright }}</p>
    </div>
  </footer>
</template>

<style scoped>
/* Rodapé na área escura, preto puro do void com anel de foco claro
   (mesma sobreposição da seção de contato) */
.site-footer {
  position: relative;
  --focus-ring: 2px solid var(--color-accent);

  background: var(--color-void);
  border-top: 1px solid color-mix(in srgb, var(--color-text) 20%, transparent);
  overflow: hidden;
  padding: 2rem 1.5rem;
}

/* Brilho estilo sui.io, colunas de luz violeta subindo da borda inferior.
   Uma única camada animada, só opacity dirigida pela rolagem, grão e
   gradientes ficam estáticos dentro dela. */
.site-footer__brilho {
  position: absolute;
  inset: 0;

  background:
    radial-gradient(75% 120% at 50% 100%,
      color-mix(in srgb, var(--color-accent) 28%, transparent),
      transparent 70%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s linear;
  will-change: opacity;
}

.site-footer__coluna {
  position: absolute;
  bottom: 0;
  width: clamp(4rem, 10vw, 9rem);
  height: 78%;

  background:
    linear-gradient(to top,
      color-mix(in srgb, var(--color-accent) 55%, transparent),
      transparent 82%),
    repeating-linear-gradient(to top,
      color-mix(in srgb, var(--color-accent) 30%, transparent) 0 3px,
      transparent 3px 14px);
}

.site-footer__coluna--a {
  left: 50%;
  transform: translateX(-50%);
  height: 85%;
}

.site-footer__coluna--b {
  left: 22%;
  transform: translateX(-50%);
  width: clamp(2.5rem, 6vw, 5rem);
  height: 60%;
  opacity: 0.8;
}

.site-footer__coluna--c {
  left: 78%;
  transform: translateX(-50%);
  width: clamp(2rem, 5vw, 4rem);
  height: 68%;
  opacity: 0.9;
}

/* Bordas de coluna em pontilhado fino vertical */
.site-footer__coluna-borda {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;

  background: repeating-linear-gradient(
    to bottom,
    color-mix(in srgb, var(--color-accent) 70%, transparent) 0 4px,
    transparent 4px 12px
  );
}

.site-footer__coluna-borda--direita {
  left: auto;
  right: 0;
}

/* Grão de noise via feTurbulence embutido como data URI, sem asset externo.
   feColorMatrix dessatura o ruído em tom neutro sobre o violeta. */
.site-footer__grao {
  position: absolute;
  inset: 0;
  opacity: 0.4;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='grao'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grao)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

/* Conteúdo acima do brilho para o wordmark seguir legível */
.site-footer__conteudo {
  position: relative;
}

.site-footer__wordmark {
  color: var(--color-paper);
  font-size: clamp(2.5rem, 15vw, 16rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.site-footer__texto {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  text-align: center;
}
</style>
