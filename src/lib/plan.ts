// Turns the roadmap data (content/data/roadmap.ts) into dated weeks and daily tasks.
import { PHASES, START_DATE, TOTAL_WEEKS, WEEKS, type Learn, type WeekSpec } from '../../content/data/roadmap'
import { addDays, dayOfWeek, daysBetween } from './dates'
import { problemBySlug } from './problems'

/** Where a task sits in the day. s1 = morning session, s2 = evening session. */
export type Slot = 's1' | 's2' | 'block' | 'review' | 'extra'

export type Task = {
  id: string // stable key used to save the tick
  text: string
  slot: Slot
  learn?: Learn // link info (resource, note or page)
  problem?: string // LeetCode slug
}

export type Day = { date: string; dow: number; tasks: Task[] }

/** The plan start after "shift forward N weeks". */
export const planStart = (shift: number) => addDays(START_DATE, 7 * shift)

/** First day (a Wednesday) of week n. */
export const weekStart = (n: number, shift: number) => addDays(planStart(shift), 7 * (n - 1))

export type Position =
  | { status: 'before'; daysToGo: number }
  | { status: 'during'; week: number; dayIndex: number }
  | { status: 'after' }

/** Which week and day of the plan a date falls on. */
export function position(date: string, shift: number): Position {
  const d = daysBetween(planStart(shift), date)
  if (d < 0) return { status: 'before', daysToGo: -d }
  const week = Math.floor(d / 7) + 1
  if (week > TOTAL_WEEKS) return { status: 'after' }
  return { status: 'during', week, dayIndex: d % 7 }
}

/**
 * Month 1..15 of week n, counted in calendar months from the start date
 * (month 1 = 14 Oct to 13 Nov). Uses the original start so months never move.
 */
export function monthOfWeek(n: number) {
  const d = addDays(START_DATE, 7 * (n - 1))
  const [y0, m0, d0] = START_DATE.split('-').map(Number)
  const [y, m, dd] = d.split('-').map(Number)
  return (y - y0) * 12 + (m - m0) - (dd < d0 ? 1 : 0) + 1
}

export const TOTAL_MONTHS = monthOfWeek(TOTAL_WEEKS)

export const phasesOfWeek = (n: number) => PHASES.filter((p) => n >= p.from && n <= p.to)

export const weekSpec = (n: number) => WEEKS[n - 1]

// Light evening tasks. You are tired after office, so these are small on purpose.
const LIGHT_PYTHON = [
  "Type this morning's code again from memory. Run it in Python Tutor",
  "Re-read this week's note. Answer its \"Explain it back\" questions",
]
const LIGHT_DSA = [
  "Watch the NeetCode video for this morning's problem. Write 3 lines on what you missed",
  "Flashcards due today, then re-read this week's note",
]

/** Build the 7 days (Wed to Tue) of one week. */
export function buildWeek(w: WeekSpec, shift: number): Day[] {
  const isPython = w.n <= 6
  const light = isPython ? LIGHT_PYTHON : LIGHT_DSA

  // One queue of "real work": learning first, then problems (easy to hard).
  const queue: Task[] = [
    ...w.learn.map((l, i): Task => ({ id: `w${w.n}:l${i}`, text: l.text, slot: 's1', learn: l })),
    ...w.problems.map((slug): Task => ({ id: `p:${slug}`, text: problemBySlug(slug)?.title ?? slug, slot: 's1', problem: slug })),
  ]

  // Hand it out in date order: Wed, Thu, Fri mornings -> Saturday block (max 4)
  // -> Sunday block (the rest) -> Mon, Tue mornings (the last two).
  const wedToFri = queue.splice(0, 3)
  const monTue = queue.length >= 2 ? queue.splice(-2) : queue.splice(0)
  const saturday = queue.splice(0, 4).map((t) => ({ ...t, slot: 'block' as const }))
  const sunday = queue.map((t) => ({ ...t, slot: 'block' as const }))

  const extras = (w.extras ?? []).map((l, i): Task => ({ id: `w${w.n}:x${i}`, text: l.text, slot: 'extra', learn: l }))

  const days: Day[] = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart(w.n, shift), i)
    const dow = dayOfWeek(date)
    const tasks: Task[] = []

    if (dow >= 1 && dow <= 5) {
      // Weekday: one morning task + one light evening task (Friday evening = SQL / CS topic).
      const morning = dow <= 2 ? monTue[dow - 1] : wedToFri[dow - 3]
      tasks.push(morning ?? { id: `w${w.n}:d${dow}:s1`, text: 'Re-solve one problem from this week from a blank page', slot: 's1' })
      tasks.push(
        dow === 5
          ? { id: `w${w.n}:fri`, text: w.friday.text, slot: 's2', learn: w.friday }
          : { id: `w${w.n}:d${dow}:s2`, text: light[i % 2], slot: 's2' },
      )
    } else if (dow === 6) {
      // Saturday: the long 3-hour block.
      tasks.push(...(saturday.length ? saturday : [{ id: `w${w.n}:sat`, text: "Practice block: redo this week's work from a blank page", slot: 'block' as const }]))
      tasks.push(...extras.filter((_, k) => k % 2 === 0))
    } else {
      // Sunday: 2-hour block, then review and cooking.
      tasks.push(...sunday)
      tasks.push(
        { id: `w${w.n}:sun:check`, text: `Checkpoint: ${w.checkpoint}`, slot: 'review' },
        { id: `w${w.n}:sun:review`, text: 'Weekly review: fill the form', slot: 'review', learn: { text: 'Weekly review', to: '/review' } },
        { id: `w${w.n}:sun:redo`, text: isPython ? 'Redo the exercises you found hard' : 'Redo the problems you got wrong this week', slot: 'review' },
        { id: `w${w.n}:sun:cook`, text: 'Batch cook for the week', slot: 'review' },
      )
      tasks.push(...extras.filter((_, k) => k % 2 === 1))
    }
    days.push({ date, dow, tasks })
  }
  return days
}

/** All tasks of week n, flat. */
export const weekTasks = (n: number) => buildWeek(weekSpec(n), 0).flatMap((d) => d.tasks)

/** Share of tasks ticked, from 0 to 1. */
export function doneShare(tasks: Task[], done: Record<string, string>) {
  if (!tasks.length) return 0
  return tasks.filter((t) => done[t.id]).length / tasks.length
}
