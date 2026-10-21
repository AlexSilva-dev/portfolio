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
        'Desenho a arquitetura e a infraestrutura em Docker do CRM da empresa, do zero até a produção',
        'Levei a integração de anúncios à homologação oficial da Meta',
        'Aplico IA na otimização de campanhas dos clientes',
      ],
      chips: ['Docker', 'IA aplicada', 'Meta API'],
    },
    {
      company: 'Ajax Hub',
      role: 'Desenvolvedor e arquiteto de software',
      period: '2026 · cerca de 5 meses',
      current: false,
      achievements: [
        'Atuei na evolução de um CRM em um time de cerca de cinco pessoas',
        'Estruturei o pipeline de CI/CD da aplicação',
      ],
      chips: ['CI/CD', 'GitHub Actions', 'Docker', 'arquitetura em serviços'],
    },
    {
      company: 'Tedsys',
      role: 'Desenvolvedor Full Stack',
      period: '2023 · 2025',
      current: false,
      achievements: [
        'Reduzi a inadimplência de 18% para 7,5%, cerca de R$ 15 mil recuperados por mês',
        'Construí um pipeline de IA que resolve cerca de 80% do atendimento',
        'Desenvolvi módulos do ERP com PHP e Vue 3',
      ],
      chips: ['PHP', 'Vue 3', 'IA'],
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
        'I design the Docker architecture and infrastructure of the company CRM, from zero to production',
        'I took the ads integration to the official Meta homologation',
        'I apply AI to optimize client campaigns',
      ],
      chips: ['Docker', 'Applied AI', 'Meta API'],
    },
    {
      company: 'Ajax Hub',
      role: 'Software developer and architect',
      period: '2026 · around 5 months',
      current: false,
      achievements: [
        'I worked on the evolution of a CRM in a team of around five people',
        'I structured the application CI/CD pipeline',
      ],
      chips: ['CI/CD', 'GitHub Actions', 'Docker', 'service architecture'],
    },
    {
      company: 'Tedsys',
      role: 'Full Stack Developer',
      period: '2023 · 2025',
      current: false,
      achievements: [
        'Reduced delinquency from 18% to 7.5%, around R$ 15 mil recovered per month',
        'Built an AI pipeline that resolves around 80% of customer support',
        'Developed ERP modules with PHP and Vue 3',
      ],
      chips: ['PHP', 'Vue 3', 'IA'],
    },
  ],
}
