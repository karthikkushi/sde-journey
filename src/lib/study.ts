import { addDays, daysBetween } from './dates'
import type { Scheduled, Task } from './plan'
import { problemBySlug } from './problems'
import type { ProblemReview, Progress } from './progress'

export const REVIEW_LABELS = {
  helped: 'Needed help',
  independent: 'Solved independently',
  recalled: 'Solved again on a later day',
} as const

const REVIEW_DAYS = { helped: 1, independent: 7, recalled: 30 }

export function recordProblemReview(p: Progress, slug: string, level: ProblemReview['level'], today: string) {
  const solved = p.done[`p:${slug}`]
  if (!solved || !problemBySlug(slug)) return false
  if (level === 'recalled' && (p.problemReviews[slug]?.date ?? solved) >= today) return false
  p.problemReviews[slug] = { level, date: today }
  return true
}

export function dueProblems(p: Progress, today: string) {
  return Object.entries(p.done)
    .filter(([id]) => id.startsWith('p:') && problemBySlug(id.slice(2)))
    .map(([id, solved]) => {
      const slug = id.slice(2)
      const review = p.problemReviews[slug]
      return { slug, due: addDays(review?.date ?? solved, review ? REVIEW_DAYS[review.level] : 7) }
    })
    .filter(({ due }) => due <= today)
    .sort((a, b) => a.due.localeCompare(b.due) || a.slug.localeCompare(b.slug))
    .map(({ slug }) => slug)
}

// shortcut: these are planning estimates; replace with measured task durations after real study sessions.
export function taskMinutes(task: Task) {
  if (task.problem) {
    const difficulty = problemBySlug(task.problem)?.difficulty
    return difficulty === 'Easy' ? 25 : difficulty === 'Hard' ? 60 : 45
  }
  return task.learn?.note ? 30 : 45
}

/**
 * Catch-up only looks back 2 weeks. A task skipped months ago would otherwise sit at the top
 * every day; older unfinished tasks stay on their roadmap weeks.
 */
export const CATCH_UP_DAYS = 14
export const recentOverdue = (overdue: Scheduled[], today: string) =>
  overdue.filter((s) => s.date >= addDays(today, -CATCH_UP_DAYS))

/** Keep today's work first; suggest at most one overdue task that fits the spare time. */
export function catchUpTask(overdue: Scheduled[], budget: number, spent: number, remaining: number) {
  return overdue.find(({ task }) => taskMinutes(task) <= Math.max(0, budget - spent - remaining))
}

export const backupDue = (lastBackup: string, today: string) => !lastBackup || daysBetween(lastBackup, today) >= 7

export function studyBudget(p: Progress, today: string) {
  const saved = Number(p.texts[`study-budget:${today}`])
  return [25, 45, 90, 180].includes(saved) ? saved : 45
}
