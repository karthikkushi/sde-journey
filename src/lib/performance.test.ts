import { describe, expect, it } from 'vitest'
import { gameStats, habitStats, insights, problemStats, problemsVsPlan, projectedEnd, weekdayActivity, weeklyTrend } from './performance'
import { isCore, planSchedule } from './plan'
import { defaultProgress, type Progress } from './progress'

const START = '2026-10-14' // a Wednesday
const make = (extra: Partial<Progress>): Progress => ({ ...defaultProgress(), startDate: START, ...extra })
const texts = (xs: { text: string }[]) => xs.map((x) => x.text).join('\n')

describe('weekly numbers', () => {
  const p = make({
    done: { 'w1:l0': '2026-10-14', 'p:reverse-string': '2026-10-15', 'w2:l0': '2026-10-21', 'h:2026-10-21:sleep': '2026-10-21' },
    focus: { '2026-10-14': 50, '2026-10-22': 90 },
  })
  it('counts ticks, focus minutes and study days per plan week (habits are not study)', () => {
    expect(weeklyTrend(p, '2026-10-27')).toEqual([
      { week: 1, tasks: 2, focusMin: 50, activeDays: 2 },
      { week: 2, tasks: 1, focusMin: 90, activeDays: 1 },
    ])
  })
  it('counts study days per weekday, leaving out today until you study', () => {
    const rows = weekdayActivity(p, '2026-10-27') // Tuesday
    expect(rows.find((r) => r.name === 'Wed')).toMatchObject({ active: 2, total: 2 })
    expect(rows.find((r) => r.name === 'Thu')).toMatchObject({ active: 1, total: 2 })
    expect(rows.find((r) => r.name === 'Tue')).toMatchObject({ active: 0, total: 1 })
  })
})

describe('problems', () => {
  const p = make({
    done: {
      'p:rotting-oranges': '2026-10-20', 'p:walls-and-gates': '2026-10-21', // graph BFS, slow
      'p:reverse-string': '2026-10-15', 'p:valid-palindrome': '2026-10-16', 'p:squares-of-a-sorted-array': '2026-10-17', // two pointers, fast
      'p:jewels-and-stones': '2026-10-18', // no minutes logged
    },
    solveMinutes: { 'rotting-oranges': 40, 'walls-and-gates': 50, 'reverse-string': 10, 'valid-palindrome': 12, 'squares-of-a-sorted-array': 14 },
    honest: { 'rotting-oranges': true, 'walls-and-gates': true, 'reverse-string': true, 'jewels-and-stones': true },
  })
  it('groups by pattern with average minutes and the "written by me" share', () => {
    const s = problemStats(p)
    expect(s).toMatchObject({ solved: 6, timed: 5, avgMin: 25.2 })
    expect(s.tags.find((t) => t.tag === 'graph-bfs')).toMatchObject({ solved: 2, timed: 2, avgMin: 45, honestShare: 1 })
    expect(s.byDifficulty.find((d) => d.level === 'Easy')).toMatchObject({ solved: 4, timed: 3, avgMin: 12 })
    expect(s.honestShare).toBeCloseTo(4 / 6)
  })
  it('finds slow and fast patterns, and too much AI help', () => {
    const a = insights(p, '2026-10-27')
    expect(texts(a.weaknesses)).toContain('Slow on Graph BFS')
    expect(texts(a.strengths)).toContain('Fast on Two pointers (opposite ends)')
    expect(texts(a.weaknesses)).toContain('Only 67% of solved problems')
  })
  it('compares solved with planned at the end of each week', () => {
    const weeks = problemsVsPlan(p, '2026-10-27')
    expect(weeks).toHaveLength(2)
    expect(weeks[1].solved).toBe(6)
  })
})

describe('pace advice', () => {
  it('a brand-new plan gives no advice at all (no false alarms)', () => {
    const a = insights(make({ startDate: '2026-10-14' }), '2026-10-14')
    expect(a).toEqual({ strengths: [], weaknesses: [], actions: [] })
  })
  it('behind by a few days: points to the catch-up list', () => {
    const a = insights(make({}), '2026-10-20')
    expect(texts(a.weaknesses)).toContain('6 days behind')
    expect(texts(a.actions)).toContain('catch-up list')
  })
  it('a week or more behind: suggests moving the plan', () => {
    expect(texts(insights(make({}), '2026-10-25').actions)).toContain('Move the plan 1 week later')
  })
  it('projects the finish date from recent speed', () => {
    const core = planSchedule(START).filter((s) => isCore(s.task))
    const onSchedule = Object.fromEntries(core.filter((s) => s.date <= '2026-10-27').map((s) => [s.task.id, s.date]))
    expect(projectedEnd(make({ done: onSchedule }), '2026-10-27')! > '2026-10-27').toBe(true)
    expect(projectedEnd(make({}), '2026-10-27')).toBeNull()
  })
})

describe('habits and games', () => {
  it('flags a habit kept on fewer than half of the last 14 days', () => {
    const done = Object.fromEntries(['2026-10-15', '2026-10-18', '2026-10-22'].map((d) => [`h:${d}:sleep`, d]))
    const p = make({ done })
    expect(habitStats(p, '2026-10-27').habits.find((h) => h.id === 'sleep')).toMatchObject({ done: 3 })
    expect(texts(insights(p, '2026-10-27').weaknesses)).toContain('done on 3 of the last 14 days')
  })
  it('reads hits and misses per pattern, ignoring the best-streak score', () => {
    const p = make({ games: { pattern: 5, 'pattern:hit:freq': 1, 'pattern:miss:freq': 3, 'bigo:hit:O(n)': 2 } })
    expect(gameStats(p, 'pattern')).toEqual([{ topic: 'freq', hit: 1, miss: 3, accuracy: 0.25 }])
    expect(texts(insights(p, '2026-10-27').weaknesses)).toContain('you miss Frequency counting')
  })
})
