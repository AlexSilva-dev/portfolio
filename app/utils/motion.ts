export const PRELOADER_CEILING_MS = 3000

/**
 * Agenda ScrollTrigger.refresh para depois de fontes e imagens carregarem.
 * As posições dos gatilhos são medidas no mount, antes da troca de fontes
 * e do fim do download de imagens, o que desloca o disparo do reveal para
 * posições erradas de scroll. Devolve a função de limpeza do listener.
 */
export function agendarRefreshGatilhos(refresh: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let ativo = true
  const aoCarregarAtivos = () => {
    if (!ativo) return
    ativo = false
    window.removeEventListener('load', aoCarregarAtivos)
    refresh()
  }

  window.addEventListener('load', aoCarregarAtivos)
  document.fonts?.ready.then(aoCarregarAtivos).catch(() => {})

  return () => {
    ativo = false
    window.removeEventListener('load', aoCarregarAtivos)
  }
}

/**
 * Presa o valor dentro da faixa de min a max. NaN volta como min, faixa
 * invertida é erro de programação e falha alto e claro.
 */
export function limitar(valor: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`faixa invertida, min ${min} não pode passar de max ${max}`)
  }
  if (Number.isNaN(valor)) return min
  return Math.min(Math.max(valor, min), max)
}

/**
 * Interpola do ponto atual na direção do alvo pelo fator do caminho.
 * Fator 0 fica parado, 1 chega no alvo, valores fora extrapolam de propósito
 * (é o que dá lerp com folga). Base do atraso suave do preview de projeto.
 */
export function interpolar(atual: number, alvo: number, fator: number): number {
  return atual + (alvo - atual) * fator
}

/**
 * Progresso puro do preloader, de 0 a 100.
 * Satura em 100 quando o tempo atingir o teto, independentemente de rede.
 */
export function computeProgress(elapsedMs: number, ceilingMs: number): number {
  if (ceilingMs <= 0) {
    throw new RangeError(`ceilingMs precisa ser maior que zero, recebi ${ceilingMs}`)
  }

  const clamped = Math.min(Math.max(elapsedMs, 0), ceilingMs)
  return Math.round((clamped / ceilingMs) * 100)
}

/** Progresso de rolagem em que o brilho do rodapé começa a acender (rodapé já em cena). */
export const INICIO_BRILHO_RODAPE = 0.8

/** Intensidade fixa do brilho quando o sistema pede movimento reduzido. */
export const BRILHO_MEDIO_RODAPE = 0.5

/**
 * Mapeia progresso de rolagem (0 a 1) pra intensidade do brilho do rodapé
 * (0 a 1). Apagado até o rodapé entrar em cena, curva suave (smoothstep)
 * até acender por completo no fim da página. Entradas fora de 0 a 1 são
 * presas nos limites, NaN conta como zero.
 */
export function intensidadeBrilhoRodape(
  progressoRolagem: number,
  inicio: number = INICIO_BRILHO_RODAPE,
): number {
  if (!(inicio >= 0) || inicio >= 1) {
    throw new RangeError(`inicio precisa estar em [0, 1), recebi ${inicio}`)
  }

  if (Number.isNaN(progressoRolagem)) return 0

  const t = Math.min(Math.max((progressoRolagem - inicio) / (1 - inicio), 0), 1)
  return t * t * (3 - 2 * t)
}
