import { Link, useParams } from 'react-router'
import { LIFE_CHECKS, MONTH_CHECKS, WEEKS } from '../../content/data/roadmap'
import { CheckRow } from '../components/TaskRow'
import { monthOfWeek, TOTAL_MONTHS } from '../lib/plan'
import { setText, useProgress } from '../store/progress'

// End-of-month self-check: "I can do this".
export function Checkpoint() {
  const m = Number(useParams().m)
  const p = useProgress()
  if (!(m >= 1 && m <= TOTAL_MONTHS)) return <section className="page"><h1>No such month</h1></section>

  const weeks = WEEKS.filter((w) => monthOfWeek(w.n) === m)
  const key = `checkpoint:${m}`

  return (
    <section className="page">
      <div className="row muted small"><Link to="/roadmap">Roadmap</Link> / Month {m}</div>
      <h1>Month {m} checkpoint</h1>
      <p className="muted">Be honest. A "not yet" is fine. It tells you where to spend next month.</p>

      <div className="card">
        <h2>I can do this</h2>
        {MONTH_CHECKS[m].map((text, i) => <CheckRow key={i} id={`c:${m}:${i}`} text={text} />)}
      </div>

      <div className="card">
        <h2>Life checks</h2>
        {LIFE_CHECKS.map((text, i) => <CheckRow key={i} id={`c:${m}:life${i}`} text={text} />)}
      </div>

      <div className="card">
        <h2>This month’s weekly tests</h2>
        <ul className="plain-list">
          {weeks.map((w) => (
            <li key={w.n}>
              <Link to={`/roadmap/week/${w.n}`}>Week {w.n}</Link>: {w.checkpoint}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <label htmlFor={key}><h2>One thing to change next month</h2></label>
        <textarea id={key} className="input" rows={3} value={p.texts[key] ?? ''} onChange={(e) => setText(key, e.target.value)} />
      </div>
    </section>
  )
}
