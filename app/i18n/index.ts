import { pt as hero, en as heroEn } from './sections/hero'
import { pt as experience, en as experienceEn } from './sections/experience'
import { pt as projects, en as projectsEn } from './sections/projects'
import { pt as about, en as aboutEn } from './sections/about'
import { pt as tech, en as techEn } from './sections/tech'
import { pt as contact, en as contactEn } from './sections/contact'
import { pt as notfound, en as notfoundEn } from './sections/notfound'

export const locales = ['pt', 'en'] as const

export type Locale = (typeof locales)[number]

export const meta = {
  pt: {
    title: 'Alex Alves · Engenheiro de Software Full Stack',
    description: 'Há 3 anos levo produto do zero à produção, do app Android ao backend com IA.',
    languageSwitched: 'Idioma alterado para Português',
  },
  en: {
    title: 'Alex Alves · Full Stack Software Engineer',
    description: 'For 3 years I have taken product from zero to production, from the Android app to the AI backend.',
    languageSwitched: 'Language switched to English',
  },
}

export type Dictionary = {
  meta: typeof meta.pt
  sections: {
    hero: typeof hero
    experience: typeof experience
    projects: typeof projects
    about: typeof about
    tech: typeof tech
    contact: typeof contact
    notfound: typeof notfound
  }
}

export const dictionaries: Record<Locale, Dictionary> = {
  pt: {
    meta: meta.pt,
    sections: { hero, experience, projects, about, tech, contact, notfound },
  },
  en: {
    meta: meta.en,
    sections: {
      hero: heroEn,
      experience: experienceEn,
      projects: projectsEn,
      about: aboutEn,
      tech: techEn,
      contact: contactEn,
      notfound: notfoundEn,
    },
  },
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
