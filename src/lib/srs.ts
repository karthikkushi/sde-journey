// Spaced repetition with the SM-2 rules (the method behind Anki).
// Easy cards come back after longer and longer gaps. Hard cards come back soon.
import { addDays } from './dates'
import type { Flashcard } from './notes'
import type { Card, Progress } from './progress'

export type Grade = 'again' | 'hard' | 'good' | 'easy'

// SM-2 grades from 0 to 5. Below 3 means "I did not remember".
const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 }

/** The new schedule for a card after you answer it today. */
export function schedule(card: Card | undefined, grade: Grade, today: string): Card {
  const q = QUALITY[grade]
  let { ease, interval, reps } = card ?? { ease: 2.5, interval: 0, reps: 0 }

  if (q < 3) {
    reps = 0 // forgot: start again tomorrow
    interval = 1
  } else {
    interval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ease)
    reps += 1
  }
  // Ease goes up for easy answers and down for hard ones, but never below 1.3.
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  return { ease: Math.round(ease * 100) / 100, interval, reps, due: addDays(today, interval) }
}

/**
 * Cards to review today: cards already learning whose day has come,
 * plus new cards from notes you have finished (you only get cards for what you read).
 */
export function dueCards(all: Flashcard[], p: Progress, today: string) {
  const due = all.filter((c) => p.cards[c.id] && p.cards[c.id].due <= today).sort((a, b) => p.cards[a.id].due.localeCompare(p.cards[b.id].due))
  const fresh = all.filter((c) => !p.cards[c.id] && p.notesDone[c.noteId])
  return [...due, ...fresh]
}
