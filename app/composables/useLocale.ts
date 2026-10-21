import { computed } from 'vue'
import { useCookie, useHead, useState } from 'nuxt/app'
import { getDictionary, locales, type Locale } from '../i18n'

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

export function useLocale() {
  const cookie = useCookie<Locale>('locale', {
    path: '/',
    maxAge: ONE_YEAR_IN_SECONDS,
    default: () => 'pt',
  })

  // Em SSG o useState é serializado no payload do build, então na hidratação o
  // inicializador não roda de novo e o locale congelado no prerender vence o
  // cookie real do browser. O cookie precisa ser reaplicado em todo setup.
  const locale = useState<Locale>('locale', () => 'pt')
  const fromCookie = locales.find((l) => l === cookie.value) ?? 'pt'
  if (locale.value !== fromCookie) {
    locale.value = fromCookie
  }

  const announcement = useState<string>('locale-announcement', () => '')

  const dictionary = computed(() => getDictionary(locale.value))

  useHead({
    title: computed(() => dictionary.value.meta.title),
    meta: [{ name: 'description', content: computed(() => dictionary.value.meta.description) }],
  })

  function setLocale(next: Locale) {
    cookie.value = next
    locale.value = next
    announcement.value = getDictionary(next).meta.languageSwitched
  }

  return { locale, dictionary, announcement, setLocale }
}
