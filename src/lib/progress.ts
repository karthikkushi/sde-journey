// Everything you do in the app is saved in ONE object, under one localStorage key.
// Export = download this object as JSON. Import = upload it back.
import { START_DATE } from '../../content/data/roadmap'
import { addDays } from './dates'

export type Energy = 'fresh' | 'tired' | 'low'

/** A flashcard's spaced-repetition state (SM-2). */
export type Card = { ease: number; interval: number; reps: number; due: string }

export type Mock = { date: string; kind: string; notes: string }
export const JOB_STATUSES = ['To apply', 'Applied', 'Online test', 'Interview', 'Offer', 'Rejected'] as const
/** Where an application came from, so you can see which channel gets interviews. */
export const JOB_CHANNELS = ['Referral', 'Recruiter came to me', 'Applied online', 'Cold message'] as const
/** A job application. `date` = the day it reached its current status. */
export type Job = { company: string; role: string; link: string; status: (typeof JOB_STATUSES)[number]; date: string; channel: (typeof JOB_CHANNELS)[number] }
/** Reading progress for one paper on the Papers page. `steps` = checklist items ticked. */
export const PAPER_STATUSES = ['Not started', 'Reading', 'Done'] as const
export type PaperState = { status: (typeof PAPER_STATUSES)[number]; steps: string[] }
export type ProblemReview = { level: 'helped' | 'independent' | 'recalled'; date: string; streak?: number } // streak: clean recalls in a row

/** Data version. 1 = before the AI Engineer track. 2 = adds papers and notebook links (see migrate below). */
export const CURRENT_VERSION = 2

export type Progress = {
  version: 2
  startDate: string // day 1 of YOUR plan (today, on every visit, until the first plan task is ticked)
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
  cardLog: string[] // every flashcard answer, "date|card id|grade" (see srs.ts)
  weekly: Record<string, Record<string, string>> // week number -> review answers
  mocks: Mock[]
  jobs: Job[] // job applications, newest first
  games: Record<string, number> // game id -> best score
  problemReviews: Record<string, ProblemReview>
  lastBackup: string // date a backup download was requested
  papers: Record<string, PaperState> // paper id -> status and checklist ("My 5 lines" live in texts)
  links: Record<string, string> // study notebook links by subject, plus "chat" (only https links)
}

export const defaultProgress = (): Progress => ({
  version: 2,
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
  cardLog: [],
  weekly: {},
  mocks: [],
  jobs: [],
  games: {},
  problemReviews: {},
  lastBackup: '',
  papers: {},
  links: {},
})

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v

/**
 * Check an imported (or stored) object and turn it into a safe Progress.
 * Each field must have the same shape as the default, or the default is kept.
 * Throws if the file is clearly not a backup from this app.
 */
/**
 * Upgrades for older saved data, one version at a time. Each step only ADDS what the next
 * version needs; nothing is ever dropped. Add a new line here whenever the shape changes.
 */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {
  1: (raw) => ({ ...raw, version: 2, papers: raw.papers ?? {}, links: raw.links ?? {} }), // v1 -> v2: AI track fields start empty
}

/** Bring any older saved object up to CURRENT_VERSION. Newer or unknown versions are left as they are. */
export function migrate(raw: Record<string, unknown>) {
  let current = raw
  while (typeof current.version === 'number' && current.version < CURRENT_VERSION && MIGRATIONS[current.version]) {
    current = MIGRATIONS[current.version](current)
  }
  return current
}

export function parseProgress(input: unknown): Progress {
  if (!isObject(input)) throw new Error('This file is not an SDE Journey backup.')
  const raw = migrate(input)
  if (raw.version !== CURRENT_VERSION) throw new Error('This file is not an SDE Journey backup.')
  const result = defaultProgress()
  const out = result as Record<string, unknown>
  for (const [key, fallback] of Object.entries(result)) {
    const value = raw[key]
    const sameShape =
      Array.isArray(fallback) ? Array.isArray(value) : isObject(fallback) ? isObject(value) : typeof value === typeof fallback
    if (sameShape) out[key] = value
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.startDate)) result.startDate = ''
  if (!isDate(result.lastBackup)) result.lastBackup = ''
  result.problemReviews = Object.fromEntries(Object.entries(result.problemReviews).filter(([, value]) =>
    isObject(value) && ['helped', 'independent', 'recalled'].includes(String(value.level)) && isDate(value.date) &&
    (value.streak === undefined || (Number.isInteger(value.streak) && Number(value.streak) >= 1)),
  ))
  result.cardLog = result.cardLog.filter((l) => typeof l === 'string' && l.length < 200)
  // Papers: known statuses only. Links: only https web links (never javascript: or data:).
  result.papers = Object.fromEntries(Object.entries(result.papers).filter(([, v]) =>
    isObject(v) && PAPER_STATUSES.includes(v.status as PaperState['status']) && Array.isArray(v.steps) && v.steps.every((x) => typeof x === 'string')))
  result.links = Object.fromEntries(Object.entries(result.links).filter(([, v]) => typeof v === 'string' && /^https:\/\/\S+$/i.test(v)))
  // Keep only well-formed jobs, and only web links (a backup file could carry a javascript: link).
  result.jobs = (result.jobs as unknown[]).filter((j): j is Job => isObject(j) &&
    typeof j.company === 'string' && typeof j.role === 'string' && isDate(j.date) &&
    JOB_STATUSES.includes(j.status as Job['status']) &&
    typeof j.link === 'string' && (!j.link || /^https?:\/\//i.test(j.link)))
    .map((j) => (JOB_CHANNELS.includes(j.channel) ? j : { ...j, channel: 'Applied online' })) // logged before channels existed
  // Older backups had a fixed start (14 Oct 2026) moved by "shiftWeeks". Keep their dates.
  if (!result.startDate && Object.keys(result.done).length) {
    const shift = typeof raw.shiftWeeks === 'number' ? raw.shiftWeeks : 0
    result.startDate = addDays(START_DATE, 7 * shift)
  }
  return result
}

const KEY = 'sdej-progress'

// Stored data this build can't read (corrupt, or saved by a newer version): never save over it.
let unreadable = false
// Fields saved by a newer version that this build doesn't know: carried along on every save.
let unknown: Record<string, unknown> = {}

export const storageUnreadable = () => unreadable

/** Import or Reset: the user chose to replace what is stored, so stop protecting it. */
export function allowOverwrite() {
  unreadable = false
  unknown = {}
}

export function loadProgress(): Progress {
  unreadable = false
  unknown = {}
  let text: string | null = null
  try {
    text = localStorage.getItem(KEY)
    if (!text) return defaultProgress()
    const raw = JSON.parse(text)
    const p = parseProgress(raw)
    unknown = Object.fromEntries(Object.entries(raw).filter(([k]) => !(k in p)))
    return p
  } catch {
    unreadable = text !== null // blocked storage has nothing to protect; unreadable data does
    return defaultProgress() // start fresh in memory instead of crashing
  }
}

export function saveProgress(p: Progress) {
  if (unreadable) return false
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...unknown, ...p }))
    return true
  } catch {
    return false // storage full or blocked (private mode)
  }
}

export const STORAGE_KEY = KEY

/** File name for a backup made on `date`. */
export const backupFileName = (date: string) => `sde-journey-progress-${date}.json`
