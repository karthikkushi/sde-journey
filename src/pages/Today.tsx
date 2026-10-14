import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { HABITS, MINIMUM_DAY, TOTAL_WEEKS } from '../../content/data/roadmap'
import { TIPS } from '../../content/data/tips'
import { Bar } from '../components/Bar'
import { Icon } from '../components/Icon'
import { CheckRow, TaskRow } from '../components/TaskRow'
import { addDays, formatDate, todayIST } from '../lib/dates'
import type { Energy } from '../lib/progress'
import { buildWeek, monthOfWeek, phasesOfWeek, position, TOTAL_MONTHS, weekSpec, type Slot, type Task } from '../lib/plan'
import { BADGES, earned } from '../lib/badges'
import { canFreezeYesterday, streakOf } from '../lib/streak'
import { levelOf, totalXp } from '../lib/xp'
import { update, useProgress } from '../store/progress'

// Headings for each part of the day, with times from the timetable.
const SLOT_TITLES: Record<number, Partial<Record<Slot, string>>> = {
  // weekday
  1: { s1: 'Morning · DSA session 1 (7:05–8:00)', s2: 'Evening · DSA session 2 (8:25–9:25)' },
  // Saturday
  6: { block: 'DSA block (8:30–11:30, break in the middle)', extra: 'Weekend extra' },
  // Sunday
  0: { block: 'DSA (9:30–11:30)', review: 'Weekly review (11:30) and cooking', extra: 'Weekend extra' },
}

/** Same tip all day, a different one tomorrow. */
function tipIndex(date: string) {
  let h = 0
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % TIPS.length
}

export function Today() {
  const p = useProgress()
  const today = todayIST()
  const pos = position(today, p.shiftWeeks)
  const energy = p.energy[today]
  const [showFull, setShowFull] = useState(false)
  const [tipOffset, setTipOffset] = useState(0)

  const xp = totalXp(p)
  const level = levelOf(xp)
  const streak = streakOf(p, today)
  const focusMin = p.focus[today] ?? 0
  const tip = TIPS[(tipIndex(today) + tipOffset) % TIPS.length]
  const badgeCount = BADGES.filter((b) => earned(b, p)).length

  // Flashcards live in the notes bundle, so load it only for this small count.
  const [dueCount, setDueCount] = useState(0)
  useEffect(() => {
    let alive = true
    Promise.all([import('../lib/notes'), import('../lib/srs')]).then(([notes, srs]) => {
      if (alive) setDueCount(srs.dueCards(notes.ALL_CARDS, p, today).length)
    })
    return () => { alive = false }
  }, [p, today])

  const setEnergy = (e: Energy) => update((d) => { d.energy[today] = e })

  // Today's roadmap tasks (empty before or after the plan).
  const day = pos.status === 'during' ? buildWeek(weekSpec(pos.week), p.shiftWeeks)[pos.dayIndex] : undefined
  const spec = pos.status === 'during' ? weekSpec(pos.week) : undefined
  const minimum = (energy === 'tired' || energy === 'low') && !showFull

  return (
    <section className="page">
      <header className="today-head">
        <div className="muted">{formatDate(today)}</div>
        {pos.status === 'during' ? (
          <>
            <h1>Week {pos.week} <span className="muted">of {TOTAL_WEEKS}</span></h1>
            <div className="row">
              {phasesOfWeek(pos.week).map((ph) => (
                <span key={ph.n} className="chip is-accent">Phase {ph.n} · {ph.name}</span>
              ))}
              <span className="chip">Month {monthOfWeek(pos.week)} of {TOTAL_MONTHS}</span>
            </div>
          </>
        ) : pos.status === 'before' ? (
          <h1>The plan starts in {pos.daysToGo} {pos.daysToGo === 1 ? 'day' : 'days'}</h1>
        ) : (
          <h1>You finished all {TOTAL_WEEKS} weeks</h1>
        )}
      </header>

      {/* Streak, level, focus */}
      <div className="stats">
        <div className="stat">
          <Icon name="flame" />
          <strong>{streak}</strong>
          <span className="muted small">day streak</span>
        </div>
        <Link to="/badges" className="stat stat-wide">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{level.name}</strong>
            <span className="muted small">{xp.toLocaleString('en-IN')} XP</span>
          </div>
          <Bar share={level.share} label="Progress to next level" />
          <span className="muted small">
            {level.next ? `${level.toNext.toLocaleString('en-IN')} XP to ${level.next.name}` : 'Top level reached'} · 🏅 {badgeCount}/{BADGES.length}
          </span>
        </Link>
        <div className="stat">
          <Icon name="timer" />
          <strong>{focusMin}</strong>
          <span className="muted small">focus min</span>
        </div>
      </div>
      <Link to="/focus" className="btn primary">
        <Icon name="timer" size={20} /> Start focus
      </Link>

      {dueCount > 0 && (
        <Link to="/cards" className="card row due-card" style={{ justifyContent: 'space-between' }}>
          <span><strong>{dueCount}</strong> flashcards due today</span>
          <span className="chip is-accent">Review</span>
        </Link>
      )}

      {canFreezeYesterday(p, today) && (
        <div className="card notice">
          <p>
            You missed yesterday. Use this week’s <strong>streak freeze</strong> to keep your {streakOf({ ...p, freezes: { ...p.freezes, [addDays(today, -1)]: true } }, today)}-day streak?
          </p>
          <button className="btn" onClick={() => update((d) => { d.freezes[addDays(today, -1)] = true })}>
            Use freeze
          </button>
        </div>
      )}

      {/* Energy check-in */}
      <div className="card">
        <h2>How is your energy?</h2>
        <div className="segmented" role="radiogroup" aria-label="Energy">
          {(
            [
              ['fresh', 'Fresh'],
              ['tired', 'Tired'],
              ['low', 'Very low'],
            ] as const
          ).map(([value, label]) => (
            <button key={value} role="radio" aria-checked={energy === value} className={energy === value ? 'on' : ''} onClick={() => setEnergy(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {minimum ? (
        <div className="card">
          <h2>Minimum day</h2>
          <p className="muted">Rest is part of the plan. Do these three and your streak stays alive.</p>
          {MINIMUM_DAY.map((m) => (
            <CheckRow key={m.id} id={`m:${today}:${m.id}`} text={m.text} />
          ))}
          <button className="link-btn" onClick={() => setShowFull(true)}>Show the full plan anyway</button>
        </div>
      ) : (
        <>
          {spec && (
            <div className="card">
              <div className="muted small">This week</div>
              <h2 style={{ marginBottom: 4 }}>{spec.title}</h2>
              <p className="muted" style={{ margin: 0 }}>{spec.goal}</p>
            </div>
          )}
          {day && <DayTasks tasks={day.tasks} dow={day.dow} />}
          <div className="card">
            <h2>Daily habits</h2>
            {HABITS.map((h) => (
              <CheckRow key={h.id} id={`h:${today}:${h.id}`} text={h.text} />
            ))}
          </div>
        </>
      )}

      <div className="card tip">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="muted small">Tip of the day · {tip.topic}</span>
          <button className="link-btn" onClick={() => setTipOffset((o) => o + 1)}>Another</button>
        </div>
        <p style={{ margin: 0 }}>{tip.text}</p>
      </div>

      {pos.status === 'during' && (
        <Link to={`/roadmap/week/${pos.week}`} className="btn">See the whole week</Link>
      )}
    </section>
  )
}

/** Today's roadmap tasks, grouped by part of the day. */
function DayTasks({ tasks, dow }: { tasks: Task[]; dow: number }) {
  const titles = SLOT_TITLES[dow === 6 || dow === 0 ? dow : 1]
  const slots = [...new Set(tasks.map((t) => t.slot))]
  return (
    <>
      {slots.map((slot) => (
        <div key={slot} className="card">
          <h2>{titles[slot] ?? 'Tasks'}</h2>
          {tasks.filter((t) => t.slot === slot).map((t) => <TaskRow key={t.id} task={t} />)}
        </div>
      ))}
    </>
  )
}
