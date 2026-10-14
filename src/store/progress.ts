import { useSyncExternalStore } from 'react'
import { celebrate, celebrationsFor } from '../lib/celebrate'
import { todayIST } from '../lib/dates'
import { loadProgress, saveProgress, STORAGE_KEY, type Progress } from '../lib/progress'

// A tiny global store. Every page reads progress with useProgress(),
// and changes it with update(). Each change is saved to localStorage at once.
let state: Progress = loadProgress()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Read progress inside a component. The component re-renders when it changes. */
export const useProgress = () => useSyncExternalStore(subscribe, () => state)

/** Read progress outside React (for example in a timer callback). */
export const getProgress = () => state

/**
 * Change progress. You get a copy ("draft") to edit freely:
 *   update((p) => { p.shiftWeeks = 2 })
 */
export function update(change: (draft: Progress) => void) {
  const draft = structuredClone(state)
  change(draft)
  state = draft
  saveProgress(state)
  emit()
}

/** Replace everything (used by Import and Reset). */
export function replaceProgress(p: Progress) {
  state = p
  saveProgress(state)
  emit()
}

/** Tick or un-tick a task. The tick remembers today's date (for streaks). */
export function toggleDone(id: string) {
  const before = state.done
  update((p) => {
    if (p.done[id]) delete p.done[id]
    else p.done[id] = todayIST()
  })
  // Finished a whole week (or month, or phase)? Celebrate.
  const wins = celebrationsFor(id, before, state.done)
  if (wins.length) celebrate(wins.join(' '))
}

/** Add focus minutes to today. `block` = a full focus block was finished. */
export function logFocus(minutes: number, block: boolean) {
  if (minutes <= 0 && !block) return
  const today = todayIST()
  update((p) => {
    p.focus[today] = (p.focus[today] ?? 0) + minutes
    if (block) p.focusBlocks[today] = (p.focusBlocks[today] ?? 0) + 1
  })
}

/** Save a textbox value. Empty text removes the key, keeping the backup small. */
export function setText(key: string, value: string) {
  update((p) => {
    if (value) p.texts[key] = value
    else delete p.texts[key]
  })
}

// If the app is open in two tabs, keep them in step.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      state = loadProgress()
      emit()
    }
  })
}
