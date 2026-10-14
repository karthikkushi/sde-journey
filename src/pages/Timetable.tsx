import { useEffect, useState } from 'react'
import { RULES } from '../../content/data/timetable'
import { dayOfWeek, minutesNowIST, todayIST } from '../lib/dates'
import { blockAt, scheduleFor } from '../lib/timetable'

const DAYS = [
  { label: 'Weekday', dow: 3 },
  { label: 'Saturday', dow: 6 },
  { label: 'Sunday', dow: 0 },
]

// Shows the daily plan and highlights the block running now (India time).
export function Timetable() {
  const todayDow = dayOfWeek(todayIST())
  const [dow, setDow] = useState(todayDow === 6 || todayDow === 0 ? todayDow : 3)
  const [minutes, setMinutes] = useState(minutesNowIST)

  // Refresh the highlight every minute.
  useEffect(() => {
    const id = setInterval(() => setMinutes(minutesNowIST()), 60_000)
    return () => clearInterval(id)
  }, [])

  const blocks = scheduleFor(dow)
  const isToday = scheduleFor(todayDow) === blocks
  const now = isToday ? blockAt(blocks, minutes) : -1

  return (
    <section className="page">
      <h1>Timetable</h1>
      <div className="segmented" role="radiogroup" aria-label="Day">
        {DAYS.map((d) => (
          <button key={d.label} role="radio" aria-checked={dow === d.dow} className={dow === d.dow ? 'on' : ''} onClick={() => setDow(d.dow)}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="card timetable">
        {blocks.map((b, i) => (
          <div key={b.from} className={`tt-row kind-${b.kind}${i === now ? ' is-now' : ''}`} aria-current={i === now ? 'time' : undefined}>
            <span className="tt-time">{b.from}</span>
            <span className="tt-label">
              {b.label}
              {i === now && <span className="chip is-accent" style={{ marginLeft: 8 }}>now</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="card">
        <h2>Rules</h2>
        <ul className="plain-list">{RULES.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
    </section>
  )
}
