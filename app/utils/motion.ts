export const PRELOADER_CEILING_MS = 3000

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
