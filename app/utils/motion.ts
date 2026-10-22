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
