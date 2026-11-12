import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); vi.useRealTimers() })

it('a plan with nothing ticked starts today; a plan tick or a later chosen day keeps the date', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-12T06:00:00Z'))
  const saved = new Map<string, string>()
  vi.stubGlobal('localStorage', { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value) })
  const startAfterLoad = async (startDate: string, done: Record<string, string>) => {
    saved.set('sdej-progress', JSON.stringify({ version: 1, startDate, done }))
    vi.resetModules()
    return (await import('./progress')).getProgress().startDate
  }
  expect(await startAfterLoad('2026-10-14', {})).toBe('2026-11-12') // opened weeks ago, never started
  expect(await startAfterLoad('2026-10-14', { 'h:2026-10-14:sleep': '2026-10-14' })).toBe('2026-11-12') // habits are not the plan
  expect(await startAfterLoad('2026-10-14', { 'w1:l0': '2026-10-14' })).toBe('2026-10-14')
  expect(await startAfterLoad('2026-10-14', { 'p:two-sum': '2026-10-20' })).toBe('2026-10-14')
  expect(await startAfterLoad('2026-11-16', {})).toBe('2026-11-16') // "I start on Monday"
})

it('keeps unsaved work available for export and clears the warning after retry succeeds', async () => {
  const saved = new Map<string, string>()
  let blocked = true
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (blocked) throw new Error('Storage full')
      saved.set(key, value)
    },
  })
  const store = await import('./progress')
  store.setText('note:test', 'Keep this answer')
  expect(store.getSaveFailed()).toBe(true)
  expect(store.getProgress().texts['note:test']).toBe('Keep this answer')
  blocked = false
  store.retrySave()
  expect(store.getSaveFailed()).toBe(false)
  expect(JSON.parse(saved.get('sdej-progress')!).texts['note:test']).toBe('Keep this answer')
})
