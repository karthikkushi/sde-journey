import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { HABITS, MINIMUM_DAY, TOTAL_WEEKS } from '../../content/data/roadmap'
import { TIPS } from '../../content/data/tips'
import { Bar } from '../components/Bar'
import { Icon } from '../components/Icon'
import { CheckRow, ProblemMeta, TaskRow } from '../components/TaskRow'
import { addDays, daysBetween, formatDate, todayIST } from '../lib/dates'
import type { Energy } from '../lib/progress'
import { buildWeek, isCore, monthOfWeek, paceOf, phasesOfWeek, planStartOf, position, TOTAL_MONTHS, weekSpec, type Pace, type Scheduled, type Slot, type Task } from '../lib/plan'
import { BADGES, earned } from '../lib/badges'
import { canFreezeYesterday, streakOf } from '../lib/streak'
import { levelOf, totalXp } from '../lib/xp'
import { backupDue, CATCH_UP_DAYS, catchUpTask, dueProblems, recentOverdue, studyBudget, taskMinutes } from '../lib/study'
import { problemBySlug } from '../lib/problems'
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
  const start = planStartOf(p)
  const pos = position(today, start)
  const pace = paceOf(p.done, start, today)
  const catchUp = recentOverdue(pace.overdue, today)
  const olderOpen = pace.overdue.length - catchUp.length
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
  const day = pos.status === 'during' ? buildWeek(weekSpec(pos.week), start)[pos.dayIndex] : undefined
  const spec = pos.status === 'during' ? weekSpec(pos.week) : undefined
  const minimum = (energy === 'tired' || energy === 'low') && !showFull
  const revisions = dueProblems(p, today)
  const hasProgress = Object.keys(p.done).length > 0 || Object.keys(p.notesDone).length > 0 || Object.keys(p.focus).length > 0

  return (
    <section className="page today-page">
      <header className="today-head page-heading">
        <div>
          <span className="eyebrow">{formatDate(today)}</span>
          <h1>Your study day<span className="accent-text">.</span></h1>
          <p>One focused session. One step closer.</p>
        </div>
        {pos.status === 'during' ? (
          <Link className="week-label" to={`/roadmap/week/${pos.week}`}>
            <Icon name="map" size={22} />
            <span><strong>Week {pos.week} <span className="muted">/ {TOTAL_WEEKS}</span></strong><small>{phasesOfWeek(pos.week).map((ph) => ph.name).join(' · ')} · Month {monthOfWeek(pos.week)} of {TOTAL_MONTHS}</small></span>
            <span aria-hidden="true">↗</span>
          </Link>
        ) : <p>{pos.status === 'before' ? `Your plan starts in ${pos.daysToGo} days.` : pace.status === 'finished' ? 'Every main task complete. Look how far you’ve come.' : 'Your scheduled plan has ended. Pick up your unfinished work below.'}</p>}
      </header>

      <div className="today-grid">
        <div className="today-primary">
          <div className="energy-check">
            <div><h2>How are you feeling?</h2><p className="muted small">Let’s find your pace for today.</p></div>
            <div className="segmented" aria-label="Energy">
              {([['fresh', 'Fresh'], ['tired', 'Tired'], ['low', 'Very low']] as const).map(([value, label]) => (
                <button key={value} aria-pressed={energy === value} className={energy === value ? 'on' : ''} onClick={() => setEnergy(value)}>{label}</button>
              ))}
            </div>
          </div>

          {minimum ? (
            <div className="card daily-study minimum-study">
              <span className="eyebrow"><Icon name="moon" size={16} /> A gentler day</span>
              <h2>A little still counts.</h2>
              <p className="muted">Do these three, keep your streak, and give yourself time to rest.</p>
              {MINIMUM_DAY.map((m) => <CheckRow key={m.id} id={`m:${today}:${m.id}`} text={m.text} />)}
              <div className="session-actions"><Link to="/focus" className="btn primary"><Icon name="timer" size={18} /> Start focus</Link><button className="link-btn" onClick={() => setShowFull(true)}>Show the full plan</button></div>
            </div>
          ) : day ? <DailyStudy tasks={day.tasks} overdue={catchUp} today={today} /> : <Link to="/focus" className="btn primary"><Icon name="timer" size={20} /> Start a focus session</Link>}

          {!minimum && (
            <>
              {day && <details className="card plan-disclosure"><summary><span><Icon name="check" size={19} />Full plan for today</span><span className="muted small">{day.tasks.filter((task) => p.done[task.id]).length} / {day.tasks.length}</span></summary><DayTasks tasks={day.tasks} dow={day.dow} /></details>}
              {catchUp.length > 0 && <details className="card plan-disclosure"><summary><span><Icon name="clock" size={19} />Pick up where you left off</span><span className="muted small">{catchUp.length} tasks</span></summary><TaskList title={`Catch up: the last ${CATCH_UP_DAYS} days`} items={catchUp} limit={5} />{olderOpen > 0 && <p className="muted small">{olderOpen} older unfinished {olderOpen === 1 ? 'task stays' : 'tasks stay'} on their weeks in the <Link to="/roadmap">roadmap</Link>.</p>}</details>}
              {revisions.length > 0 && (
                <div className="card">
                  <div className="section-title"><h2>Keep it fresh</h2><span className="chip is-accent">{revisions.length} due</span></div>
                  <p className="muted small">Try these problems from a blank page, then record how it went.</p>
                  {revisions.slice(0, 3).map((slug) => (
                    <div className="revision-item" key={slug}><strong>{problemBySlug(slug)!.title}</strong><div className="row"><ProblemMeta slug={slug} /></div></div>
                  ))}
                  {revisions.length > 3 && <p className="muted small">The next problems appear as you record attempts.</p>}
                </div>
              )}
              {day && day.tasks.filter(isCore).every((t) => p.done[t.id]) && pace.next.length > 0 && <StudyAhead next={pace.next} />}
              <div className="card habits-card">
                <div className="section-title"><h2>The everyday things</h2><span className="muted small">Daily habits</span></div>
                <div className="habit-grid">{HABITS.map((h) => <CheckRow key={h.id} id={`h:${today}:${h.id}`} text={h.text} />)}</div>
              </div>
            </>
          )}

          {dueCount > 0 && <Link to="/cards" className="card due-card"><span className="quick-icon"><Icon name="cards" /></span><span><strong>A quick memory refresh</strong><small>{dueCount} flashcards ready to review</small></span><span aria-hidden="true">→</span></Link>}
          {canFreezeYesterday(p, today) && (
            <div className="card notice"><h2>A day off doesn’t undo your progress.</h2><p className="muted small">Use this week’s freeze to keep your {streakOf({ ...p, freezes: { ...p.freezes, [addDays(today, -1)]: true } }, today)}-day streak.</p><button className="btn" onClick={() => update((d) => { d.freezes[addDays(today, -1)] = true })}>Use streak freeze</button></div>
          )}
        </div>

        <aside className="today-secondary" aria-label="Your progress and weekly plan">
          <div className="card progress-card">
            <div className="section-title"><h2>Your momentum</h2><Icon name="chart" size={18} /></div>
            <div className="momentum-stats">
              <div><Icon name="flame" size={19} /><strong>{streak}<small>days</small></strong><span>Study streak</span></div>
              <div><Icon name="timer" size={19} /><strong>{focusMin}<small>min</small></strong><span>Focused today</span></div>
            </div>
            <Link to="/badges" className="level-summary">
              <div className="section-title"><strong>{level.name}</strong><span className="muted small">{xp.toLocaleString('en-IN')} XP</span></div>
              <Bar share={level.share} label="Progress to next level" />
              <span className="muted small">{level.next ? `${level.toNext.toLocaleString('en-IN')} XP to ${level.next.name}` : 'Top level reached'} · {badgeCount}/{BADGES.length} badges</span>
            </Link>
            <Link className="text-link" to="/performance">View performance <span aria-hidden="true">↗</span></Link>
          </div>

          {spec && <div className="card week-card"><span className="eyebrow">This week’s direction</span><h2>{spec.title}</h2><p className="muted small">{spec.goal}</p>{pos.status === 'during' && <Link className="text-link" to={`/roadmap/week/${pos.week}`}>Explore the week <span aria-hidden="true">→</span></Link>}</div>}
          {pos.status === 'during' && <PaceCard pace={pace} />}
          <div className="tip"><div className="section-title"><span className="eyebrow">A thought for today</span><button className="icon-btn" aria-label="Show another study tip" onClick={() => setTipOffset((o) => o + 1)}><Icon name="spark" size={18} /></button></div><p>{tip.text}</p><span className="muted small">{tip.topic}</span></div>
          {hasProgress && backupDue(p.lastBackup, today) && <div className="card notice backup-reminder"><Icon name="gear" size={18} /><div><strong>{p.lastBackup ? 'Time for a backup' : 'Keep your progress safe'}</strong><p className="muted small">Save a copy outside this browser.</p><Link className="text-link" to="/settings">Back up progress →</Link></div></div>}
          {daysBetween(start, today) < 7 && <p className="plan-start muted small">Plan started {formatDate(start)}. <Link to="/settings">Change date</Link></p>}
        </aside>
      </div>
    </section>
  )
}

function DailyStudy({ tasks, overdue, today }: { tasks: Task[]; overdue: Scheduled[]; today: string }) {
  const p = useProgress()
  const budgetKey = `study-budget:${today}`
  const budget = studyBudget(p, today)
  const spent = p.focus[today] ?? 0
  const remainingBudget = Math.max(0, budget - spent)
  const main = tasks.filter(isCore)
  const remaining = main.filter((task) => !p.done[task.id])
  const minutes = remaining.reduce((sum, task) => sum + taskMinutes(task), 0)
  const next = remaining[0]
  const catchUp = catchUpTask(overdue, budget, spent, minutes)
  return (
    <div className="card daily-study">
      <div className="session-topline"><span className="eyebrow"><Icon name="timer" size={16} /> Your next session</span><span className="session-tag">{remainingBudget} min available</span></div>
      <h2>{remainingBudget === 0 ? 'Your focus budget is complete' : next ? 'A clear place to begin.' : 'Today’s main tasks are complete'}</h2>
      <label className="budget-control">
        Study time today
        <select className="input" value={budget} onChange={(e) => update((d) => { d.texts[budgetKey] = e.target.value })}>
          {[25, 45, 90, 180].map((value) => <option key={value} value={value}>{value} minutes</option>)}
        </select>
      </label>
      <div className="session-progress"><Bar share={main.length ? (main.length - remaining.length) / main.length : 1} label="Today’s main tasks" /><span>{main.length - remaining.length} of {main.length} main tasks complete</span></div>
      {remainingBudget === 0 ? (
        <p>You can stop for today. Unfinished tasks stay on your plan; increase the budget only if you have more time.</p>
      ) : next ? (
        <>
          <TaskRow task={next} note={`About ${taskMinutes(next)} minutes · planning estimate`} />
          <p className="muted small">{minutes > remainingBudget ? `The remaining main tasks may take about ${minutes} minutes. Work for up to ${remainingBudget} minutes today; you don’t have to finish everything.` : `About ${minutes} minutes of main work remaining. You can stop when it is done.`} Log study time with the focus timer.</p>
          <Link className="btn primary session-start" to="/focus"><Icon name="play" size={18} /> Start focus <span aria-hidden="true">→</span></Link>
        </>
      ) : <p>You can stop here, review a problem, or use spare time to catch up.</p>}
      {main.filter((task) => task.problem && p.done[task.id]).map((task) => (
        <div className="stack" key={task.id} style={{ marginTop: 16 }}>
          <strong>Record your attempt: {task.text}</strong>
          <div className="row"><ProblemMeta slug={task.problem!} /></div>
        </div>
      ))}
      {catchUp && (
        <div style={{ marginTop: 16 }}>
          <h3>Optional: one catch-up task</h3>
          <TaskRow task={catchUp.task} note={`About ${taskMinutes(catchUp.task)} minutes · fits after today’s main work`} />
        </div>
      )}
    </div>
  )
}

/** On track, behind or ahead, with a one-tap fix when the gap is a week or more. */
function PaceCard({ pace }: { pace: Pace }) {
  const move = (days: number) => update((d) => { d.startDate = addDays(planStartOf(d), days) })
  const n = `${pace.days} ${pace.days === 1 ? 'day' : 'days'}`
  return (
    <div className={`card${pace.status === 'behind' && pace.days >= 7 ? ' notice' : ''}`}>
      {pace.status === 'behind' ? (
        <>
          <p style={{ margin: 0 }}><strong>{n} behind.</strong> {pace.days < 7 ? 'Catch up a little each day with the list below.' : 'Life happens. Move the plan so the coming weeks stay realistic.'}</p>
          {pace.days >= 7 && <button className="btn" style={{ marginTop: 12 }} onClick={() => move(7)}>Move my plan 1 week later</button>}
        </>
      ) : pace.status === 'ahead' ? (
        <>
          <p style={{ margin: 0 }}><strong>{n} ahead.</strong> Great work. Keep the extra time for revision, or move on.</p>
          {pace.days >= 7 && <button className="btn" style={{ marginTop: 12 }} onClick={() => move(-7)}>Move my plan 1 week earlier</button>}
        </>
      ) : (
        <p style={{ margin: 0 }}><strong>On track.</strong> {pace.done} of {pace.total} main tasks done.</p>
      )}
    </div>
  )
}

/** Roadmap tasks from other days, with the day they were planned for. */
function TaskList({ title, items, limit }: { title: string; items: Scheduled[]; limit: number }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {items.slice(0, limit).map((s) => (
        <TaskRow key={s.task.id} task={s.task} note={`Planned ${formatDate(s.date)} · week ${s.week}`} />
      ))}
      {items.length > limit && (
        <Link to={`/roadmap/week/${items[limit].week}`} className="muted small">+ {items.length - limit} more on the roadmap</Link>
      )}
    </div>
  )
}

/** Today is done: offer the next tasks for days with more free time. */
function StudyAhead({ next }: { next: Scheduled[] }) {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <div className="card">
        <p style={{ margin: 0 }}>Today’s main tasks are done. More free time today?</p>
        <button className="btn" style={{ marginTop: 12 }} onClick={() => setOpen(true)}>Study ahead</button>
      </div>
    )
  }
  return <TaskList title="Study ahead: coming next" items={next} limit={3} />
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
