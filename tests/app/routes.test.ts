import { describe, expect, it } from 'vitest'
import { routes } from '@/app/routes'

describe('routes', () => {
  it('path tidak ada yang kembar', () => {
    const paths = routes.map((r) => r.to)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('home ada di path root', () => {
    expect(routes.find((r) => r.to === '/')).toBeDefined()
  })

  it('setiap route punya tepat satu placement yang valid', () => {
    for (const route of routes) {
      expect(['start', 'end']).toContain(route.placement)
    }
  })
})
