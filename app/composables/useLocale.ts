import { computed, useCookie, useHead, useState } from 'nuxt/app'
import { getDictionary, locales, type Locale } from '../i18n'

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

export function useLocale() {
  const cookie = useCookie<Locale>('locale', {
    maxAge: ONE_YEAR_IN_SECONDS,
    default: () => 'pt',
  })

  const locale = useState<Locale>('locale', () => locales.find((l) => l === cookie.value) ?? 'pt')
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
