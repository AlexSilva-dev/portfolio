import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, type Ref } from 'vue'

// Mesma estratégia do theme.spec: o mock aponta para o arquivo físico do
// composable, que é exatamente o módulo que o auto-import do Nuxt resolve
// dentro do SFC. O dictionary é derivado dos módulos reais de i18n, então os
// textos afirmados nos testes são os mesmos que o site renderiza.
vi.mock('../app/composables/useLocale', async () => {
  const { computed, ref } = await import('vue')
  const { getDictionary } = await import('../app/i18n')
  const localeRef = ref<'pt' | 'en'>('pt')
  return {
    useLocale: () => ({
      locale: localeRef,
      dictionary: computed(() => getDictionary(localeRef.value)),
    }),
  }
})

import { useLocale } from '../app/composables/useLocale'
import { dictionaries } from '../app/i18n'
import { useCopyEmail } from '../app/composables/useCopyEmail'
import ContactSection from '../app/components/ContactSection.vue'
import NotFoundPage from '../app/pages/404.vue'

const EMAIL = 'alexdsilva.dev@gmail.com'

function instalarClipboard(impl?: () => Promise<void>): ReturnType<typeof vi.fn> {
  const writeText = vi.fn(impl ?? (async () => undefined))
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  return writeText
}

function limparClipboard(): void {
  Reflect.deleteProperty(navigator, 'clipboard')
}

async function flush(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0)
}

function montar(componente: Parameters<typeof createApp>[0]) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app = createApp(componente)
  app.mount(root)
  return { root, app }
}

function porTestId(root: HTMLElement, teste: string): HTMLElement {
  const el = root.querySelector(`[data-testid="${teste}"]`)
  if (!el) throw new Error(`elemento ${teste} não encontrado`)
  return el as HTMLElement
}

beforeEach(() => {
  vi.useFakeTimers()
  // O ref de locale vive no escopo do módulo mockado e sobrevive entre
  // testes, cada um precisa nascer em pt para não herdar o idioma do anterior
  ;(useLocale().locale as Ref<'pt' | 'en'>).value = 'pt'
})

afterEach(() => {
  vi.useRealTimers()
  limparClipboard()
  document.body.innerHTML = ''
})

describe('useCopyEmail', () => {
  it('grava o email no clipboard e liga o feedback', async () => {
    const writeText = instalarClipboard()
    const scope = effectScope()
    const { copied, copyEmail } = scope.run(() => useCopyEmail(EMAIL))!

    expect(copied.value).toBe(false)
    await copyEmail()

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith(EMAIL)
    expect(copied.value).toBe(true)
  })

  it('feedback visível por exatamente 3 segundos', async () => {
    instalarClipboard()
    const scope = effectScope()
    const { copied, copyEmail } = scope.run(() => useCopyEmail(EMAIL))!

    await copyEmail()
    expect(copied.value).toBe(true)

    vi.advanceTimersByTime(2999)
    expect(copied.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(copied.value).toBe(false)
  })

  it('clique repetido reinicia a janela de 3 segundos', async () => {
    instalarClipboard()
    const scope = effectScope()
    const { copied, copyEmail } = scope.run(() => useCopyEmail(EMAIL))!

    await copyEmail()
    vi.advanceTimersByTime(2500)

    await copyEmail()
    vi.advanceTimersByTime(2500)
    expect(copied.value).toBe(true)

    vi.advanceTimersByTime(500)
    expect(copied.value).toBe(false)
  })

  it('clipboard que recusa a escrita não liga o feedback', async () => {
    instalarClipboard(async () => {
      throw new DOMException('bloqueado', 'NotAllowedError')
    })
    const scope = effectScope()
    const { copied, copyEmail } = scope.run(() => useCopyEmail(EMAIL))!

    const resultado = await copyEmail()

    expect(resultado).toBe(false)
    expect(copied.value).toBe(false)
  })

  it('timer pendente é limpo no fim do ciclo de vida', async () => {
    instalarClipboard()
    const scope = effectScope()
    const { copyEmail } = scope.run(() => useCopyEmail(EMAIL))!

    await copyEmail()
    expect(vi.getTimerCount()).toBe(1)

    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('ContactSection', () => {
  it('exibe o email como texto na tela', () => {
    instalarClipboard()
    const { root } = montar(ContactSection)

    expect(porTestId(root, 'contact-email').textContent).toContain(EMAIL)
  })

  it('botão primário Enviar email aponta para o mailto', () => {
    instalarClipboard()
    const { root } = montar(ContactSection)

    const enviar = porTestId(root, 'contact-send-email') as HTMLAnchorElement
    expect(enviar.getAttribute('href')).toBe(`mailto:${EMAIL}`)
    expect(enviar.textContent).toContain(dictionaries.pt.sections.contact.sendEmail)
  })

  it('clique em Copiar email grava no clipboard e mostra o feedback ao lado', async () => {
    const writeText = instalarClipboard()
    const { root, app } = montar(ContactSection)

    porTestId(root, 'contact-copy-email').click()
    await flush()

    expect(writeText).toHaveBeenCalledWith(EMAIL)
    expect(porTestId(root, 'contact-copy-feedback').textContent).toContain(
      dictionaries.pt.sections.contact.copyFeedback,
    )
    app.unmount()
  })

  it('feedback de cópia desaparece depois de 3 segundos', async () => {
    instalarClipboard()
    const { root, app } = montar(ContactSection)

    porTestId(root, 'contact-copy-email').click()
    await flush()
    expect(porTestId(root, 'contact-copy-feedback')).toBeTruthy()

    await vi.advanceTimersByTimeAsync(3000)
    expect(root.querySelector('[data-testid="contact-copy-feedback"]')).toBeNull()
    app.unmount()
  })

  it('links de LinkedIn e GitHub têm rótulo visível, target _blank e rel noopener', () => {
    instalarClipboard()
    const { root } = montar(ContactSection)

    const linkedin = porTestId(root, 'contact-linkedin') as HTMLAnchorElement
    expect(linkedin.getAttribute('href')).toBe('https://www.linkedin.com/in/alex-da-silva1')
    expect(linkedin.getAttribute('target')).toBe('_blank')
    expect(linkedin.getAttribute('rel')).toContain('noopener')
    expect(linkedin.textContent).toContain(dictionaries.pt.sections.contact.linkedinLabel)

    const github = porTestId(root, 'contact-github') as HTMLAnchorElement
    expect(github.getAttribute('href')).toBe('https://github.com/AlexSilva-dev')
    expect(github.getAttribute('target')).toBe('_blank')
    expect(github.getAttribute('rel')).toContain('noopener')
    expect(github.textContent).toContain(dictionaries.pt.sections.contact.githubLabel)
  })

  it('troca os textos quando o idioma é en', async () => {
    instalarClipboard()
    const { root, app } = montar(ContactSection)
    const { locale } = useLocale()
    ;(locale as Ref<'pt' | 'en'>).value = 'en'
    await nextTick()

    expect(root.textContent).toContain(dictionaries.en.sections.contact.heading)
    expect(root.textContent).toContain(dictionaries.en.sections.contact.sub)
    expect(porTestId(root, 'contact-send-email').textContent).toContain(
      dictionaries.en.sections.contact.sendEmail,
    )
    expect(porTestId(root, 'contact-copy-email').textContent).toContain(
      dictionaries.en.sections.contact.copyEmail,
    )
    expect(porTestId(root, 'contact-linkedin').textContent).toContain(
      dictionaries.en.sections.contact.linkedinLabel,
    )
    app.unmount()
  })
})

describe('página 404', () => {
  it('mostra mensagem clara e botão de volta pro início em pt', () => {
    const { root, app } = montar(NotFoundPage)

    expect(porTestId(root, 'notfound-heading').textContent).toContain(
      dictionaries.pt.sections.notfound.heading,
    )
    expect(porTestId(root, 'notfound-message').textContent).toContain(
      dictionaries.pt.sections.notfound.message,
    )
    const voltar = porTestId(root, 'notfound-back-home') as HTMLAnchorElement
    expect(voltar.getAttribute('href')).toBe('/')
    expect(voltar.textContent).toContain(dictionaries.pt.sections.notfound.backHome)
    app.unmount()
  })

  it('mostra a página no idioma en quando ele está escolhido', async () => {
    const { root, app } = montar(NotFoundPage)
    const { locale } = useLocale()
    ;(locale as Ref<'pt' | 'en'>).value = 'en'
    await nextTick()

    expect(porTestId(root, 'notfound-heading').textContent).toContain(
      dictionaries.en.sections.notfound.heading,
    )
    expect(porTestId(root, 'notfound-message').textContent).toContain(
      dictionaries.en.sections.notfound.message,
    )
    expect(porTestId(root, 'notfound-back-home').textContent).toContain(
      dictionaries.en.sections.notfound.backHome,
    )
    app.unmount()
  })
})
