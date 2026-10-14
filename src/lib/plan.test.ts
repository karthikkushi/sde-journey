import { describe, expect, it } from 'vitest'
import { TOTAL_WEEKS, WEEKS } from '../../content/data/roadmap'
import { todayIST, minutesNowIST, addDays, dayOfWeek } from './dates'
import { buildWeek, monthOfWeek, position, weekStart, TOTAL_MONTHS } from './plan'
import { PROBLEMS, problemBySlug } from './problems'

describe('dates', () => {
  it('uses India time, not UTC', () => {
    // 19:00 UTC on 13 Oct is 00:30 on 14 Oct in India.
    expect(todayIST(new Date('2026-10-13T19:00:00Z'))).toBe('2026-10-14')
    expect(todayIST(new Date('2026-10-13T18:00:00Z'))).toBe('2026-10-13')
    expect(minutesNowIST(new Date('2026-10-14T01:15:00Z'))).toBe(6 * 60 + 45) // 6:45 AM IST
  })
  it('adds days across months and years', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29') // leap year
  })
})

describe('position in the plan', () => {
  it('start day is week 1, day 1, a Wednesday', () => {
    expect(position('2026-10-14', 0)).toEqual({ status: 'during', week: 1, dayIndex: 0 })
    expect(dayOfWeek('2026-10-14')).toBe(3)
  })
  it('phase 1 ends on 24 Nov 2026 (end of week 6)', () => {
    expect(position('2026-11-24', 0)).toEqual({ status: 'during', week: 6, dayIndex: 6 })
    expect(position('2026-11-25', 0)).toMatchObject({ week: 7, dayIndex: 0 })
  })
  it('before and after the plan', () => {
    expect(position('2026-10-10', 0)).toEqual({ status: 'before', daysToGo: 4 })
    expect(position(addDays('2026-10-14', 65 * 7), 0)).toEqual({ status: 'after' })
    expect(position(addDays('2026-10-14', 65 * 7 - 1), 0)).toMatchObject({ week: 65 })
  })
  it('shifting the plan moves today back', () => {
    expect(position('2026-12-02', 0)).toMatchObject({ week: 8 })
    expect(position('2026-12-02', 2)).toMatchObject({ week: 6 })
    expect(weekStart(1, 2)).toBe('2026-10-28')
  })
})

describe('months', () => {
  it('maps weeks to calendar months from 14 Oct', () => {
    expect(monthOfWeek(1)).toBe(1)
    expect(monthOfWeek(5)).toBe(1) // starts 11 Nov
    expect(monthOfWeek(6)).toBe(2) // starts 18 Nov
    expect(monthOfWeek(26)).toBe(6)
    expect(TOTAL_MONTHS).toBe(15)
  })
})

describe('roadmap data', () => {
  it('has all 65 weeks, numbered in order', () => {
    expect(WEEKS).toHaveLength(TOTAL_WEEKS)
    WEEKS.forEach((w, i) => expect(w.n).toBe(i + 1))
  })
  it('only uses problems that exist in problems.json', () => {
    for (const w of WEEKS) for (const slug of w.problems) expect(problemBySlug(slug), slug).toBeDefined()
  })
  it('every verified problem has a title from LeetCode', () => {
    for (const p of PROBLEMS) expect(p.title, p.slug).toBeTruthy()
  })
  it('every week builds 7 days, each with tasks, and no task is lost', () => {
    for (const w of WEEKS) {
      const days = buildWeek(w, 0)
      expect(days).toHaveLength(7)
      days.forEach((d) => expect(d.tasks.length).toBeGreaterThan(0))
      const ids = days.flatMap((d) => d.tasks.map((t) => t.id))
      for (const slug of w.problems) expect(ids).toContain(`p:${slug}`)
      w.learn.forEach((_, i) => expect(ids).toContain(`w${w.n}:l${i}`))
    }
  })
  it('task ids are unique across the whole plan', () => {
    const ids = WEEKS.flatMap((w) => buildWeek(w, 0).flatMap((d) => d.tasks.map((t) => t.id)))
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('Saturday gets the long block and Friday evening gets the Friday topic', () => {
    const days = buildWeek(WEEKS[9], 0) // week 10
    const sat = days.find((d) => d.dow === 6)!
    const fri = days.find((d) => d.dow === 5)!
    expect(sat.tasks.some((t) => t.slot === 'block')).toBe(true)
    expect(fri.tasks.find((t) => t.slot === 's2')?.id).toBe('w10:fri')
  })
  it('about 150 problems by week 26 and about 250 by week 43', () => {
    const upTo = (n: number) => WEEKS.slice(0, n).reduce((s, w) => s + w.problems.length, 0)
    expect(upTo(26)).toBeGreaterThanOrEqual(140)
    expect(upTo(43)).toBeGreaterThanOrEqual(240)
  })
})
