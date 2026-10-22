import previewCrm from '../assets/img/unify-eventos.webp'
import previewUca from '../assets/img/mata-mosquisto.webp'
import previewCap from '../assets/img/code.webp'
import previewSaas from '../assets/img/alex-hero.jpg'

export type ProjectStatus = 'production' | 'solo' | 'tool' | 'wip'

export type Project = {
  slug: string
  status: ProjectStatus
  url?: string
  papel: string
  periodo: string
  ano: string
  time: string
  preview: string
}

/*
 * Ordem canônica da seção, em paralelo com items do dicionário
 * app/i18n/sections/projects.ts (mesma posição, mesmo projeto).
 * SaaS de marketplaces não tem url pública e a linha nasce só informativa.
 * Papel, período, ano e time alimentam o grid de metadados da lista
 * editorial; preview é o asset próprio revelado no hover da linha.
 */
export const projects: Project[] = [
  {
    slug: 'crm-adsalesbrazil',
    status: 'production',
    url: 'https://adsalesbrazil.com',
    papel: 'Sócio-fundador e responsável técnico',
    periodo: '2026 até hoje',
    ano: '2026',
    time: 'AdSalesBrazil',
    preview: previewCrm,
  },
  {
    slug: 'ucatech',
    status: 'solo',
    url: 'https://ucatech.com.br',
    papel: 'Idealizador e desenvolvedor solo',
    periodo: '2025 a 2026',
    ano: '2026',
    time: 'Projeto pessoal',
    preview: previewUca,
  },
  {
    slug: 'check-all-pages',
    status: 'tool',
    url: 'https://github.com/AlexSilva-dev/checkallpages',
    papel: 'Autor',
    periodo: '2025',
    ano: '2025',
    time: 'Projeto pessoal',
    preview: previewCap,
  },
  {
    slug: 'saas-marketplaces',
    status: 'wip',
    papel: 'Idealizador',
    periodo: 'Em desenvolvimento',
    ano: '2026',
    time: 'Projeto pessoal',
    preview: previewSaas,
  },
]
