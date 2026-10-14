import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

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
