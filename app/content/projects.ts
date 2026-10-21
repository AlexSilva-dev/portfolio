export type ProjectStatus = 'production' | 'solo' | 'tool' | 'wip'

export type Project = {
  slug: string
  status: ProjectStatus
  url?: string
}

/*
 * Ordem canônica dos cards da seção, em paralelo com items do dicionário
 * app/i18n/sections/projects.ts (mesma posição, mesmo projeto).
 * SaaS de marketplaces não tem url pública e o card nasce só informativo.
 */
export const projects: Project[] = [
  { slug: 'crm-adsalesbrazil', status: 'production', url: 'https://adsalesbrazil.com' },
  { slug: 'ucatech', status: 'solo', url: 'https://ucatech.com.br' },
  { slug: 'check-all-pages', status: 'tool', url: 'https://github.com/AlexSilva-dev/checkallpages' },
  { slug: 'saas-marketplaces', status: 'wip' },
]
