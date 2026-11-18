import { Link } from 'react-router'
import { SUBJECTS, type Subject } from '../../content/data/notebooks'
import { todayIST } from '../lib/dates'
import { planStartOf, position } from '../lib/plan'
import { useProgress } from '../store/progress'

/** "Open notebook" for a subject. No link saved yet: a short hint instead of a broken button. */
export function NotebookButton({ subject }: { subject: Subject }) {
  const p = useProgress()
  const url = p.links[subject]
  const info = SUBJECTS.find((s) => s.id === subject)!
  const pos = position(todayIST(), planStartOf(p))
  const reached = pos.status === 'after' || (pos.status === 'during' && pos.week >= info.week)
  if (url) return <a className="btn" href={url} target="_blank" rel="noreferrer">Open {info.label} notebook ↗</a>
  return (
    <span className="muted small">
      {reached ? `Add your ${info.label} notebook` : `Add the ${info.label} notebook when you reach week ${info.week}`} in <Link to="/settings">Settings</Link>.
    </span>
  )
}
