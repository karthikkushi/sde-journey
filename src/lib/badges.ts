// Badges are worked out from your progress (never stored), like XP.
import { PROJECTS } from '../../content/data/projects'
import { problemBySlug } from './problems'
import type { Progress } from './progress'
import { longestStreak } from './streak'

export type Badge = { id: string; name: string; how: string; progress: (p: Progress) => [number, number] }

const solvedSlugs = (p: Progress) => Object.keys(p.done).filter((id) => id.startsWith('p:')).map((id) => id.slice(2))

export const BADGES: Badge[] = [
  { id: 'streak7', name: 'Seven in a row', how: 'Study 7 days in a row', progress: (p) => [Math.min(longestStreak(p), 7), 7] },
  { id: 'p50', name: 'Fifty solved', how: 'Solve 50 problems', progress: (p) => [Math.min(solvedSlugs(p).length, 50), 50] },
  { id: 'p150', name: 'NeetCode size', how: 'Solve 150 problems', progress: (p) => [Math.min(solvedSlugs(p).length, 150), 150] },
  {
    id: 'fastMedium',
    name: 'Medium in 30',
    how: 'Solve a medium problem in under 30 minutes (log the minutes on the problem)',
    progress: (p) => [Object.entries(p.solveMinutes).some(([slug, m]) => m > 0 && m < 30 && p.done[`p:${slug}`] && problemBySlug(slug)?.difficulty === 'Medium') ? 1 : 0, 1],
  },
  {
    id: 'deployed',
    name: 'It is live',
    how: 'Deploy your first project',
    progress: (p) => [PROJECTS.some((pr) => pr.deployStep !== undefined && p.done[`proj:${pr.id}:${pr.deployStep}`]) ? 1 : 0, 1],
  },
  { id: 'mock1', name: 'First mock', how: 'Log your first mock interview', progress: (p) => [Math.min(p.mocks.length, 1), 1] },
  {
    id: 'focus100',
    name: '100 focus hours',
    how: 'Reach 100 hours in focus mode',
    progress: (p) => [Math.min(Math.floor(Object.values(p.focus).reduce((a, b) => a + b, 0) / 60), 100), 100],
  },
]

export const earned = (b: Badge, p: Progress) => {
  const [have, need] = b.progress(p)
  return have >= need
}
