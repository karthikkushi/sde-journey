// Everything you do in the app is saved in ONE object, under one localStorage key.
// Export = download this object as JSON. Import = upload it back.
import { START_DATE } from '../../content/data/roadmap'
import { addDays } from './dates'

export type Energy = 'fresh' | 'tired' | 'low'

/** A flashcard's spaced-repetition state (SM-2). */
export type Card = { ease: number; interval: number; reps: number; due: string }

export type Mock = { date: string; kind: string; notes: string }

export type Progress = {
  version: 1
  startDate: string // day 1 of YOUR plan ('' until the first visit, then that day)
  done: Record<string, string> // task id -> date it was ticked
  energy: Record<string, Energy> // date -> energy check-in
  freezes: Record<string, true> // dates saved by a streak freeze
  focus: Record<string, number> // date -> focus minutes
  focusBlocks: Record<string, number> // date -> finished focus blocks
  texts: Record<string, string> // every textbox: my notes, answers, stories, distraction pad...
  notesDone: Record<string, string> // note id -> date finished
  honest: Record<string, boolean> // problem slug -> "I wrote this myself"
  solveMinutes: Record<string, number> // problem slug -> minutes it took
  cards: Record<string, Card> // flashcard id -> schedule
  cardReviews: number
  weekly: Record<string, Record<string, string>> // week number -> review answers
  mocks: Mock[]
  games: Record<string, number> // game id -> best score
}

export const defaultProgress = (): Progress => ({
  version: 1,
  startDate: '',
  done: {},
  energy: {},
  freezes: {},
  focus: {},
  focusBlocks: {},
  texts: {},
  notesDone: {},
  honest: {},
  solveMinutes: {},
  cards: {},
  cardReviews: 0,
  weekly: {},
  mocks: [],
  games: {},
})

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Check an imported (or stored) object and turn it into a safe Progress.
 * Each field must have the same shape as the default, or the default is kept.
 * Throws if the file is clearly not a backup from this app.
 */
export function parseProgress(raw: unknown): Progress {
  if (!isObject(raw) || raw.version !== 1) throw new Error('This file is not an SDE Journey backup.')
  const result = defaultProgress()
  const out = result as Record<string, unknown>
  for (const [key, fallback] of Object.entries(result)) {
    const value = raw[key]
    const sameShape =
      Array.isArray(fallback) ? Array.isArray(value) : isObject(fallback) ? isObject(value) : typeof value === typeof fallback
    if (sameShape) out[key] = value
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.startDate)) result.startDate = ''
  // Older backups had a fixed start (14 Oct 2026) moved by "shiftWeeks". Keep their dates.
  if (!result.startDate && Object.keys(result.done).length) {
    const shift = typeof raw.shiftWeeks === 'number' ? raw.shiftWeeks : 0
    result.startDate = addDays(START_DATE, 7 * shift)
  }
  return result
}

const KEY = 'sdej-progress'

export function loadProgress(): Progress {
  try {
    const text = localStorage.getItem(KEY)
    return text ? parseProgress(JSON.parse(text)) : defaultProgress()
  } catch {
    return defaultProgress() // broken or blocked storage: start fresh instead of crashing
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
    return true
  } catch {
    return false // storage full or blocked (private mode)
  }
}

export const STORAGE_KEY = KEY

/** File name for a backup made on `date`. */
export const backupFileName = (date: string) => `sde-journey-progress-${date}.json`
