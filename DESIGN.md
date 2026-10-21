# DESIGN.md — guia visual do portfólio

Fonte única de verdade visual do projeto. Tela ou componente novo parte
deste documento. Padrão mudou, muda aqui primeiro.

## Stack oficial

- Nuxt 4.6.2 em modo estático com a pasta `app/`
- Vitest com happy-dom para testes
- Fontes self-host via `@fontsource/inter` e `@fontsource/jetbrains-mono`
- GSAP para animações, com registro explícito de plugins, `gsap.context()`
  próprio por componente com revert no `onUnmounted`, execução só no cliente
- Lenis para rolagem suavizada, integrado ao loop de frames
- i18n por dicionário tipado em `app/i18n` com idioma em cookie

## Componentes oficiais

Todos em `app/components/`. Componente novo não repete o papel de um desta
lista, estende ou compõe o oficial.

| Componente | Papel |
|---|---|
| `SiteHeader` | Cabeçalho com navegação por seções |
| `LangToggle` | Alternância de idioma pt e en |
| `SiteFooter` | Rodapé com contatos |
| `HeroSection` | Seção 01, posicionamento acima da dobra |
| `StatCard` | Número de resultado com valor e rótulo |
| `ExperienceCard` | Item do histórico profissional |
| `ProjectCard` | Cartão de projeto com stack e link |
| `StatusBadge` | Selo de estado, verde ou âmbar |
| `TechGroup` | Grupo de tecnologias por domínio |
| `SectionHeading` | Kicker em mono com numeração e h2 da seção |
| `ContactSection` | Seção 05 de contato |
| `Preloader` | Cortina de abertura com nome e contador |

## Tokens semânticos

Arquivo único `app/assets/css/tokens.css`. Nenhum hex em outro arquivo do
projeto. O violeta do accent foi extraído do rim light da foto do Alex.

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#0B1020` | Fundo da página |
| `--color-surface` | `#151C30` | Fundo de cartões e superfícies elevadas |
| `--color-text` | `#E9ECF5` | Texto principal sobre bg e surface |
| `--color-text-muted` | `#A9B1C6` | Texto secundário e rótulos |
| `--color-accent` | `#8B7A9F` | Único acento do site |
| `--color-status-green` | `#4ADE80` | Estado positivo, selo de disponibilidade |
| `--color-status-amber` | `#FBBF24` | Estado de atenção |
| `--font-sans` | Inter | Texto corrido e títulos |
| `--font-mono` | JetBrains Mono | Kickers, números e código |
| `--space-section` | `clamp(6rem, 8vw, 8rem)` | Espaço entre seções, 4rem no mobile |
| `--focus-ring` | `2px solid var(--color-accent)` | Contorno de foco visível |

## Padrões de uso

### Layout de seção

Toda seção abre com `SectionHeading`, kicker em mono com numeração de 01 a
05 seguido do h2. O espaço entre seções é de 96 a 128 pixels no desktop e
64 no mobile, sempre via `--space-section`.

### Regra de contraste do accent

Accent como texto só sobre o fundo `--color-bg`. Sobre `--color-surface` o
accent aparece apenas como elemento não textual, como borda, dot ou
sublinhado. Texto sobre cartão usa `--color-text`. O motivo é contraste, o
par accent contra surface não atinge a razão 4,5 exigida.

### Escrita de interface

Sem dois-pontos, ponto e vírgula ou sinal de mais no texto corrido. Todo
texto novo entra no dicionário de idioma em `app/i18n/sections/`, nunca
hardcoded no componente.

### Movimento

Reveals de título linha a linha por seção, aplicados por JS, com todo o
texto visível quando não há JavaScript. Botões magnéticos e rastro de fotos
só no desktop e cortados com movimento reduzido.

## Proibições

1. Hex cru fora de token. Cor nova vira token em `tokens.css` antes de ser
   usada
2. Componente paralelo ao oficial. Estende ou compõe o da lista acima
3. Reimport de Bootstrap, `animate.css` ou AOS. Nada disso volta ao projeto
4. Esconder conteúdo por CSS fora do padrão de reveals por JS
5. Accent como texto sobre `--color-surface`. Vale a regra de contraste da
   seção acima

## Exemplo de referência compilável

Trecho do padrão do `HeroSection` mostrando `SectionHeading`, `StatCard` e
tokens. Os textos vêm do dicionário `app/i18n/sections/hero.ts`, onde cada
stat é um par de valor e rótulo.

```vue
<script setup lang="ts">
const { dictionary } = useLocale()
const hero = computed(() => dictionary.value.sections.hero)
</script>

<template>
  <section class="hero">
    <SectionHeading :kicker="hero.kicker" :title="hero.h1" />
    <p class="hero__sub">{{ hero.sub }}</p>
    <ul class="hero__stats">
      <li v-for="stat in hero.stats" :key="stat.rotulo">
        <StatCard :valor="stat.valor" :rotulo="stat.rotulo" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hero {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  padding-block: var(--space-section);
}
.hero__sub {
  color: var(--color-text-muted);
  max-width: 60ch;
}
.hero__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  list-style: none;
  padding: 0;
}
</style>
```
