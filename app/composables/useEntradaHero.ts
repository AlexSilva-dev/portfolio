import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { gsap } from 'gsap'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import {
  construirCoreografiaEntrada,
  decomporValorStat,
  DURACAO_CONTAGEM_MS,
  formatarContado,
  observarSaidaPreloader,
  valorContado,
} from '../utils/heroEntrada'

/**
 * Coreografia de entrada do hero, disparada quando o preloader sai de cena.
 * O estado inicial escondido nasce só do JavaScript no mount, o conteúdo
 * fica visível no HTML para quem navega sem JS. Movimento reduzido não
 * aplica nada, a cena entra toda posicionada. O contexto gsap é revertido
 * no unmount e no corte por movimento reduzido, no mesmo padrão do
 * useStagger e do useReveal.
 */
export function useEntradaHero(raiz: Ref<HTMLElement | null>) {
  const { prefersReducedMotion } = usePrefersReducedMotion()

  let contexto: ReturnType<typeof gsap.context> | null = null
  let cancelarObservacao: (() => void) | null = null
  let disparada = false

  function desativar() {
    cancelarObservacao?.()
    cancelarObservacao = null
    contexto?.revert()
    contexto = null
    disparada = false
  }

  function disparar() {
    if (disparada || !contexto) return
    disparada = true
    cancelarObservacao?.()
    cancelarObservacao = null

    contexto.add(() => {
      const passos = new Map(
        construirCoreografiaEntrada(false).map((passo) => [passo.alvo, passo]),
      )

      const linha = gsap.timeline()

      // 1 Nome com máscara de linha, o texto sobe de dentro do corte.
      const nome = passos.get('linha-nome')
      if (nome) {
        linha.to(
          '.hero__titulo-texto',
          { yPercent: 0, duration: nome.duracaoS, stagger: nome.staggerS, ease: nome.ease },
          nome.inicioS,
        )
      }

      // 2 Foto em escala com fade, logo depois do nome.
      const foto = passos.get('foto')
      if (foto) {
        linha.to(
          '.hero__foto',
          { scale: 1, opacity: 1, duration: foto.duracaoS, ease: foto.ease },
          foto.inicioS,
        )
      }

      // 3 Chips em pop, cada um com um leve atraso do anterior.
      const chip = passos.get('chip')
      if (chip) {
        linha.to(
          '.hero__chip',
          { scale: 1, opacity: 1, duration: chip.duracaoS, stagger: chip.staggerS, ease: chip.ease },
          chip.inicioS,
        )
      }

      // 4 Stats entram e os números contam de zero ao valor final, uma vez só.
      const stats = passos.get('stats')
      if (stats) {
        linha.fromTo(
          '.hero__stat',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          stats.inicioS,
        )

        const valores = raiz.value?.querySelectorAll<HTMLElement>('.hero__stat-valor') ?? []
        valores.forEach((valorEl, indice) => {
          const partido = decomporValorStat(valorEl.textContent?.trim() ?? '')
          if (!partido) return

          const progresso = { t: 0 }
          linha.to(
            progresso,
            {
              t: 1,
              duration: stats.duracaoS,
              ease: 'none',
              onUpdate: () => {
                valorEl.textContent = formatarContado(
                  valorContado(progresso.t * DURACAO_CONTAGEM_MS, {
                    ate: partido.numero,
                    duracaoMs: DURACAO_CONTAGEM_MS,
                  }),
                  { prefixo: partido.prefixo, sufixo: partido.sufixo },
                )
              },
            },
            stats.inicioS + indice * stats.staggerS,
          )
        })
      }

      // 5 Sub e CTAs fecham a coreografia com fade curto.
      const fecho = passos.get('fecho')
      if (fecho) {
        linha.to(
          ['.hero__sub', '.hero__cta'],
          { opacity: 1, duration: fecho.duracaoS, stagger: fecho.staggerS, ease: fecho.ease },
          fecho.inicioS,
        )
      }
    })
  }

  onMounted(() => {
    const el = raiz.value
    if (!el || prefersReducedMotion.value) return

    contexto = gsap.context(() => {
      gsap.set('.hero__titulo-texto', { yPercent: 110 })
      gsap.set('.hero__foto', { scale: 1.12, opacity: 0 })
      gsap.set('.hero__chip', { scale: 0.6, opacity: 0 })
      gsap.set(['.hero__sub', '.hero__cta'], { opacity: 0 })
    }, el)

    const saida = observarSaidaPreloader(document, disparar)
    if (saida.jaSaiu) {
      disparar()
    } else {
      cancelarObservacao = saida.cancelar
    }
  })

  watch(prefersReducedMotion, (reduzido) => {
    if (reduzido) desativar()
  })

  onUnmounted(desativar)
}
