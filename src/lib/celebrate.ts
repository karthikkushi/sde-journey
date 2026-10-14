// Works out what was just completed (a week, a month, a phase) when a task is ticked.
import { PHASES, TOTAL_WEEKS, WEEKS } from '../../content/data/roadmap'
import { buildWeek, monthOfWeek } from './plan'

// task id -> ids of all tasks in the same week, built once.
const weekIds: string[][] = WEEKS.map((w) => buildWeek(w, 0).flatMap((d) => d.tasks.map((t) => t.id)))
const weekOfTask = new Map<string, number>()
weekIds.forEach((ids, i) => ids.forEach((id) => weekOfTask.set(id, i + 1)))

const weekComplete = (n: number, done: Record<string, string>) => weekIds[n - 1].every((id) => done[id])
const allComplete = (weeks: number[], done: Record<string, string>) => weeks.every((n) => weekComplete(n, done))
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

/** Messages for everything that became complete because `id` was just ticked. */
export function celebrationsFor(id: string, before: Record<string, string>, after: Record<string, string>): string[] {
  const n = weekOfTask.get(id)
  if (!n || before[id] || !after[id] || !weekComplete(n, after) || weekComplete(n, before)) return []
  const out = [`Week ${n} complete!`]
  const monthWeeks = range(1, TOTAL_WEEKS).filter((w) => monthOfWeek(w) === monthOfWeek(n))
  if (allComplete(monthWeeks, after)) out.push(`Month ${monthOfWeek(n)} complete!`)
  for (const ph of PHASES) {
    if (n >= ph.from && n <= ph.to && allComplete(range(ph.from, ph.to), after)) out.push(`Phase ${ph.n} (${ph.name}) complete!`)
  }
  return out
}

/** Ask the confetti layer to celebrate. */
export function celebrate(message: string) {
  window.dispatchEvent(new CustomEvent('sdej-celebrate', { detail: message }))
}

/** All task ids of week n (used by tests). */
export const tasksOfWeek = (n: number) => weekIds[n - 1]
