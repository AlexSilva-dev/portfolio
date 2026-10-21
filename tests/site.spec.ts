import { describe, expect, it } from 'vitest'
import { SITE_BASE_URL } from '../app/utils/site'

describe('SITE_BASE_URL', () => {
  it('retorna o caminho base do GitHub Pages do repositório', () => {
    expect(SITE_BASE_URL).toBe('/portfolio/')
  })
})
