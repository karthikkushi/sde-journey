// All dates in the app are plain strings like '2026-10-14', in India time.
// Strings are easy to store, compare and use as keys.

const IST = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Today's date in India, as 'YYYY-MM-DD' (en-CA formats dates this way). */
export const todayIST = (now = new Date()) => IST.format(now)

/** Minutes since midnight in India (0 to 1439). Used by the timetable. */
export function minutesNowIST(now = new Date()) {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(now)
    .split(':')
  return Number(h) * 60 + Number(m)
}

// Turn 'YYYY-MM-DD' into a UTC timestamp, so day maths never hits daylight-saving surprises.
const toUTC = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)))
const DAY_MS = 86_400_000

export const addDays = (d: string, n: number) => new Date(toUTC(d) + n * DAY_MS).toISOString().slice(0, 10)

/** Whole days from a to b (b - a). */
export const daysBetween = (a: string, b: string) => Math.round((toUTC(b) - toUTC(a)) / DAY_MS)

/** 0 = Sunday, 1 = Monday ... 6 = Saturday. */
export const dayOfWeek = (d: string) => new Date(toUTC(d)).getUTCDay()

/** 'Wed, 14 Oct' style label. */
export const formatDate = (d: string) =>
  new Date(toUTC(d)).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

/** '14 Oct 2026' style label. */
export const formatLong = (d: string) =>
  new Date(toUTC(d)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
