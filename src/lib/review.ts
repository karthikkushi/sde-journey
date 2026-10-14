import { addDays } from './dates'
import { weekStart } from './plan'
import type { Progress } from './progress'

/** Facts about one plan week, read from your logs, to help fill the Sunday review. */
export function weekStats(p: Progress, week: number) {
  const first = weekStart(week, p.shiftWeeks)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(first, i))
  const inWeek = new Set(dates)

  const solved = Object.entries(p.done).filter(([id, d]) => id.startsWith('p:') && inWeek.has(d)).length
  const focusMin = dates.reduce((sum, d) => sum + (p.focus[d] ?? 0), 0)
  const exerciseDays = dates.filter((d) => p.done[`h:${d}:exercise`] || p.done[`m:${d}:exercise`]).length
  const energy = { fresh: 0, tired: 0, low: 0 }
  for (const d of dates) {
    const e = p.energy[d]
    if (e) energy[e]++
  }
  return { first, last: dates[6], solved, focusHours: Math.round((focusMin / 60) * 10) / 10, exerciseDays, energy }
}

export const REVIEW_FIELDS = [
  { key: 'solved', label: 'Problems solved this week' },
  { key: 'wrong', label: 'Problems I got wrong (redo these)' },
  { key: 'missing', label: 'The pattern I keep missing' },
  { key: 'focus', label: 'Focus hours' },
  { key: 'sleep', label: 'Sleep (average hours, and nights after 10:30)' },
  { key: 'exercise', label: 'Exercise days (out of 7)' },
  { key: 'energy', label: 'Energy trend (better, same, worse, and why)' },
  { key: 'change', label: 'One thing to change next week' },
] as const
