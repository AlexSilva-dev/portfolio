import { onScopeDispose, ref } from 'vue'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Sinal reativo de movimento reduzido do sistema.
 * Default false no servidor, no cliente espelha matchMedia em tempo real.
 * Todo o pacote de movimento consulta este sinal antes de existir.
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion = ref(false)

  if (typeof window === 'undefined') {
    return { prefersReducedMotion }
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  prefersReducedMotion.value = mediaQuery.matches

  const syncFromMediaQuery = () => {
    prefersReducedMotion.value = mediaQuery.matches
  }

  mediaQuery.addEventListener('change', syncFromMediaQuery)
  onScopeDispose(() => {
    mediaQuery.removeEventListener('change', syncFromMediaQuery)
  })

  return { prefersReducedMotion }
}
