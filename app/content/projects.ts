import previewCrm from '../assets/img/unify-eventos.webp'
import previewUca from '../assets/img/mata-mosquisto.webp'
import previewCap from '../assets/img/code.webp'
import previewSaas from '../assets/img/alex-hero.jpg'

export type ProjectStatus = 'production' | 'wip' | 'tool' | 'neutral'

export type Project = {
  slug: string
  status: ProjectStatus
  url?: string
  ano: string
  preview: string
}

/*
 * Ordem canônica da seção, em paralelo com items do dicionário
 * app/i18n/sections/projects.ts (mesma posição, mesmo projeto).
 * SaaS de marketplaces não tem url pública e a linha nasce só informativa.
 * UcaTech é o projeto em desenvolvimento e carrega o selo âmbar de wip.
 * Papel, período e time são texto de idioma e moram no dicionário, pt e en;
 * aqui fica só o dado canônico de idioma neutro. O ano é igual nos dois
 * idiomas e alimenta o grid de metadados da lista editorial; preview é o
 * asset próprio revelado no hover da linha.
 */
export const projects: Project[] = [
  {
    slug: 'crm-adsalesbrazil',
    status: 'production',
    url: 'https://adsalesbrazil.com',
    ano: '2026',
    preview: previewCrm,
  },
  {
    slug: 'ucatech',
    status: 'wip',
    url: 'https://ucatech.com.br',
    ano: '2026',
    preview: previewUca,
  },
  {
    slug: 'check-all-pages',
    status: 'tool',
    url: 'https://github.com/AlexSilva-dev/checkallpages',
    ano: '2025',
    preview: previewCap,
  },
  {
    slug: 'saas-marketplaces',
    status: 'neutral',
    ano: '2026',
    preview: previewSaas,
  },
]
