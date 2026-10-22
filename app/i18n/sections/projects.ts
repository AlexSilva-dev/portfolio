export const pt = {
  heading: 'Projetos',
  kicker: 'O que eu construo por conta própria',
  verProjeto: 'Ver projeto',
  meta: {
    papel: 'Papel',
    periodo: 'Período',
    ano: 'Ano',
    time: 'Time',
  },
  items: [
    {
      name: 'CRM AdSalesBrazil',
      badge: 'Produto em produção',
      summary: 'CRM com IA pra gestão de anúncios, com integração homologada com a Meta. Sou o responsável técnico e sócio-fundador.',
      chips: ['IA', 'Docker', 'Meta API'],
    },
    {
      name: 'UcaTech',
      badge: 'Projeto solo',
      summary: 'Plataforma educacional construída sozinha em Kotlin Multiplatform, da modelagem dos dados ao app.',
      chips: ['Kotlin', 'Kotlin Multiplatform'],
    },
    {
      name: 'Check All Pages',
      badge: 'Ferramenta de linha de comando',
      summary: 'Auditoria de performance de páginas em massa com Lighthouse e PageSpeed, escrita em Kotlin.',
      chips: ['Kotlin', 'CLI', 'Lighthouse'],
    },
    {
      name: 'SaaS de marketplaces',
      badge: 'Em desenvolvimento',
      summary: 'SaaS que conecta vendedores a Mercado Livre e Shopee, com IA e RAG no núcleo do produto.',
      chips: ['IA', 'RAG'],
    },
  ],
}

export type ProjectsDict = typeof pt

export const en: ProjectsDict = {
  heading: 'Projects',
  kicker: 'What I build on my own',
  verProjeto: 'View project',
  meta: {
    papel: 'Role',
    periodo: 'Period',
    ano: 'Year',
    time: 'Team',
  },
  items: [
    {
      name: 'CRM AdSalesBrazil',
      badge: 'Product in production',
      summary: 'CRM with AI for ads management, with a Meta certified integration. I am the technical lead and co-founder.',
      chips: ['AI', 'Docker', 'Meta API'],
    },
    {
      name: 'UcaTech',
      badge: 'Solo project',
      summary: 'Educational platform built alone in Kotlin Multiplatform, from data modeling to the app.',
      chips: ['Kotlin', 'Kotlin Multiplatform'],
    },
    {
      name: 'Check All Pages',
      badge: 'Command line tool',
      summary: 'Bulk page performance auditing with Lighthouse and PageSpeed, written in Kotlin.',
      chips: ['Kotlin', 'CLI', 'Lighthouse'],
    },
    {
      name: 'Marketplace SaaS',
      badge: 'In development',
      summary: 'SaaS connecting sellers to Mercado Livre and Shopee, with AI and RAG at the core of the product.',
      chips: ['AI', 'RAG'],
    },
  ],
}
