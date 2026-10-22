import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

const nuxtApp = vi.hoisted(() => ({
  clearError: vi.fn(),
  headOptions: [] as Array<Record<string, unknown>>,
}))

// error.vue e app.vue importam de nuxt/app explicitamente para o mock do
// vitest interceptar de forma determinística, no padrão do i18n.spec
vi.mock('nuxt/app', () => ({
  clearError: nuxtApp.clearError,
  useHead: (options: Record<string, unknown>) => {
    nuxtApp.headOptions.push(options)
  },
}))

// O transform do Nuxt injeta os componentes do template via o alias #app,
// o NuxtLayout real exige runtime do Nuxt, então o mock substitui por stubs
vi.mock('#app/components/nuxt-layout', () => ({
  default: { name: 'NuxtLayout', render: () => null },
}))
vi.mock('#app/components/nuxt-page', () => ({
  default: { name: 'NuxtPage', render: () => null },
}))

import { useLocale } from '../app/composables/useLocale'
import { dictionaries } from '../app/i18n'
import { SITE_BASE_URL } from '../app/utils/site'
import { useCopyEmail } from '../app/composables/useCopyEmail'
import ContactSection from '../app/components/ContactSection.vue'
import SiteFooter from '../app/components/SiteFooter.vue'

const fonteContact = readFileSync(
  join(import.meta.dirname, '..', 'app', 'components', 'ContactSection.vue'),
  'utf8',
)
const fonteFooter = readFileSync(
  join(import.meta.dirname, '..', 'app', 'components', 'SiteFooter.vue'),
  'utf8',
)
import NotFoundPage from '../app/pages/404.vue'
import ErrorPage from '../app/error.vue'
import AppRoot from '../app/app.vue'

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
  nuxtApp.clearError.mockClear()
  nuxtApp.headOptions.length = 0
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
    expect(root.textContent).toContain(dictionaries.en.sections.contact.writeDirect)
    expect(root.textContent).toContain(dictionaries.en.sections.contact.kicker)
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

  it('estrutura do cartão, kicker entre parênteses, título display e linha Ou escreva direto com o email', () => {
    instalarClipboard()
    const { root, app } = montar(ContactSection)
    const contato = dictionaries.pt.sections.contact

    const cartao = porTestId(root, 'contact-card')
    expect(cartao.textContent).toContain('( ')
    expect(cartao.textContent).toContain(contato.kicker)
    expect(porTestId(root, 'contact-heading').textContent).toContain(contato.heading)

    const direto = porTestId(root, 'contact-direct')
    expect(direto.textContent).toContain(contato.writeDirect)
    expect(direto.textContent).toContain(EMAIL)
    app.unmount()
  })

  it('email em destaque é link mailto sublinhado gigante', () => {
    instalarClipboard()
    const { root, app } = montar(ContactSection)

    const email = porTestId(root, 'contact-email') as HTMLAnchorElement
    expect(email.tagName).toBe('A')
    expect(email.getAttribute('href')).toBe(`mailto:${EMAIL}`)
    expect(email.className).toContain('contato__email')
    app.unmount()
  })

  it('Enviar email sólido tem seta decorativa e Copiar email fantasma mostra o feedback', async () => {
    instalarClipboard()
    const { root, app } = montar(ContactSection)

    const enviar = porTestId(root, 'contact-send-email')
    const seta = enviar.querySelector('[aria-hidden="true"]')
    expect(seta).toBeTruthy()

    const copiar = porTestId(root, 'contact-copy-email')
    expect(copiar.tagName).toBe('BUTTON')
    expect(root.querySelector('[data-testid="contact-copy-feedback"]')).toBeNull()
    copiar.click()
    await flush()
    expect(porTestId(root, 'contact-copy-feedback')).toBeTruthy()
    app.unmount()
  })

  it('canal é email direto, a seção não tem formulário', () => {
    instalarClipboard()
    const { root, app } = montar(ContactSection)

    expect(root.querySelector('form')).toBeNull()
    app.unmount()
  })

  it('fonte do cartão usa o asset de código, véu navy, tinta e anel de foco claro sobre o fundo escuro', () => {
    expect(fonteContact).toMatch(
      /2560x1600-px-code-coding-computer-Computer-screen-Java-1288551-wallhere\.com\.jpg/,
    )
    expect(fonteContact).toMatch(/--focus-ring:\s*2px solid var\(--color-accent\)/)
    expect(fonteContact).toMatch(/background:\s*var\(--color-ink\)/)
    expect(fonteContact).toMatch(
      /contato__veu\s*\{[^}]*color-mix\(in srgb, var\(--color-bg\)/,
    )
  })
})

describe('SiteFooter wordmark', () => {
  it('wordmark ALEX ALVES é decorativo aria-hidden e o copyright legível vem do dicionário', () => {
    const { root, app } = montar(SiteFooter)
    const layout = dictionaries.pt.sections.layout

    const wordmark = porTestId(root, 'footer-wordmark')
    expect(wordmark.getAttribute('aria-hidden')).toBe('true')
    expect(wordmark.textContent?.trim()).toBe(layout.footer.wordmark)

    const copyright = root.querySelector('[data-testid="site-footer"] p')
    expect(copyright?.textContent?.trim()).toBe(layout.footer.copyright)
    app.unmount()
  })

  it('wordmark ocupa a largura total com clamp de 15vw no arquivo-fonte', () => {
    expect(fonteFooter).toMatch(/clamp\([^)]*15vw/)
    expect(fonteFooter).toMatch(/aria-hidden="true"[^>]*data-testid="footer-wordmark"/)
  })

  it('dicionário layout tem wordmark com paridade pt e en', () => {
    expect(dictionaries.pt.sections.layout.footer.wordmark).toBe('ALEX ALVES')
    expect(dictionaries.en.sections.layout.footer.wordmark).toBe('ALEX ALVES')
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
    expect(voltar.getAttribute('href')).toBe(SITE_BASE_URL)
    expect(voltar.textContent).toContain(dictionaries.pt.sections.notfound.backHome)
    app.unmount()
  })

  it('não duplica o landmark main que o layout já fornece', () => {
    const { root, app } = montar(NotFoundPage)

    expect(root.querySelector('main')).toBeNull()
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

describe('error page do Nuxt', () => {
  it('serve a 404 customizada com o dicionário pt e botão de volta pro início', () => {
    const { root, app } = montar(ErrorPage)

    expect(porTestId(root, 'error-heading').textContent).toContain(
      dictionaries.pt.sections.notfound.heading,
    )
    expect(porTestId(root, 'error-message').textContent).toContain(
      dictionaries.pt.sections.notfound.message,
    )
    expect(porTestId(root, 'error-back-home').textContent).toContain(
      dictionaries.pt.sections.notfound.backHome,
    )
    app.unmount()
  })

  it('respeita o idioma en escolhido', async () => {
    const { root, app } = montar(ErrorPage)
    const { locale } = useLocale()
    ;(locale as Ref<'pt' | 'en'>).value = 'en'
    await nextTick()

    expect(porTestId(root, 'error-heading').textContent).toContain(
      dictionaries.en.sections.notfound.heading,
    )
    expect(porTestId(root, 'error-message').textContent).toContain(
      dictionaries.en.sections.notfound.message,
    )
    app.unmount()
  })

  it('botão de volta limpa o erro e redireciona pro início dentro da baseURL', async () => {
    const { root, app } = montar(ErrorPage)

    porTestId(root, 'error-back-home').click()
    await flush()

    expect(nuxtApp.clearError).toHaveBeenCalledWith({ redirect: SITE_BASE_URL })
    app.unmount()
  })
})

describe('app raiz', () => {
  it('declara só o favicon relativo à baseURL, sem title estático que duplica o dicionário', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp(AppRoot)
    app.component('NuxtLayout', { render: () => null })
    app.component('NuxtPage', { render: () => null })
    app.mount(root)

    expect(nuxtApp.headOptions).toHaveLength(1)
    const opcoes = nuxtApp.headOptions[0] as Record<string, unknown>
    expect(opcoes.title).toBeUndefined()
    expect(opcoes.meta).toBeUndefined()
    const link = (opcoes.link as Array<Record<string, string>>)[0] as Record<string, string>
    expect(link.rel).toBe('icon')
    expect(link.type).toBe('image/x-icon')
    expect(link.href).toBe(`${SITE_BASE_URL}favicon.ico`)
    app.unmount()
  })
})
