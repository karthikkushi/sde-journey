import { describe, expect, it } from 'vitest'
import { BADGES, earned } from './badges'
import { celebrationsFor, tasksOfWeek } from './celebrate'
import type { Flashcard } from './notes'
import { defaultProgress, type Progress } from './progress'
import { dueCards, schedule } from './srs'

const today = '2026-10-20'

describe('spaced repetition (SM-2)', () => {
  it('good answers space the card out: 1 day, 6 days, then longer', () => {
    const c1 = schedule(undefined, 'good', today)
    expect(c1).toEqual({ ease: 2.5, interval: 1, reps: 1, due: '2026-10-21' })
    const c2 = schedule(c1, 'good', '2026-10-21')
    expect(c2).toMatchObject({ interval: 6, reps: 2, due: '2026-10-27' })
    const c3 = schedule(c2, 'good', '2026-10-27')
    expect(c3).toMatchObject({ interval: 15, reps: 3 }) // round(6 * 2.5)
  })
  it('easy raises ease, hard lowers it, and ease never drops below 1.3', () => {
    expect(schedule(undefined, 'easy', today).ease).toBe(2.6)
    expect(schedule(undefined, 'hard', today).ease).toBe(2.36)
    let c = schedule(undefined, 'again', today)
    for (let i = 0; i < 10; i++) c = schedule(c, 'again', today)
    expect(c.ease).toBe(1.3)
  })
  it('again resets the card to tomorrow', () => {
    const learned = { ease: 2.5, interval: 30, reps: 5, due: today }
    expect(schedule(learned, 'again', today)).toMatchObject({ interval: 1, reps: 0, due: '2026-10-21' })
  })
  it('due list: cards whose day came, plus new cards only from finished notes', () => {
    const cards: Flashcard[] = [
      { id: 'a:0', noteId: 'a', front: '', back: '' },
      { id: 'a:1', noteId: 'a', front: '', back: '' },
      { id: 'b:0', noteId: 'b', front: '', back: '' },
    ]
    const p: Progress = {
      ...defaultProgress(),
      notesDone: { a: today },
      cards: { 'a:0': { ease: 2.5, interval: 1, reps: 1, due: '2026-10-25' } }, // not due yet
    }
    expect(dueCards(cards, p, today).map((c) => c.id)).toEqual(['a:1'])
    expect(dueCards(cards, p, '2026-10-25').map((c) => c.id)).toEqual(['a:0', 'a:1'])
  })
})

describe('badges', () => {
  const badge = (id: string) => BADGES.find((b) => b.id === id)!
  it('fifty solved', () => {
    const done = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`p:x${i}`, today]))
    expect(earned(badge('p50'), { ...defaultProgress(), done })).toBe(true)
    expect(badge('p50').progress({ ...defaultProgress(), done: { 'p:a': today } })).toEqual([1, 50])
  })
  it('medium in under 30 minutes needs a solved medium with minutes logged', () => {
    const base = { ...defaultProgress(), done: { 'p:two-sum': today, 'p:group-anagrams': today } }
    expect(earned(badge('fastMedium'), { ...base, solveMinutes: { 'two-sum': 10 } })).toBe(false) // easy
    expect(earned(badge('fastMedium'), { ...base, solveMinutes: { 'group-anagrams': 45 } })).toBe(false) // too slow
    expect(earned(badge('fastMedium'), { ...base, solveMinutes: { 'group-anagrams': 25 } })).toBe(true)
  })
  it('first deployed project', () => {
    expect(earned(badge('deployed'), { ...defaultProgress(), done: { 'proj:kirana:8': today } })).toBe(true)
    expect(earned(badge('deployed'), { ...defaultProgress(), done: { 'proj:kirana:2': today } })).toBe(false)
  })
  it('100 focus hours', () => {
    expect(earned(badge('focus100'), { ...defaultProgress(), focus: { a: 3000, b: 3000 } })).toBe(true)
  })
})

describe('celebrations', () => {
  it('fires when the last task of a week is ticked, and only then', () => {
    const ids = tasksOfWeek(2)
    const before = Object.fromEntries(ids.slice(1).map((id) => [id, today]))
    const after = { ...before, [ids[0]]: today }
    expect(celebrationsFor(ids[0], before, after)).toEqual(['Week 2 complete!'])
    expect(celebrationsFor(ids[0], {}, { [ids[0]]: today })).toEqual([]) // week not finished
    expect(celebrationsFor('h:2026-10-20:sleep', {}, { 'h:2026-10-20:sleep': today })).toEqual([]) // habits: no week
  })
  it('finishing the last week of phase 1 also finishes month 2 and phase 1', () => {
    const all = Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((n) => tasksOfWeek(n)).map((id) => [id, today]))
    const last = tasksOfWeek(6)[0]
    const before = { ...all }
    delete before[last]
    const got = celebrationsFor(last, before, all)
    expect(got).toContain('Week 6 complete!')
    expect(got).toContain('Phase 1 (Basics) complete!')
  })
})
