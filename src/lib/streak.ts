import { START_DATE } from '../../content/data/roadmap'
import { addDays, daysBetween } from './dates'
import type { Progress } from './progress'

/**
 * Days on which real study happened: a roadmap task, a problem,
 * the minimum-day DSA item, or a finished focus block.
 * Habits like "sleep" alone do not count.
 */
export function keptDays(p: Progress) {
  const kept = new Set<string>()
  for (const [id, date] of Object.entries(p.done)) {
    if (id.startsWith('w') || id.startsWith('p:') || (id.startsWith('m:') && id.endsWith(':dsa'))) kept.add(date)
  }
  for (const [date, n] of Object.entries(p.focusBlocks)) if (n > 0) kept.add(date)
  return kept
}

/**
 * Current streak in days. Today still counts as "in progress":
 * if you have not studied yet today, the streak is counted up to yesterday.
 * A frozen day does not break the streak, but does not add to it either.
 */
export function streakOf(p: Progress, today: string) {
  const kept = keptDays(p)
  let day = kept.has(today) ? today : addDays(today, -1)
  let count = 0
  while (kept.has(day) || p.freezes[day]) {
    if (kept.has(day)) count++
    day = addDays(day, -1)
  }
  return count
}

/** Freeze "week" = the plan week (Wed to Tue) a date falls in. */
const freezeWeek = (date: string) => Math.floor(daysBetween(START_DATE, date) / 7)

/** True if no freeze has been used yet in the same week as `date`. */
export const freezeAvailable = (p: Progress, date: string) =>
  !Object.keys(p.freezes).some((d) => freezeWeek(d) === freezeWeek(date))

/**
 * Should the Today page offer to freeze yesterday?
 * Only when yesterday was missed, the day before was part of a streak, and a freeze is free.
 */
export function canFreezeYesterday(p: Progress, today: string) {
  const kept = keptDays(p)
  const y = addDays(today, -1)
  const before = addDays(today, -2)
  return !kept.has(y) && !p.freezes[y] && (kept.has(before) || !!p.freezes[before]) && freezeAvailable(p, y)
}

/** Longest streak ever (for badges). */
export function longestStreak(p: Progress) {
  const kept = keptDays(p)
  let best = 0
  for (const d of kept) {
    if (kept.has(addDays(d, -1)) || p.freezes[addDays(d, -1)]) continue // not the start of a run
    let len = 0
    let day = d
    while (kept.has(day) || p.freezes[day]) {
      if (kept.has(day)) len++
      day = addDays(day, 1)
    }
    best = Math.max(best, len)
  }
  return best
}
