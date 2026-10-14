// Turns your saved progress into numbers for the Performance page:
// pace, weekly trends, problem speed by pattern, habits, energy, flashcards and games,
// plus plain-English strengths, weak spots and next actions.
import { HABITS } from '../../content/data/roadmap'
import { addDays, DAY_NAMES, dayOfWeek, daysBetween } from './dates'
import { patternById } from './patterns'
import { isCore, paceOf, planEnd, planSchedule, planStartOf, position, type Pace } from './plan'
import { problemBySlug, tagLink, type Problem } from './problems'
import type { Progress } from './progress'
import { keptDays } from './streak'

const SECTION_NAMES: Record<string, string> = {
  A: 'Python', B: 'Complexity', C: 'Data structures', D: 'Techniques', E: 'SQL', F: 'Backend',
  G: 'CS fundamentals', H: 'Low-level design', I: 'System design', J: 'AI engineering', K: 'Interview skills', L: 'Learning skills',
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const round1 = (x: number) => Math.round(x * 10) / 10

/** Dates from `from` to `to`, both included. */
const daysFrom = (from: string, to: string) => Array.from({ length: Math.max(0, daysBetween(from, to) + 1) }, (_, i) => addDays(from, i))

/** Name of a pattern id, or the raw tag for topics without a pattern page. */
export const tagName = (tag: string) => patternById(tag)?.name ?? tag.replace(/-/g, ' ')

// ------------------------------------------------------------------ Weekly trend

export type WeekPoint = { week: number; tasks: number; focusMin: number; activeDays: number }

/** The last `count` plan weeks up to this one: ticks, focus minutes and study days. */
export function weeklyTrend(p: Progress, today: string, count = 8): WeekPoint[] {
  const start = planStartOf(p)
  const pos = position(today, start)
  const current = pos.status === 'during' ? pos.week : pos.status === 'after' ? Math.max(1, Math.ceil((daysBetween(start, today) + 1) / 7)) : 0
  const kept = keptDays(p)
  const ticks = Object.entries(p.done).filter(([id]) => id.startsWith('w') || id.startsWith('p:')).map(([, d]) => d)
  const out: WeekPoint[] = []
  for (let week = Math.max(1, current - count + 1); week <= current; week++) {
    const first = addDays(start, 7 * (week - 1))
    const dates = daysFrom(first, addDays(first, 6))
    const inWeek = (d: string) => d >= first && d <= dates[6]
    out.push({
      week,
      tasks: ticks.filter(inWeek).length,
      focusMin: dates.reduce((s, d) => s + (p.focus[d] ?? 0), 0),
      activeDays: dates.filter((d) => kept.has(d)).length,
    })
  }
  return out
}

/** For each weekday (Mon first): on how many of those days since the start you studied. */
export function weekdayActivity(p: Progress, today: string) {
  const kept = keptDays(p)
  const rows = [1, 2, 3, 4, 5, 6, 0].map((dow) => ({ dow, name: DAY_NAMES[dow], active: 0, total: 0 }))
  for (const d of daysFrom(planStartOf(p), today)) {
    if (d === today && !kept.has(d)) continue // today is not over yet
    const row = rows.find((r) => r.dow === dayOfWeek(d))!
    row.total++
    if (kept.has(d)) row.active++
  }
  return rows
}

// ------------------------------------------------------------------ Problems

export type TagStat = { tag: string; name: string; solved: number; timed: number; avgMin: number; honestShare: number }

/** Solved problems grouped by pattern, with average solve minutes and "written by me" share. */
export function problemStats(p: Progress) {
  const solved = Object.keys(p.done)
    .filter((id) => id.startsWith('p:'))
    .map((id) => problemBySlug(id.slice(2)))
    .filter((x): x is Problem => !!x)
  const minutes = (x: Problem) => p.solveMinutes[x.slug]
  const timed = solved.filter((x) => minutes(x) > 0)

  const byTag = new Map<string, Problem[]>()
  for (const x of solved) byTag.set(x.tag, [...(byTag.get(x.tag) ?? []), x])
  const tags: TagStat[] = [...byTag].map(([tag, xs]) => {
    const t = xs.filter((x) => minutes(x) > 0)
    return { tag, name: tagName(tag), solved: xs.length, timed: t.length, avgMin: round1(avg(t.map(minutes))), honestShare: xs.filter((x) => p.honest[x.slug]).length / xs.length }
  })
  tags.sort((a, b) => b.solved - a.solved || a.name.localeCompare(b.name))

  const byDifficulty = (['Easy', 'Medium', 'Hard'] as const).map((level) => {
    const xs = solved.filter((x) => x.difficulty === level)
    const t = xs.filter((x) => minutes(x) > 0)
    return { level, solved: xs.length, avgMin: round1(avg(t.map(minutes))), timed: t.length }
  })

  return {
    solved: solved.length,
    timed: timed.length,
    avgMin: round1(avg(timed.map(minutes))),
    honestShare: solved.length ? solved.filter((x) => p.honest[x.slug]).length / solved.length : 0,
    tags,
    byDifficulty,
  }
}

/** Problems solved vs problems planned, at the end of each week so far. */
export function problemsVsPlan(p: Progress, today: string) {
  const start = planStartOf(p)
  const problems = planSchedule(start).filter((s) => s.task.problem)
  const solvedDates = Object.entries(p.done).filter(([id]) => id.startsWith('p:')).map(([, d]) => d)
  const pos = position(today, start)
  const weeks = pos.status === 'during' ? pos.week : pos.status === 'after' ? 65 : 0
  return Array.from({ length: weeks }, (_, i) => {
    const end = i + 1 === weeks ? today : addDays(start, 7 * (i + 1) - 1) // this week: up to today
    return { week: i + 1, planned: problems.filter((s) => s.date <= end).length, solved: solvedDates.filter((d) => d <= end).length }
  })
}

// ------------------------------------------------------------------ Habits, energy, flashcards, games

/** Share of the last `days` days (since the start) on which each habit was ticked. */
export function habitStats(p: Progress, today: string, days = 14) {
  const start = planStartOf(p)
  const from = addDays(today, -(days - 1)) < start ? start : addDays(today, -(days - 1))
  const dates = daysFrom(from, today)
  return {
    days: dates.length,
    habits: HABITS.map((h) => ({ id: h.id, text: h.text, done: dates.filter((d) => p.done[`h:${d}:${h.id}`] || p.done[`m:${d}:${h.id}`]).length })),
    minimumDays: dates.filter((d) => p.done[`m:${d}:dsa`]).length,
  }
}

/** Energy check-ins in the last `days` days, and how much got done on fresh vs tired days. */
export function energyStats(p: Progress, today: string, days = 28) {
  const dates = new Set(daysFrom(addDays(today, -(days - 1)), today))
  const counts = { fresh: 0, tired: 0, low: 0 }
  const tasksOn: Record<string, number> = {}
  for (const [id, d] of Object.entries(p.done)) if (id.startsWith('w') || id.startsWith('p:')) tasksOn[d] = (tasksOn[d] ?? 0) + 1
  const perDay = { fresh: [] as number[], tired: [] as number[], low: [] as number[] }
  for (const [d, e] of Object.entries(p.energy)) {
    if (!dates.has(d)) continue
    counts[e]++
    perDay[e].push(tasksOn[d] ?? 0)
  }
  return { counts, checkIns: counts.fresh + counts.tired + counts.low, tasksPerDay: { fresh: round1(avg(perDay.fresh)), tired: round1(avg(perDay.tired)), low: round1(avg(perDay.low)) } }
}

/** Flashcards by note section: how well they stick (SM-2 ease; below ~2.2 = keeps being forgotten). */
export function cardStats(p: Progress) {
  const bySection = new Map<string, number[]>()
  for (const [id, card] of Object.entries(p.cards)) {
    const s = id[0].toUpperCase()
    bySection.set(s, [...(bySection.get(s) ?? []), card.ease])
  }
  return [...bySection]
    .map(([section, eases]) => ({ section, name: SECTION_NAMES[section] ?? section, cards: eases.length, avgEase: Math.round(avg(eases) * 100) / 100, weak: eases.filter((e) => e < 2.2).length }))
    .sort((a, b) => a.section.localeCompare(b.section))
}

/** Pattern Guess and Big-O answers per topic (saved as games["pattern:hit:<id>"] and friends). */
export function gameStats(p: Progress, game: 'pattern' | 'bigo') {
  const topics = new Map<string, { hit: number; miss: number }>()
  for (const [key, n] of Object.entries(p.games)) {
    const [g, kind, topic] = key.split(':')
    if (g !== game || (kind !== 'hit' && kind !== 'miss') || !topic) continue
    const row = topics.get(topic) ?? { hit: 0, miss: 0 }
    row[kind] += n
    topics.set(topic, row)
  }
  return [...topics].map(([topic, r]) => ({ topic, ...r, accuracy: r.hit / (r.hit + r.miss) })).sort((a, b) => a.accuracy - b.accuracy)
}

// ------------------------------------------------------------------ Pace and finish date

/** When you will finish at your speed over the last 4 weeks (null if nothing was done lately). */
export function projectedEnd(p: Progress, today: string) {
  const start = planStartOf(p)
  const core = planSchedule(start).filter((s) => isCore(s.task))
  const remaining = core.filter((s) => !p.done[s.task.id]).length
  if (!remaining) return today
  const since = addDays(today, -27) < start ? start : addDays(today, -27)
  const recent = core.filter((s) => (p.done[s.task.id] ?? '') >= since).length
  if (!recent) return null
  const perDay = recent / (daysBetween(since, today) + 1)
  return addDays(today, Math.ceil(remaining / perDay))
}

// ------------------------------------------------------------------ Strengths, weak spots, actions

export type Insight = { text: string; to?: string }
export type Insights = { strengths: Insight[]; weaknesses: Insight[]; actions: Insight[] }

/**
 * Plain rules over the numbers above. Each rule needs a minimum amount of data,
 * so a quiet first week doesn't produce scary or silly advice.
 */
export function insights(p: Progress, today: string): Insights {
  const start = planStartOf(p)
  const out: Insights = { strengths: [], weaknesses: [], actions: [] }
  const daysIn = daysBetween(start, today) + 1
  if (daysIn < 1) return out

  // Pace
  const pace: Pace = paceOf(p.done, start, today)
  if (pace.status === 'behind' && pace.days >= 3) {
    out.weaknesses.push({ text: `${pace.days} days behind the plan.` })
    out.actions.push(pace.days >= 7
      ? { text: 'Move the plan 1 week later (Today page or Settings), then follow the new dates.', to: '/settings' }
      : { text: 'Clear the catch-up list on the Today page, a little each day.', to: '/' })
  }
  if (pace.status === 'ahead' && pace.days >= 2) out.strengths.push({ text: `${pace.days} days ahead of the plan.` })
  const end = projectedEnd(p, today)
  if (end && daysIn >= 14 && daysBetween(planEnd(start), end) > 14) {
    out.weaknesses.push({ text: `At your recent speed you would finish around ${end}, later than the plan (${planEnd(start)}).` })
    out.actions.push({ text: 'Add one extra focus block on Saturday or Sunday, or move the plan to a date you can keep.' })
  }

  // Consistency
  const recent = daysFrom(addDays(today, -13) < start ? start : addDays(today, -13), today)
  const kept = keptDays(p)
  const active = recent.filter((d) => kept.has(d)).length
  if (recent.length >= 7) {
    if (active / recent.length >= 0.7) out.strengths.push({ text: `Consistent: studied on ${active} of the last ${recent.length} days.` })
    else if (active / recent.length < 0.45) {
      out.weaknesses.push({ text: `Studied on only ${active} of the last ${recent.length} days.` })
      out.actions.push({ text: 'On busy days, do the minimum day (30 minutes) instead of skipping. It keeps the habit alive.', to: '/notes/l-energy-after-office' })
    }
  }
  const weakDay = weekdayActivity(p, today).filter((r) => r.total >= 2 && r.active / r.total < 0.5).sort((a, b) => a.active / a.total - b.active / b.total)[0]
  if (weakDay) {
    out.weaknesses.push({ text: `${weakDay.name} is your weakest day: studied on ${weakDay.active} of ${weakDay.total}.` })
    out.actions.push({ text: `Plan ${weakDay.name}s as a light day: one easy problem or a redo, 30 minutes.` })
  }

  // Focus trend (this plan week so far vs the whole of last week)
  const trend = weeklyTrend(p, today, 2)
  if (trend.length === 2 && trend[0].focusMin >= 60) {
    const [last, now] = trend
    const elapsed = (daysBetween(addDays(start, 7 * (now.week - 1)), today) + 1) / 7
    if (now.focusMin / elapsed < last.focusMin * 0.6 && elapsed >= 0.5) {
      out.weaknesses.push({ text: `Focus time is down this week (${now.focusMin} min so far vs ${last.focusMin} min last week).` })
    } else if (now.focusMin > last.focusMin) out.strengths.push({ text: `More focus time this week (${now.focusMin} min) than last week (${last.focusMin} min).` })
  }

  // Problems: speed by pattern, honesty, difficulty, plan
  const ps = problemStats(p)
  if (ps.timed >= 5) {
    for (const t of ps.tags.filter((t) => t.timed >= 2)) {
      if (t.avgMin >= ps.avgMin * 1.4) {
        out.weaknesses.push({ text: `Slow on ${t.name}: ${t.avgMin} min per problem vs ${ps.avgMin} min overall.`, to: tagLink(t.tag) })
        out.actions.push({ text: `Re-read ${t.name}, then redo 2 of its problems from a blank page this Sunday.`, to: tagLink(t.tag) })
      } else if (t.avgMin <= ps.avgMin * 0.75) out.strengths.push({ text: `Fast on ${t.name}: ${t.avgMin} min per problem.` })
    }
  } else if (ps.solved >= 5) {
    out.actions.push({ text: 'Type the minutes you took for each solved problem (on the problem’s row). Then this page can find your slow patterns.' })
  }
  const medium = ps.byDifficulty.find((d) => d.level === 'Medium')!
  if (medium.timed >= 3 && medium.avgMin > 45) {
    out.weaknesses.push({ text: `Mediums take ${medium.avgMin} min on average. Interviews give about 25–30 min each.` })
    out.actions.push({ text: 'Do one timed medium a day: 30 minutes, then a hint, then re-solve.', to: '/notes/k-stuck' })
  }
  if (ps.solved >= 5) {
    if (ps.honestShare < 0.7) {
      out.weaknesses.push({ text: `Only ${Math.round(ps.honestShare * 100)}% of solved problems are marked “written by me”.`, to: '/ai-tutor' })
      out.actions.push({ text: 'Re-solve the AI-helped problems from a blank page, and use AI only for hints.', to: '/notes/l-ai-tutor' })
    } else if (ps.honestShare >= 0.9) out.strengths.push({ text: `${Math.round(ps.honestShare * 100)}% of your solutions are your own code.` })
  }
  const plan = problemsVsPlan(p, today).at(-1)
  if (plan && plan.planned >= 5) {
    if (plan.solved < plan.planned * 0.8) out.weaknesses.push({ text: `${plan.solved} problems solved vs ${plan.planned} planned by now.` })
    else if (plan.solved >= plan.planned) out.strengths.push({ text: `Problems on schedule: ${plan.solved} solved (${plan.planned} planned).` })
  }

  // Flashcards
  for (const c of cardStats(p).filter((c) => c.cards >= 3)) {
    if (c.avgEase < 2.2) {
      out.weaknesses.push({ text: `${c.name} flashcards keep slipping (${c.weak} of ${c.cards} cards are hard for you).`, to: '/cards' })
      out.actions.push({ text: `Re-read one ${c.name} note and fill its “Explain it back” boxes from memory.`, to: '/notes' })
    } else if (c.avgEase >= 2.5 && c.cards >= 5) out.strengths.push({ text: `${c.name} flashcards are sticking well.` })
  }

  // Pattern recognition and Big-O (games)
  for (const g of gameStats(p, 'pattern').filter((g) => g.hit + g.miss >= 3 && g.accuracy < 0.6)) {
    out.weaknesses.push({ text: `In Pattern Guess you miss ${tagName(g.topic)} (${g.hit} of ${g.hit + g.miss} right).`, to: `/patterns/${g.topic}` })
  }
  for (const g of gameStats(p, 'bigo').filter((g) => g.hit + g.miss >= 3 && g.accuracy < 0.6)) {
    out.weaknesses.push({ text: `In the Big-O quiz you miss ${g.topic} (${g.hit} of ${g.hit + g.miss} right).`, to: '/notes/b01-big-o' })
  }

  // Habits and energy (only once there is a week of data)
  const hs = habitStats(p, today)
  if (hs.days >= 7) {
    for (const h of hs.habits) {
      const share = h.done / hs.days
      if (share < 0.5) {
        out.weaknesses.push({ text: `“${h.text}” done on ${h.done} of the last ${hs.days} days.` })
        if (h.id === 'sleep') out.actions.push({ text: 'Protect sleep first: a tired brain forgets what it studied.', to: '/notes/l-sleep' })
        if (h.id === 'exercise') out.actions.push({ text: 'Even 10 minutes of exercise counts. Do it right after work.' })
      } else if (share >= 0.8) out.strengths.push({ text: `“${h.text}” kept on ${h.done} of ${hs.days} days.` })
    }
    if (hs.minimumDays >= 5) out.weaknesses.push({ text: `${hs.minimumDays} minimum days in the last ${hs.days} days. Energy is running low.` })
  }
  const es = energyStats(p, today)
  if (es.checkIns >= 5 && (es.counts.tired + es.counts.low) / es.checkIns >= 0.6) {
    out.weaknesses.push({ text: `Tired or very low on ${es.counts.tired + es.counts.low} of ${es.checkIns} check-ins.` })
    out.actions.push({ text: 'Move new, hard topics to weekend mornings and keep weekday evenings light.', to: '/notes/l-energy-after-office' })
  }

  return out
}
