import { describe, expect, it } from 'vitest'
import { BACKUP_PREFIX, backupBeforeUpgrade, listBackups, restoreBackup } from './backup'
import { CURRENT_VERSION, migrate, parseProgress } from './progress'

/** A small in-memory Storage, enough for these tests. */
function memoryStorage(init: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(init))
  return {
    get length() { return map.size },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v) },
    removeItem: (k: string) => { map.delete(k) },
    clear: () => map.clear(),
  }
}

// A real-looking version-1 save, with something in every kind of field.
const OLD_V1 = {
  version: 1, startDate: '2026-10-14',
  done: { 'w1:l0': '2026-10-14', 'p:two-sum': '2026-10-20', 'h:2026-10-20:sleep': '2026-10-20' },
  energy: { '2026-10-20': 'tired' }, freezes: { '2026-10-18': true }, focus: { '2026-10-20': 45 }, focusBlocks: { '2026-10-20': 1 },
  texts: { 'note:a01': 'my answer', 'study-budget:2026-10-20': '90' }, notesDone: { 'a01-how-code-runs': '2026-10-15' },
  honest: { 'two-sum': true }, solveMinutes: { 'two-sum': 18 },
  cards: { 'a01-how-code-runs:0': { ease: 2.5, interval: 6, reps: 2, due: '2026-10-26' } }, cardReviews: 4, cardLog: ['2026-10-20|a01-how-code-runs:0|good'],
  weekly: { 1: { win: 'finished week 1' } }, mocks: [{ date: '2026-10-19', kind: 'self', notes: 'slow' }],
  jobs: [], games: { pattern: 7 }, problemReviews: { 'two-sum': { level: 'independent', date: '2026-10-20' } }, lastBackup: '2026-10-19',
}

describe('data version 1 -> 2', () => {
  it('keeps every old value and adds the new fields', () => {
    const p = parseProgress(JSON.parse(JSON.stringify(OLD_V1)))
    expect(p.version).toBe(CURRENT_VERSION)
    const { version: _old, ...oldFields } = OLD_V1
    expect(p).toMatchObject(oldFields) // nothing lost
    expect(p.papers).toEqual({})
    expect(p.links).toEqual({})
  })
  it('migrate never drops unknown fields and leaves newer versions alone', () => {
    expect(migrate({ version: 1, extra: 5 })).toMatchObject({ version: 2, extra: 5 })
    expect(migrate({ version: 9, x: 1 })).toEqual({ version: 9, x: 1 })
  })
  it('keeps only https notebook links and known paper statuses', () => {
    const p = parseProgress({ version: 2, links: { python: 'https://notebooklm.google.com/notebook/abc', dsa: 'javascript:alert(1)', sql: 'http://x.com' },
      papers: { attention: { status: 'Reading', steps: ['abstract'] }, lora: { status: 'Half', steps: [] } } })
    expect(p.links).toEqual({ python: 'https://notebooklm.google.com/notebook/abc' })
    expect(Object.keys(p.papers)).toEqual(['attention'])
  })
})

describe('automatic backup before an upgrade', () => {
  it('copies every app key when old data is found, once per day, and never touches the original', () => {
    const v1 = JSON.stringify(OLD_V1)
    const storage = memoryStorage({ 'sdej-progress': v1, 'sdej-theme': 'dark', other: 'not ours' })
    const key = backupBeforeUpgrade(storage, '2026-11-17')
    expect(key).toBe(`${BACKUP_PREFIX}2026-11-17`)
    const saved = JSON.parse(storage.getItem(key)!)
    expect(saved).toEqual({ fromVersion: 1, data: { 'sdej-progress': v1, 'sdej-theme': 'dark' } })
    expect(storage.getItem('sdej-progress')).toBe(v1)
    storage.setItem('sdej-progress', JSON.stringify({ ...OLD_V1, done: {} }))
    backupBeforeUpgrade(storage, '2026-11-17')
    expect(JSON.parse(storage.getItem(key)!).data['sdej-progress']).toBe(v1) // the first copy wins
  })
  it('does nothing for new or current data, keeps the newest 3 copies, and can restore', () => {
    expect(backupBeforeUpgrade(memoryStorage(), '2026-11-17')).toBe('')
    expect(backupBeforeUpgrade(memoryStorage({ 'sdej-progress': JSON.stringify({ version: 2 }) }), '2026-11-17')).toBe('')
    const storage = memoryStorage({ 'sdej-progress': JSON.stringify(OLD_V1) })
    for (const d of ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04']) backupBeforeUpgrade(storage, d)
    expect(listBackups(storage)).toEqual(['2026-11-04', '2026-11-03', '2026-11-02'].map((d) => BACKUP_PREFIX + d))
    storage.setItem('sdej-progress', 'broken')
    expect(restoreBackup(storage, `${BACKUP_PREFIX}2026-11-04`)).toBe(true)
    expect(JSON.parse(storage.getItem('sdej-progress')!).done['p:two-sum']).toBe('2026-10-20')
  })
})
