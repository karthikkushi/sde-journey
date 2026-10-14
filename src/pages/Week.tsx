import { Link, useParams } from 'react-router'
import { TOTAL_WEEKS } from '../../content/data/roadmap'
import { Bar } from '../components/Bar'
import { LearnLink, TaskRow } from '../components/TaskRow'
import { DAY_NAMES, formatDate, todayIST } from '../lib/dates'
import { buildWeek, doneShare, monthOfWeek, phasesOfWeek, planStartOf, weekSpec } from '../lib/plan'
import { useProgress } from '../store/progress'

const DAY_LABEL: Record<number, string> = { 6: 'Saturday: long DSA block', 0: 'Sunday: DSA, review, batch cook' }

export function Week() {
  const n = Number(useParams().n)
  const p = useProgress()
  if (!(n >= 1 && n <= TOTAL_WEEKS)) return <section className="page"><h1>No such week</h1></section>

  const spec = weekSpec(n)
  const days = buildWeek(spec, planStartOf(p))
  const tasks = days.flatMap((d) => d.tasks)
  const today = todayIST()
  const notes = spec.learn.filter((l) => l.note)

  return (
    <section className="page">
      <div className="row muted small">
        <Link to="/roadmap">Roadmap</Link> / Month {monthOfWeek(n)}
      </div>
      <h1>Week {n}: {spec.title}</h1>
      <div className="row">
        {phasesOfWeek(n).map((ph) => <span key={ph.n} className="chip is-accent">Phase {ph.n} · {ph.name}</span>)}
        <span className="chip">{formatDate(days[0].date)} – {formatDate(days[6].date)}</span>
      </div>

      <div className="card">
        <p><strong>Goal:</strong> {spec.goal}</p>
        <p><strong>Checkpoint test (Sunday):</strong> {spec.checkpoint}</p>
        {notes.length > 0 && (
          <div className="stack" style={{ gap: 6 }}>
            <strong>Notes to read</strong>
            {notes.map((l) => (
              <div key={l.note} className="row" style={{ justifyContent: 'space-between' }}>
                <span>{l.text.replace(/^Read( again)?: /, '')}</span>
                <LearnLink learn={l} />
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted small">{tasks.filter((t) => p.done[t.id]).length} of {tasks.length} done</span>
          </div>
          <Bar share={doneShare(tasks, p.done)} label="Week progress" />
        </div>
      </div>

      {days.map((d) => (
        <div key={d.date} className={`card${d.date === today ? ' is-today' : ''}`}>
          <h2>
            {DAY_LABEL[d.dow] ?? DAY_NAMES[d.dow]} <span className="muted small">{formatDate(d.date)}{d.date === today && ' · today'}</span>
          </h2>
          {d.tasks.map((t) => <TaskRow key={t.id} task={t} />)}
        </div>
      ))}

      <div className="row" style={{ justifyContent: 'space-between' }}>
        {n > 1 ? <Link className="btn" to={`/roadmap/week/${n - 1}`}>← Week {n - 1}</Link> : <span />}
        {n < TOTAL_WEEKS && <Link className="btn" to={`/roadmap/week/${n + 1}`}>Week {n + 1} →</Link>}
      </div>
    </section>
  )
}
