import type { Progress } from './progress'

// XP is always worked out from your saved progress, never stored.
// So un-ticking a task takes its XP back, and XP can never get out of sync.
export const XP = {
  task: 10, // roadmap task
  habit: 5, // daily habit or minimum-day item
  problem: 20, // LeetCode problem solved
  focusBlock: 15,
  note: 25, // note finished
  card: 2, // one flashcard reviewed
  weekly: 30, // weekly review saved
  mock: 50, // mock interview logged
  recall: 15, // a past problem solved again from a blank page: the work that makes skills stick
  honest: 5, // an honest "Needed help" log: noticing a gap is progress too
}

export function totalXp(p: Progress) {
  let xp = 0
  for (const id of Object.keys(p.done)) {
    if (id.startsWith('p:')) xp += XP.problem
    else if (id.startsWith('h:') || id.startsWith('m:')) xp += XP.habit
    else xp += XP.task
  }
  for (const n of Object.values(p.focusBlocks)) xp += n * XP.focusBlock
  xp += Object.keys(p.notesDone).length * XP.note
  xp += p.cardReviews * XP.card
  xp += Object.keys(p.weekly).length * XP.weekly
  xp += p.mocks.length * XP.mock
  for (const r of Object.values(p.problemReviews)) xp += r.level === 'recalled' ? XP.recall * (r.streak ?? 1) : r.level === 'helped' ? XP.honest : 0
  return xp
}

// Level names describe effort, not readiness: XP counts activity, and only mocks and
// timed solves show whether you are ready. Thresholds assume roughly 550 XP per week.
export const LEVELS = [
  { name: 'Beginner', xp: 0 },
  { name: 'Python Explorer', xp: 800 },
  { name: 'Array Rookie', xp: 3000 },
  { name: 'Pattern Hunter', xp: 5000 },
  { name: 'Graph Ranger', xp: 11000 },
  { name: 'DP Warrior', xp: 14000 },
  { name: 'Backend Builder', xp: 17000 },
  { name: 'System Designer', xp: 21000 },
  { name: 'Interview Trainer', xp: 26000 },
  { name: 'Long Hauler', xp: 34000 },
]

export function levelOf(xp: number) {
  let index = 0
  while (index + 1 < LEVELS.length && xp >= LEVELS[index + 1].xp) index++
  const current = LEVELS[index]
  const next = LEVELS[index + 1]
  return {
    index,
    name: current.name,
    next,
    /** 0..1 progress towards the next level (1 at max level). */
    share: next ? (xp - current.xp) / (next.xp - current.xp) : 1,
    toNext: next ? next.xp - xp : 0,
  }
}
