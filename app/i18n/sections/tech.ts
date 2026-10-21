export interface TechGroupDict {
  label: string
  core: boolean
  items: string[]
}

export const pt = {
  heading: 'Tecnologias',
  kicker: 'Com o que eu trabalho',
  groups: [
    {
      label: 'Kotlin e Android',
      core: true,
      items: ['Kotlin', 'Kotlin Multiplatform', 'Compose'],
    },
    {
      label: 'Front-end web',
      core: true,
      items: ['Vue 3', 'Nuxt 4', 'TypeScript'],
    },
    {
      label: 'Backend',
      core: false,
      items: ['Java', 'Spring', 'Node', 'Rails', 'PHP'],
    },
    {
      label: 'IA aplicada',
      core: false,
      items: ['LLMs', 'RAG', 'MCP', 'n8n', 'OCR'],
    },
    {
      label: 'Infra e deploy',
      core: false,
      items: ['Docker', 'AWS', 'Dokploy'],
    },
    {
      label: 'Práticas',
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
  heading: 'Technologies',
  kicker: 'What I work with',
  groups: [
    {
      label: 'Kotlin and Android',
      core: true,
      items: ['Kotlin', 'Kotlin Multiplatform', 'Compose'],
    },
    {
      label: 'Front-end web',
      core: true,
      items: ['Vue 3', 'Nuxt 4', 'TypeScript'],
    },
    {
      label: 'Backend',
      core: false,
      items: ['Java', 'Spring', 'Node', 'Rails', 'PHP'],
    },
    {
      label: 'Applied AI',
      core: false,
      items: ['LLMs', 'RAG', 'MCP', 'n8n', 'OCR'],
    },
    {
      label: 'Infra and deploy',
      core: false,
      items: ['Docker', 'AWS', 'Dokploy'],
    },
    {
      label: 'Practices',
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
