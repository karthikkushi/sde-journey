// Turns the roadmap data (content/data/roadmap.ts) into dated weeks and daily tasks.
import { PHASES, START_DATE, TOTAL_WEEKS, WEEKS, type Learn, type WeekSpec } from '../../content/data/roadmap'
import { addDays, dayOfWeek, daysBetween } from './dates'
import { problemBySlug } from './problems'
import type { Progress } from './progress'

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

/** Day 1 of your plan: the day you first opened the app (change it in Settings). */
export const planStartOf = (p: Pick<Progress, 'startDate'>) => p.startDate || START_DATE

/** First day of week n. Weeks start on the same weekday as your start date. */
export const weekStart = (n: number, start: string) => addDays(start, 7 * (n - 1))

/** Last day of the plan. */
export const planEnd = (start: string) => addDays(start, 7 * TOTAL_WEEKS - 1)

export type Position =
  | { status: 'before'; daysToGo: number }
  | { status: 'during'; week: number; dayIndex: number }
  | { status: 'after' }

/** Which week and day of the plan a date falls on. */
export function position(date: string, start: string): Position {
  const d = daysBetween(start, date)
  if (d < 0) return { status: 'before', daysToGo: -d }
  const week = Math.floor(d / 7) + 1
  if (week > TOTAL_WEEKS) return { status: 'after' }
  return { status: 'during', week, dayIndex: d % 7 }
}

/**
 * Month 1..15 of week n. Weeks are grouped by calendar months of the original template
 * (14 Oct start: month 1 = weeks 1–5), so monthly checkpoints always cover the same weeks.
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

const isWeekday = (dow: number) => dow >= 1 && dow <= 5

/** Build the 7 days of one week (starting on your start date's weekday). */
export function buildWeek(w: WeekSpec, start: string): Day[] {
  const isPython = w.n <= 6
  const light = isPython ? LIGHT_PYTHON : LIGHT_DSA

  // One queue of "real work": learning first, then problems (easy to hard).
  const queue: Task[] = [
    ...w.learn.map((l, i): Task => ({ id: `w${w.n}:l${i}`, text: l.text, slot: 's1', learn: l })),
    ...w.problems.map((slug): Task => ({ id: `p:${slug}`, text: problemBySlug(slug)?.title ?? slug, slot: 's1', problem: slug })),
  ]
  const extras = (w.extras ?? []).map((l, i): Task => ({ id: `w${w.n}:x${i}`, text: l.text, slot: 'extra', learn: l }))
  const asBlock = (t: Task): Task => ({ ...t, slot: 'block' })

  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart(w.n, start), i))
  const dows = dates.map(dayOfWeek)
  const days: Day[] = []

  // Hand the queue out in date order: one task each weekday morning, up to 4 in Saturday's
  // long block, the rest on Sunday, while keeping one task for every weekday still to come
  // (and Saturday's share, if Saturday comes after Sunday in your week).
  // (Starting on a Wednesday: Wed–Fri get the first 3, Sat 4, Sun the rest, Mon–Tue the last 2.)
  for (let i = 0; i < 7; i++) {
    const dow = dows[i]
    const spare = Math.max(0, queue.length - dows.slice(i + 1).filter(isWeekday).length)
    const tasks: Task[] = []

    if (isWeekday(dow)) {
      // Weekday: one morning task + one light evening task (Friday evening = SQL / CS topic).
      tasks.push(queue.shift() ?? { id: `w${w.n}:d${dow}:s1`, text: 'Re-solve one problem from this week from a blank page', slot: 's1' })
      tasks.push(
        dow === 5
          ? { id: `w${w.n}:fri`, text: w.friday.text, slot: 's2', learn: w.friday }
          : { id: `w${w.n}:d${dow}:s2`, text: light[i % 2], slot: 's2' },
      )
    } else if (dow === 6) {
      // Saturday: the long 3-hour block.
      const block = queue.splice(0, Math.min(4, spare)).map(asBlock)
      tasks.push(...(block.length ? block : [{ id: `w${w.n}:sat`, text: "Practice block: redo this week's work from a blank page", slot: 'block' as const }]))
      tasks.push(...extras.filter((_, k) => k % 2 === 0))
    } else {
      // Sunday: 2-hour block, then review and cooking.
      const saturdayLater = dows.slice(i + 1).includes(6) ? 4 : 0
      tasks.push(...queue.splice(0, Math.max(0, spare - saturdayLater)).map(asBlock))
      tasks.push(
        { id: `w${w.n}:sun:check`, text: `Checkpoint: ${w.checkpoint}`, slot: 'review' },
        { id: `w${w.n}:sun:review`, text: 'Weekly review: fill the form', slot: 'review', learn: { text: 'Weekly review', to: '/review' } },
        { id: `w${w.n}:sun:redo`, text: isPython ? 'Redo the exercises you found hard' : 'Redo the problems you got wrong this week', slot: 'review' },
        { id: `w${w.n}:sun:cook`, text: 'Batch cook for the week', slot: 'review' },
      )
      tasks.push(...extras.filter((_, k) => k % 2 === 1))
    }
    days.push({ date: dates[i], dow, tasks })
  }
  return days
}

/** All tasks of week n, flat. */
export const weekTasks = (n: number) => buildWeek(weekSpec(n), START_DATE).flatMap((d) => d.tasks)

/** Share of tasks ticked, from 0 to 1. */
export function doneShare(tasks: Task[], done: Record<string, string>) {
  if (!tasks.length) return 0
  return tasks.filter((t) => done[t.id]).length / tasks.length
}

// ------------------------------------------------------------------ Pace: are you on track?

export type Scheduled = { task: Task; date: string; week: number }

/** Every task of the plan with its date, in date order. */
export const planSchedule = (start: string): Scheduled[] =>
  WEEKS.flatMap((w) => buildWeek(w, start).flatMap((d) => d.tasks.map((task) => ({ task, date: d.date, week: w.n }))))

/**
 * Tasks that move the plan forward: learning items, problems and the Friday topic.
 * Light evening tasks, Sunday chores, reviews and weekend extras don't count for pace.
 */
export const isCore = (t: Task) => !!t.problem || (!!t.learn && t.slot !== 'extra' && t.slot !== 'review')

export type Pace = {
  status: 'not-started' | 'behind' | 'on-track' | 'ahead' | 'finished'
  days: number // days behind, days ahead, or days until the start
  overdue: Scheduled[] // open core tasks from before today (oldest first)
  next: Scheduled[] // open core tasks after today (soonest first)
  done: number
  total: number
}

/**
 * Pace by count, so one skipped task doesn't count as "70 days behind":
 * if you had done your N finished core tasks in plan order, you would be at the date of task N+1.
 * That date before today = behind; after tomorrow = ahead.
 */
export function paceOf(done: Record<string, string>, start: string, today: string): Pace {
  const core = planSchedule(start).filter((s) => isCore(s.task))
  const open = core.filter((s) => !done[s.task.id])
  const count = core.length - open.length
  const base = { overdue: open.filter((s) => s.date < today), next: open.filter((s) => s.date > today), done: count, total: core.length }
  if (!open.length) return { ...base, status: 'finished', days: 0 }
  if (today < start) return { ...base, status: 'not-started', days: daysBetween(today, start) }
  const at = core[count].date
  if (at < today) return { ...base, status: 'behind', days: daysBetween(at, today) }
  const ahead = daysBetween(today, at) - 1
  return { ...base, status: ahead > 0 ? 'ahead' : 'on-track', days: Math.max(0, ahead) }
}
