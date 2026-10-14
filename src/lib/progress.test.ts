import { describe, expect, it } from 'vitest'
import { defaultProgress, parseProgress, type Progress } from './progress'
import { canFreezeYesterday, freezeAvailable, longestStreak, streakOf } from './streak'
import { levelOf, LEVELS, totalXp, XP } from './xp'

const withDone = (entries: Record<string, string>, extra: Partial<Progress> = {}): Progress => ({
  ...defaultProgress(),
  done: entries,
  ...extra,
})

describe('import / export', () => {
  it('round-trips through JSON', () => {
    const p = withDone({ 'p:two-sum': '2026-10-14' }, { shiftWeeks: 2, texts: { 'note:a01': 'hello' } })
    expect(parseProgress(JSON.parse(JSON.stringify(p)))).toEqual(p)
  })
  it('rejects files that are not backups', () => {
    expect(() => parseProgress(null)).toThrow()
    expect(() => parseProgress([])).toThrow()
    expect(() => parseProgress({ hello: 1 })).toThrow()
    expect(() => parseProgress({ version: 2 })).toThrow()
  })
  it('keeps defaults for missing or wrong-shaped fields', () => {
    const p = parseProgress({ version: 1, shiftWeeks: 'three', done: [], mocks: {}, cardReviews: 7 })
    expect(p.shiftWeeks).toBe(0)
    expect(p.done).toEqual({})
    expect(p.mocks).toEqual([])
    expect(p.cardReviews).toBe(7)
  })
  it('drops unknown fields', () => {
    const p = parseProgress({ version: 1, evil: 'x' }) as unknown as Record<string, unknown>
    expect(p.evil).toBeUndefined()
  })
})

describe('streaks', () => {
  const today = '2026-10-20'
  it('counts consecutive study days up to today', () => {
    const p = withDone({ 'w1:l0': '2026-10-18', 'w1:l1': '2026-10-19', 'p:two-sum': '2026-10-20' })
    expect(streakOf(p, today)).toBe(3)
  })
  it('today not studied yet does not break the streak', () => {
    const p = withDone({ 'w1:l0': '2026-10-18', 'w1:l1': '2026-10-19' })
    expect(streakOf(p, today)).toBe(2)
  })
  it('a missed day breaks it', () => {
    const p = withDone({ 'w1:l0': '2026-10-17', 'w1:l1': '2026-10-19' })
    expect(streakOf(p, today)).toBe(1)
  })
  it('the minimum day keeps it alive, habits alone do not', () => {
    const p = withDone({ 'm:2026-10-18:dsa': '2026-10-18', 'h:2026-10-19:sleep': '2026-10-19', 'w1:l0': '2026-10-20' })
    expect(streakOf(p, today)).toBe(1)
    p.done['m:2026-10-19:dsa'] = '2026-10-19'
    expect(streakOf(p, today)).toBe(3)
  })
  it('a focus block counts as study', () => {
    const p = withDone({ 'w1:l0': '2026-10-19' }, { focusBlocks: { '2026-10-20': 1 } })
    expect(streakOf(p, today)).toBe(2)
  })
  it('a freeze bridges a missed day without adding to the count', () => {
    const p = withDone({ 'w1:l0': '2026-10-17', 'w1:l1': '2026-10-19' }, { freezes: { '2026-10-18': true } })
    expect(streakOf(p, today)).toBe(2)
    expect(longestStreak(p)).toBe(2)
  })
  it('only one freeze per plan week (Wed to Tue)', () => {
    const p = withDone({}, { freezes: { '2026-10-15': true } }) // week 1
    expect(freezeAvailable(p, '2026-10-20')).toBe(false) // Tue, still week 1
    expect(freezeAvailable(p, '2026-10-21')).toBe(true) // Wed, week 2
  })
  it('offers to freeze yesterday only when it would save a streak', () => {
    expect(canFreezeYesterday(withDone({ 'w1:l0': '2026-10-18' }), today)).toBe(true)
    expect(canFreezeYesterday(withDone({ 'w1:l0': '2026-10-19' }), today)).toBe(false) // yesterday was fine
    expect(canFreezeYesterday(withDone({}), today)).toBe(false) // no streak to save
  })
})

describe('XP and levels', () => {
  it('adds XP from every kind of work', () => {
    const p = withDone(
      { 'w1:l0': 'd', 'p:two-sum': 'd', 'h:d:sleep': 'd', 'm:d:dsa': 'd' },
      { focusBlocks: { d: 2 }, notesDone: { a01: 'd' }, cardReviews: 5, weekly: { '1': {} }, mocks: [{ date: 'd', kind: 'x', notes: '' }] },
    )
    expect(totalXp(p)).toBe(XP.task + XP.problem + 2 * XP.habit + 2 * XP.focusBlock + XP.note + 5 * XP.card + XP.weekly + XP.mock)
  })
  it('un-ticking takes XP back', () => {
    expect(totalXp(withDone({}))).toBe(0)
  })
  it('levels and progress to the next level', () => {
    expect(levelOf(0)).toMatchObject({ index: 0, name: 'Beginner', toNext: 800 })
    expect(levelOf(400).share).toBeCloseTo(0.5)
    expect(levelOf(800).name).toBe('Python Explorer')
    expect(levelOf(999999)).toMatchObject({ index: LEVELS.length - 1, name: 'L3 Ready', share: 1, toNext: 0 })
  })
})
