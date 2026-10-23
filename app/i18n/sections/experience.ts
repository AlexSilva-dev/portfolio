export type ExperienceItem = {
  company: string
  role: string
  period: string
  current: boolean
  achievements: string[]
  chips: string[]
}

export const pt: { heading: string, kicker: string, items: ExperienceItem[] } = {
  heading: 'Experiência',
  kicker: 'Onde eu já entreguei resultado',
  items: [
    {
      company: 'AdSalesBrazil',
      role: 'Sócio-fundador e responsável técnico',
      period: '2026 · hoje',
      current: true,
      achievements: [
        'Desenho a arquitetura e a infraestrutura em Docker com Dokploy numa VPS, com alta disponibilidade e custo baixo',
        'Conduzi a homologação oficial da Meta, habilitando o uso de Instagram, WhatsApp Business e Meta Ads',
        'Construí um MCP de IA agente pra Meta Ads, além de outras integrações com APIs',
        'Desenvolvo features full stack em Nuxt e Rails, com otimização de performance pra lidar com mídias na plataforma',
        'Implantei rastreamento e performance com Meta Pixel, GTM e Core Web Vitals e opero desenvolvimento assistido por IA com agentes próprios',
      ],
      chips: ['Docker', 'Dokploy', 'Nuxt', 'Rails', 'Meta API', 'MCP', 'IA aplicada', 'GTM'],
    },
    {
      company: 'Ajax Hub',
      role: 'Desenvolvedor e arquiteto de software',
      period: '2026 · cerca de 5 meses',
      current: false,
      achievements: [
        'Defini a separação arquitetural do sistema em serviços independentes, com frontend, backend e painel administrativo',
        'Implementei esteiras de CI/CD com GitHub Actions integradas ao Easypanel, com deploys rápidos e isolamento de ambientes',
        'Estruturei os fluxos de trabalho em metodologias ágeis, priorizando previsibilidade e qualidade de código',
        'Ao fim da passagem, a operação contava com três clientes pagantes',
      ],
      chips: ['GitHub Actions', 'Easypanel', 'Docker', 'CI/CD', 'arquitetura em serviços'],
    },
    {
      company: 'Tedsys',
      role: 'Desenvolvedor Full Stack',
      period: '2023 · 2025',
      current: false,
      achievements: [
        'Automatizei a cobrança e cortei a inadimplência de 18% para 7,5%, cerca de R$ 15 mil recuperados por mês, liberando 5 a 6 horas mensais do financeiro',
        'Construí um pipeline n8n com Bitrix e IA com RAG e OCR, resolvendo cerca de 80% do atendimento',
        'Desenvolvi e mantive o ERP principal com PHP Laminas no backend, APIs REST e banco Firebird, e Vue 3 no front',
        'Automatizei fluxos de vendas no Bitrix e administrei o Jira, de custom fields a service desk',
        'Provisionei e mantive servidores na AWS, com instâncias EC2 e gestão de domínios no Route 53',
      ],
      chips: ['PHP', 'Laminas', 'Vue 3', 'Firebird', 'n8n', 'RAG', 'OCR', 'Bitrix', 'Jira', 'AWS'],
    },
  ],
}

export type ExperienceDict = typeof pt

export const en: ExperienceDict = {
  heading: 'Experience',
  kicker: 'Where I have already delivered results',
  items: [
    {
      company: 'AdSalesBrazil',
      role: 'Co-founder and technical lead',
      period: '2026 · today',
      current: true,
      achievements: [
        'I design the architecture and infrastructure in Docker with Dokploy on a VPS, with high availability and low cost',
        'I led the official Meta homologation, enabling the use of Instagram, WhatsApp Business and Meta Ads',
        'I built an MCP working as an AI agent for Meta Ads, besides other API integrations',
        'I develop full stack features in Nuxt and Rails, with performance optimization for media on the platform',
        'I deployed tracking and performance with Meta Pixel, GTM and Core Web Vitals and run AI-assisted development with my own agents',
      ],
      chips: ['Docker', 'Dokploy', 'Nuxt', 'Rails', 'Meta API', 'MCP', 'Applied AI', 'GTM'],
    },
    {
      company: 'Ajax Hub',
      role: 'Software developer and architect',
      period: '2026 · around 5 months',
      current: false,
      achievements: [
        'I defined the architectural separation of the system into independent services, with frontend, backend and admin panel',
        'I implemented CI/CD pipelines with GitHub Actions integrated to Easypanel, with fast deploys and environment isolation',
        'I structured the workflows in agile methodologies, prioritizing predictability and code quality',
        'By the end, the operation had three paying clients',
      ],
      chips: ['GitHub Actions', 'Easypanel', 'Docker', 'CI/CD', 'service architecture'],
    },
    {
      company: 'Tedsys',
      role: 'Full Stack Developer',
      period: '2023 · 2025',
      current: false,
      achievements: [
        'I automated billing and cut delinquency from 18% to 7.5%, around R$ 15 mil recovered per month, freeing 5 to 6 hours a month for the finance team',
        'I built an n8n pipeline with Bitrix and AI with RAG and OCR, resolving around 80% of customer support',
        'I developed and maintained the main ERP with PHP Laminas on the backend, REST APIs and Firebird database, and Vue 3 on the front end',
        'I automated sales flows in Bitrix and administered Jira, from custom fields to service desk',
        'I provisioned and maintained servers on AWS, with EC2 instances and domain management on Route 53',
      ],
      chips: ['PHP', 'Laminas', 'Vue 3', 'Firebird', 'n8n', 'RAG', 'OCR', 'Bitrix', 'Jira', 'AWS'],
    },
  ],
}
