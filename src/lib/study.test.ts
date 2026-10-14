import { describe, expect, it } from 'vitest'
import { defaultProgress, parseProgress } from './progress'
import { backupDue, catchUpTask, dueProblems, recentOverdue, recordProblemReview, studyBudget, taskMinutes } from './study'
import type { Scheduled, Task } from './plan'

describe('problem revision', () => {
  it('brings helped problems back tomorrow, independent solves after a week, and later recall after a month', () => {
    const p = defaultProgress()
    p.done['p:two-sum'] = '2026-10-14'
    recordProblemReview(p, 'two-sum', 'helped', '2026-10-14')
    expect(dueProblems(p, '2026-10-14')).toEqual([])
    expect(dueProblems(p, '2026-10-15')).toEqual(['two-sum'])
    recordProblemReview(p, 'two-sum', 'independent', '2026-10-15')
    expect(dueProblems(p, '2026-10-21')).toEqual([])
    expect(dueProblems(p, '2026-10-22')).toEqual(['two-sum'])
    recordProblemReview(p, 'two-sum', 'recalled', '2026-10-22')
    expect(dueProblems(p, '2026-11-20')).toEqual([])
    expect(dueProblems(p, '2026-11-21')).toEqual(['two-sum'])
  })
  it('does not allow same-day recall or revision of an unsolved problem', () => {
    const p = defaultProgress()
    expect(recordProblemReview(p, 'two-sum', 'independent', '2026-10-14')).toBe(false)
    p.done['p:two-sum'] = '2026-10-14'
    expect(recordProblemReview(p, 'two-sum', 'recalled', '2026-10-14')).toBe(false)
    expect(p.problemReviews).toEqual({})
  })
  it('includes old unassessed solves but excludes un-ticked and unknown problems', () => {
    const p = defaultProgress()
    p.done = { 'p:two-sum': '2026-10-01', 'p:unknown': '2026-10-01' }
    expect(dueProblems(p, '2026-10-14')).toEqual(['two-sum'])
    delete p.done['p:two-sum']
    expect(dueProblems(p, '2026-10-14')).toEqual([])
  })
  it('keeps old backups compatible and validates new fields', () => {
    expect(parseProgress({ version: 1 }).problemReviews).toEqual({})
    const p = parseProgress({ version: 1, lastBackup: 'not a date', problemReviews: {
      'two-sum': { level: 'helped', date: '2026-10-14' },
      broken: { level: 'magic', date: 'tomorrow' },
      invalidDate: { level: 'helped', date: '2026-02-31' },
      empty: null,
    } })
    expect(p.problemReviews).toEqual({ 'two-sum': { level: 'helped', date: '2026-10-14' } })
    expect(p.lastBackup).toBe('')
    expect(parseProgress(JSON.parse(JSON.stringify(p)))).toEqual(p)
  })
})

describe('daily workload and backups', () => {
  it('uses today’s budget and ignores invalid or previous-day values', () => {
    const p = defaultProgress()
    p.texts = { 'study-budget:2026-10-14': '25', 'study-budget:2026-10-15': '-1' }
    expect(studyBudget(p, '2026-10-14')).toBe(25)
    expect(studyBudget(p, '2026-10-15')).toBe(45)
    expect(studyBudget(p, '2026-10-16')).toBe(45)
  })
  const task: Task = { id: 'p:two-sum', text: 'Two Sum', problem: 'two-sum', slot: 's1' }
  const overdue: Scheduled[] = [{ task, date: '2026-10-01', week: 1 }]
  it('offers catch-up only when today’s remaining main work and logged time leave room', () => {
    expect(taskMinutes(task)).toBe(25)
    expect(catchUpTask(overdue, 60, 10, 30)).toBeUndefined()
    expect(catchUpTask(overdue, 60, 5, 30)).toEqual(overdue[0])
    expect(catchUpTask(overdue, 25, 30, 0)).toBeUndefined()
    expect(catchUpTask([], 90, 0, 0)).toBeUndefined()
  })
  it('catch-up looks back 2 weeks only, so a task skipped long ago is not suggested every day', () => {
    const old: Scheduled = { task: { id: 'w1:l0', text: 'Old video', slot: 's1', learn: { text: 'Old video' } }, date: '2026-08-05', week: 1 }
    const recent: Scheduled = { task, date: '2026-10-10', week: 9 }
    const kept = recentOverdue([old, recent], '2026-10-14')
    expect(kept).toEqual([recent])
    expect(catchUpTask(kept, 180, 0, 0)).toEqual(recent)
    expect(recentOverdue([{ ...recent, date: '2026-09-30' }], '2026-10-14')).toHaveLength(1) // exactly 14 days back
  })
  it('reminds after seven days and handles never-exported progress', () => {
    expect(backupDue('', '2026-10-14')).toBe(true)
    expect(backupDue('2026-10-08', '2026-10-14')).toBe(false)
    expect(backupDue('2026-10-07', '2026-10-14')).toBe(true)
  })
})
