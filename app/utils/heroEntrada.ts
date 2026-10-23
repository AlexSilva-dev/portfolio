/**
 * Coreografia de entrada do hero, a cena que roda quando o preloader sai.
 * As funções aqui são puras e testáveis, o consumo de tela vive em
 * app/composables/useEntradaHero.ts. Nada aqui toca no DOM.
 */

export interface StatPartido {
  prefixo: string
  numero: number
  sufixo: string
}

/** Número no começo da string com o resto preservado, sufixo com espaço incluso. */
const PADRAO_STAT = /^(\D*?)(\d[\d.,]*)(.*)$/

/**
 * Decompõe o valor textual de um stat em prefixo, número e sufixo.
 * Sem dígito na string devolve null, o chamador mantém o texto estático.
 */
export function decomporValorStat(valor: string): StatPartido | null {
  const partes = valor.match(PADRAO_STAT)
  if (!partes) return null

  const numero = Number.parseFloat(partes[2].replace(',', '.'))
  if (Number.isNaN(numero)) return null

  return { prefixo: partes[1], numero, sufixo: partes[3] }
}

/** Aceleração expo out no padrão editorial, presa em 0 a 1 e NaN como zero. */
export function easeOutExpo(t: number): number {
  if (Number.isNaN(t)) return 0
  const x = Math.min(Math.max(t, 0), 1)
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

export interface ContagemOpcoes {
  /** Valor inicial da contagem, padrão zero. */
  de?: number
  ate: number
  duracaoMs: number
  /** Curva de progresso, padrão easeOutExpo. */
  easing?: (t: number) => number
}

/**
 * Valor interpolado da contagem no instante elapsedMs. Fora da janela fica
 * preso no início ou no fim. Duração inválida lança RangeError, no mesmo
 * padrão de computeProgress em motion.ts.
 */
export function valorContado(elapsedMs: number, opcoes: ContagemOpcoes): number {
  const { de = 0, ate, duracaoMs, easing = easeOutExpo } = opcoes
  if (!(duracaoMs > 0)) {
    throw new RangeError(`duracaoMs precisa ser maior que zero, recebi ${duracaoMs}`)
  }

  if (Number.isNaN(elapsedMs)) return de

  const t = Math.min(Math.max(elapsedMs / duracaoMs, 0), 1)
  return de + (ate - de) * easing(t)
}

export interface FormatoContagem {
  prefixo?: string
  sufixo?: string
  /** Casas decimais, padrão zero. Decimal com vírgula, padrão pt-BR. */
  casas?: number
}

/** Prefixo mais número no formato do idioma mais sufixo, o par do stat montado. */
export function formatarContado(valor: number, formato: FormatoContagem = {}): string {
  const { prefixo = '', sufixo = '', casas = 0 } = formato
  return prefixo + valor.toFixed(casas).replace('.', ',') + sufixo
}

/** Duração da contagem dos stats, em ms. A timeline da entrada usa o mesmo valor. */
export const DURACAO_CONTAGEM_MS = 1200

export interface PassoEntrada {
  alvo: 'linha-nome' | 'foto' | 'chip' | 'stats' | 'fecho'
  /** Início do passo em segundos desde a saída do preloader. */
  inicioS: number
  duracaoS: number
  /** Intervalo entre itens do mesmo passo, em segundos. */
  staggerS: number
  ease: string
}

/** Fonte única da verdade da coreografia, o composable constrói a timeline daqui. */
export function construirCoreografiaEntrada(reduzida: boolean): PassoEntrada[] {
  if (reduzida) return []

  return [
    { alvo: 'linha-nome', inicioS: 0, duracaoS: 0.9, staggerS: 0.08, ease: 'expo.out' },
    { alvo: 'foto', inicioS: 0.15, duracaoS: 1, staggerS: 0, ease: 'expo.out' },
    { alvo: 'chip', inicioS: 0.55, duracaoS: 0.5, staggerS: 0.05, ease: 'back.out(1.7)' },
    {
      alvo: 'stats',
      inicioS: 0.7,
      duracaoS: DURACAO_CONTAGEM_MS / 1000,
      staggerS: 0,
      ease: 'power1.out',
    },
    { alvo: 'fecho', inicioS: 0.95, duracaoS: 0.45, staggerS: 0.06, ease: 'power2.out' },
  ]
}

/**
 * Observa a saída do preloader do DOM. Preloader já fora de cena devolve
 * jaSaiu true e o chamador dispara na hora. Em cena, devolve o observador
 * armado, dispara o callback uma vez só quando o elemento some e cancelar
 * desarma tudo. Sem tocar no ciclo do Preloader, o hero escuta o estado.
 */
export function observarSaidaPreloader(
  doc: Document,
  aoSair: () => void,
): { jaSaiu: boolean, cancelar: () => void } {
  const emCena = () => doc.querySelector('[data-testid="preloader"]') !== null

  if (!emCena()) {
    return { jaSaiu: true, cancelar: () => {} }
  }

  let encerrado = false
  const observer = new MutationObserver(() => {
    if (encerrado || emCena()) return
    encerrado = true
    observer.disconnect()
    aoSair()
  })

  const alvo = doc.body ?? doc.documentElement
  observer.observe(alvo, { childList: true, subtree: true })

  return {
    jaSaiu: false,
    cancelar: () => {
      encerrado = true
      observer.disconnect()
    },
  }
}
