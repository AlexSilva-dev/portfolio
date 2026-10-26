import previewCrm from '../assets/img/preview-crm-adsalesbrazil.webp'
import previewUca from '../assets/img/preview-ucatech.webp'
import previewCap from '../assets/img/preview-check-all-pages.webp'
import previewAtendimentoIa from '../assets/img/preview-atendimento-qualificacao-ia.webp'

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
 * UcaTech é o projeto em desenvolvimento e carrega o selo âmbar de wip.
 * Papel, período e time são texto de idioma e moram no dicionário, pt e en;
 * aqui fica só o dado canônico de idioma neutro. O ano é igual nos dois
 * idiomas e alimenta o grid de metadados da lista editorial; preview é o
 * asset próprio revelado no hover da linha.
 *
 * O case de atendimento e qualificação de leads com IA foi construído dentro
 * da Tedsys, com Z-API e Bitrix24, e não pode expor cliente, link nem print
 * do fluxo. Por isso a linha nasce sem url, com selo neutro de case
 * profissional e uma capa genérica no estilo de canvas de automação. O
 * resultado público é só o 80% das interações sem humano, o R$ 15 mil por
 * mês pertence à automação de cobrança e não a este case.
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
    slug: 'atendimento-qualificacao-ia',
    status: 'neutral',
    ano: '2025',
    preview: previewAtendimentoIa,
  },
]
