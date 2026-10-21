import { onScopeDispose, ref } from 'vue'

const FEEDBACK_EM_MS = 3000

export function useCopyEmail(email: string) {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copyEmail(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      copied.value = false
      return false
    }
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, FEEDBACK_EM_MS)
    return true
  }

  onScopeDispose(() => {
    clearTimeout(timer)
  })

  return { copied, copyEmail }
}
