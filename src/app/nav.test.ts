import { expect, it } from 'vitest'
import { NAV, NAV_GROUPS, mobileTabFor } from './nav'

it('keeps every section reachable exactly once in grouped navigation', () => {
  const paths = NAV_GROUPS.flatMap((group) => group.items.map((item) => item.to))
  expect(paths.toSorted()).toEqual(NAV.map((item) => item.to).toSorted())
  expect(new Set(paths).size).toBe(paths.length)
})

it('keeps a useful mobile tab active on detail pages and secondary sections', () => {
  expect(mobileTabFor('/')).toBe('/')
  expect(mobileTabFor('/notes/a01-how-code-runs')).toBe('/notes')
  expect(mobileTabFor('/roadmap/week/7')).toBe('/roadmap')
  expect(mobileTabFor('/projects/backend')).toBe('/more')
  expect(mobileTabFor('/settings')).toBe('/more')
})
