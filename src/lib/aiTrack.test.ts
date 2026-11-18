import { describe, expect, it } from 'vitest'
import { AI_TOPICS, aiWeek, isPaperWeek, phasesForWeek } from '../../content/data/aiTrack'
import { TECHNIQUE_QUESTIONS, TECHNIQUES } from '../../content/data/games'
import { STUDY_INSTRUCTIONS, studyInstructions } from '../../content/data/notebooks'
import { nextPaper, PAPERS } from '../../content/data/papers'
import { WEEKS } from '../../content/data/roadmap'
import { BADGES, earned } from './badges'
import { buildWeek, kindOf, type Task } from './plan'
import { defaultProgress } from './progress'
import { totalXp, XP } from './xp'

const START = '2026-10-14' // a Wednesday: Tue and Thu are days 6 and 1 of each week

describe('AI Engineer track in the week plan', () => {
  it('weeks 1–9 are unchanged: no AI sessions, no paper task', () => {
    for (const n of [1, 5, 9]) {
      const ids = buildWeek(WEEKS[n - 1], START).flatMap((d) => d.tasks.map((t) => t.id))
      expect(ids.some((id) => id.includes(':ai:') || id.endsWith(':paper')), `week ${n}`).toBe(false)
    }
  })
  it('from week 10, Tuesday and Thursday evenings are AI sessions (other evenings unchanged)', () => {
    const days = buildWeek(WEEKS[9], START)
    for (const d of days) {
      const evening = d.tasks.find((t) => t.slot === 's2')
      if (d.dow === 2 || d.dow === 4) expect(evening?.id).toBe(`w10:ai:${d.dow}`)
      else if (d.dow === 1 || d.dow === 3) expect(evening?.id).toBe(`w10:d${d.dow}:s2`)
    }
  })
  it('topics run in order, cover weeks 10–52 without gaps, and paper Sundays are every other week', () => {
    expect(AI_TOPICS[0].from).toBe(10)
    expect(AI_TOPICS.at(-1)!.to).toBe(52)
    for (let i = 1; i < AI_TOPICS.length; i++) expect(AI_TOPICS[i].from).toBe(AI_TOPICS[i - 1].to + 1)
    expect(aiWeek(9)).toBeUndefined()
    expect(aiWeek(10)!.topic).toBe('LLM basics and tokens')
    expect([10, 11, 12, 20].map(isPaperWeek)).toEqual([true, false, true, true])
    expect(buildWeek(WEEKS[9], START).flatMap((d) => d.tasks).some((t) => t.id === 'w10:paper')).toBe(true)
    expect(phasesForWeek(40).map((p) => p.n)).toEqual([3, 4])
  })
})

describe('task labels', () => {
  const t = (task: Partial<Task>): Task => ({ id: 'w1:l0', text: 'x', slot: 's1', ...task })
  it('labels DSA, AI, Paper, SQL and ML, and leaves other tasks unlabelled', () => {
    expect(kindOf(t({ problem: 'two-sum', id: 'p:two-sum' }))).toBe('DSA')
    expect(kindOf(t({ id: 'w10:ai:2' }))).toBe('AI')
    expect(kindOf(t({ id: 'w10:paper' }))).toBe('Paper')
    expect(kindOf(t({ learn: { text: 'SQL', note: 'e-joins' } }))).toBe('SQL')
    expect(kindOf(t({ learn: { text: 'ML', note: 'm-loss' } }))).toBe('ML')
    expect(kindOf(t({ slot: 'extra', learn: { text: 'Update LinkedIn' } }))).toBeUndefined()
  })
})

describe('papers, badges and XP', () => {
  it('next paper is the first one not done', () => {
    expect(nextPaper({})!.id).toBe('attention')
    expect(nextPaper({ attention: { status: 'Done' } })!.id).toBe('gpt3')
    expect(nextPaper(Object.fromEntries(PAPERS.map((p) => [p.id, { status: 'Done' }])))).toBeUndefined()
  })
  it('paper steps earn XP and finished papers earn the reader badges', () => {
    const p = defaultProgress()
    p.papers = { attention: { status: 'Done', steps: ['abstract', 'figures', 'conclusion', 'method', 'write'] } }
    expect(totalXp(p)).toBe(5 * XP.paperStep)
    expect(earned(BADGES.find((b) => b.id === 'paper1')!, p)).toBe(true)
    expect(earned(BADGES.find((b) => b.id === 'paper6')!, p)).toBe(false)
    p.done['proj:ai-rag:3'] = '2027-03-01'
    expect(earned(BADGES.find((b) => b.id === 'aiFirstRag')!, p)).toBe(true)
  })
})

describe('quiz and study instructions', () => {
  it('every "Which technique?" answer is one of the four options', () => {
    for (const q of TECHNIQUE_QUESTIONS) expect(TECHNIQUES).toContain(q.answer)
    expect(new Set(TECHNIQUE_QUESTIONS.map((q) => q.answer)).size).toBe(4)
  })
  it('the public text has no name or city; the private line is added from Settings', () => {
    expect(STUDY_INSTRUCTIONS.startsWith('I am {about} learning')).toBe(true) // the personal line is a placeholder only
    expect(studyInstructions('')).toMatch(/^I am a junior developer learning/)
    expect(studyInstructions('Asha, a developer in Pune,')).toMatch(/^I am Asha, a developer in Pune, learning/)
  })
})
