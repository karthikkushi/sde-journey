import { addDays, daysBetween } from './dates'
import type { Scheduled, Task } from './plan'
import { problemBySlug } from './problems'
import type { ProblemReview, Progress } from './progress'

export const REVIEW_LABELS = {
  helped: 'Needed help',
  independent: 'Solved independently',
  recalled: 'Solved again on a later day',
} as const

/**
 * Revision ladder. Needed help -> tomorrow. Solved alone -> in 7 days. Each later clean recall
 * -> 21 days, then 60, then the problem retires: you know it. A fixed gap that never ends would
 * pile up to 8+ redos a day by mid-plan.
 */
const RECALL_DAYS = [21, 60]
export const RETIRED = '9999-12-31'

/** When a solved problem should come back. No attempt logged yet: tomorrow unless you wrote it yourself. */
export function nextReview(p: Progress, slug: string) {
  const solved = p.done[`p:${slug}`]
  const review = p.problemReviews[slug]
  if (!review) return addDays(solved, p.honest[slug] ? 7 : 1)
  if (review.level === 'helped') return addDays(review.date, 1)
  if (review.level === 'independent') return addDays(review.date, 7)
  const gap = RECALL_DAYS[(review.streak ?? 1) - 1]
  return gap ? addDays(review.date, gap) : RETIRED
}

/** Minutes kept for due cards and redos, out of the day's study budget. */
export const reviewMinutes = (budget: number) => (budget <= 25 ? 5 : budget <= 45 ? 10 : 15)

/** Full redos per day: one short slot on weekdays, more at weekends. */
export const redoCap = (dow: number) => (dow === 0 || dow === 6 ? 4 : 2)

export function recordProblemReview(p: Progress, slug: string, level: ProblemReview['level'], today: string) {
  const solved = p.done[`p:${slug}`]
  if (!solved || !problemBySlug(slug)) return false
  if (level === 'recalled' && (p.problemReviews[slug]?.date ?? solved) >= today) return false
  const before = p.problemReviews[slug]
  p.problemReviews[slug] = level === 'recalled'
    ? { level, date: today, streak: before?.level === 'recalled' ? (before.streak ?? 1) + 1 : 1 }
    : { level, date: today }
  return true
}

export function dueProblems(p: Progress, today: string) {
  return Object.entries(p.done)
    .filter(([id]) => id.startsWith('p:') && problemBySlug(id.slice(2)))
    .map(([id]) => ({ slug: id.slice(2), due: nextReview(p, id.slice(2)) }))
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
