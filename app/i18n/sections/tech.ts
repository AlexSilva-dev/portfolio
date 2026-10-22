export interface TechGroupDict {
  label: string
  description: string
  core: boolean
  items: string[]
}

export const pt = {
  heading: 'Skillset',
  kicker: 'Com o que eu trabalho',
  groups: [
    {
      label: 'Kotlin e Android',
      description: 'apps multiplataforma da modelagem ao deploy',
      core: true,
      items: ['Kotlin', 'Kotlin Multiplatform', 'Compose'],
    },
    {
      label: 'Front-end web',
      description: 'interfaces Vue e Nuxt que carregam rápido',
      core: true,
      items: ['Vue 3', 'Nuxt 4', 'TypeScript'],
    },
    {
      label: 'Backend',
      description: 'APIs e regras de negócio que aguentam produção',
      core: false,
      items: ['Java', 'Spring', 'Node', 'Rails', 'PHP'],
    },
    {
      label: 'IA aplicada',
      description: 'pipelines com RAG e LLMs resolvendo problema real',
      core: false,
      items: ['LLMs', 'RAG', 'MCP', 'n8n', 'OCR'],
    },
    {
      label: 'Infra e deploy',
      description: 'Docker e pipelines que dormem tranquilo',
      core: false,
      items: ['Docker', 'AWS', 'Dokploy'],
    },
    {
      label: 'Práticas',
      description: 'arquitetura limpa, DDD e TDD no dia a dia',
      core: false,
      items: ['arquitetura limpa', 'DDD', 'TDD'],
    },
  ] as TechGroupDict[],
  closing: {
    prefix: 'E cerca de 40 outras ferramentas que aparecem no meu',
    separator: 'e',
    suffix: '.',
    github: { label: 'GitHub', href: 'https://github.com/AlexSilva-dev' },
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alex-da-silva1' },
  },
}

export type TechDict = typeof pt

export const en: TechDict = {
  heading: 'Skillset',
  kicker: 'What I work with',
  groups: [
    {
      label: 'Kotlin and Android',
      description: 'cross-platform apps from modeling to deploy',
      core: true,
      items: ['Kotlin', 'Kotlin Multiplatform', 'Compose'],
    },
    {
      label: 'Front-end web',
      description: 'Vue and Nuxt interfaces that load fast',
      core: true,
      items: ['Vue 3', 'Nuxt 4', 'TypeScript'],
    },
    {
      label: 'Backend',
      description: 'APIs and business rules that survive production',
      core: false,
      items: ['Java', 'Spring', 'Node', 'Rails', 'PHP'],
    },
    {
      label: 'Applied AI',
      description: 'RAG and LLM pipelines solving real problems',
      core: false,
      items: ['LLMs', 'RAG', 'MCP', 'n8n', 'OCR'],
    },
    {
      label: 'Infra and deploy',
      description: 'Docker and pipelines you can sleep on',
      core: false,
      items: ['Docker', 'AWS', 'Dokploy'],
    },
    {
      label: 'Practices',
      description: 'clean architecture, DDD and TDD in the daily routine',
      core: false,
      items: ['clean architecture', 'DDD', 'TDD'],
    },
  ] as TechGroupDict[],
  closing: {
    prefix: 'And about 40 other tools that appear on my',
    separator: 'and',
    suffix: '.',
    github: { label: 'GitHub', href: 'https://github.com/AlexSilva-dev' },
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alex-da-silva1' },
  },
}
