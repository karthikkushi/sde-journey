// Focus timer rules, as plain functions (easy to test).
// The timer stores "ends at" timestamps instead of counting seconds,
// so it stays correct even if the phone locks or the page reloads.

export type Preset = { id: string; focus: number; rest: number } // minutes

export const PRESETS: Preset[] = [
  { id: '50/10', focus: 50, rest: 10 },
  { id: '45/10', focus: 45, rest: 10 },
  { id: '25/5', focus: 25, rest: 5 },
]
export const DEFAULT_PRESET = '45/10'
export const LONG_BREAK = 20 // minutes
export const BLOCKS_PER_ROUND = 3 // long break after every 3 focus blocks

export const presetById = (id: string) => PRESETS.find((p) => p.id === id) ?? PRESETS[1]

export type Session = {
  phase: 'focus' | 'break' | 'ready' // ready = between blocks
  preset: string
  endsAt: number // ms timestamp when this phase ends
  pausedLeft?: number // ms left, only while paused
  blocks: number // focus blocks finished in this sitting
  task: string
  taskId?: string // roadmap task id, if the task came from the plan
  activity: number // which break activity to show
}

/** Break length after finishing `blocksDone` blocks: long break after every 3rd block. */
export const breakMinutes = (blocksDone: number, preset: Preset) =>
  blocksDone > 0 && blocksDone % BLOCKS_PER_ROUND === 0 ? LONG_BREAK : preset.rest

/** Milliseconds left in the current phase. */
export const msLeft = (s: Session, now: number) => s.pausedLeft ?? Math.max(0, s.endsAt - now)

/** Length of the current phase in ms (for the progress ring). */
export const phaseLength = (s: Session) => {
  const p = presetById(s.preset)
  return (s.phase === 'focus' ? p.focus : breakMinutes(s.blocks, p)) * 60_000
}

/** 125000 -> "02:05" */
export function clock(ms: number) {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Minutes of focus done so far in a block that was stopped early. */
export const minutesSpent = (s: Session, now: number) => Math.floor((phaseLength(s) - msLeft(s, now)) / 60_000)

/** Heatmap colour level 0..4 from minutes in a day. 45 = one block. */
export const heatLevel = (min: number) => (min <= 0 ? 0 : min < 45 ? 1 : min < 90 ? 2 : min < 135 ? 3 : 4)

export const BREAK_ACTIVITIES = [
  { title: 'Drink water', text: 'Drink a full glass of water. Refill your bottle.' },
  { title: 'Stretch legs and calves', text: 'Stand up. Stretch each calf against a wall for 30 seconds. Then touch your toes, slowly.' },
  { title: 'Walk for 5 minutes', text: 'Walk around the room or the corridor. Let your mind wander.' },
  { title: '20-20-20 eye rule', text: 'Look at something 20 feet away for 20 seconds. Do it 3 times. Blink often.' },
  { title: 'Deep breathing', text: 'Breathe in for 4 counts, hold for 4, out for 4, hold for 4. Repeat 5 times.' },
  { title: 'Shoulders and neck', text: 'Roll your shoulders back 10 times. Tilt your head gently to each side.' },
]

// --- Saving the running session (separate from progress: it is only temporary) ---
const KEY = 'sdej-focus'

export function loadSession(): Session | null {
  try {
    const text = localStorage.getItem(KEY)
    return text ? (JSON.parse(text) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s))
    else localStorage.removeItem(KEY)
  } catch {
    // storage blocked: the timer still works until the page closes
  }
}
