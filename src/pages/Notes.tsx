import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { NOTES, SECTIONS } from '../lib/notes'
import { useProgress } from '../store/progress'

const LEVELS = ['basic', 'core', 'advanced'] as const

// Notes library: search plus filters by section, level and phase.
export function Notes() {
  const done = useProgress().notesDone
  const [q, setQ] = useState('')
  const [section, setSection] = useState('')
  const [level, setLevel] = useState('')
  const [phase, setPhase] = useState('')

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    return NOTES.filter((n) => {
      if (section && n.section !== section) return false
      if (level && n.level !== level) return false
      if (phase && n.phase !== Number(phase)) return false
      const hay = `${n.title} ${n.tags.join(' ')} ${n.body}`.toLowerCase()
      return words.every((w) => hay.includes(w))
    })
  }, [q, section, level, phase])

  const sections = [...new Set(shown.map((n) => n.section))]

  return (
    <section className="page">
      <h1>Notes</h1>
      <p className="muted" style={{ margin: 0 }}>
        {Object.keys(done).length} of {NOTES.length} finished
      </p>

      <div className="card stack">
        <input className="input" type="search" placeholder="Search notes (for example: hash, append, recursion)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search notes" />
        <div className="filters">
          <select className="input" value={section} onChange={(e) => setSection(e.target.value)} aria-label="Section">
            <option value="">All sections</option>
            {Object.entries(SECTIONS).map(([k, v]) => <option key={k} value={k}>{k}. {v}</option>)}
          </select>
          <select className="input" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
            <option value="">All levels</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="input" value={phase} onChange={(e) => setPhase(e.target.value)} aria-label="Phase">
            <option value="">All phases</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Phase {n}</option>)}
          </select>
        </div>
      </div>

      {shown.length === 0 && <p className="muted">No notes match. Try fewer words.</p>}

      {sections.map((s) => (
        <div key={s} className="card">
          <h2>{s}. {SECTIONS[s]}</h2>
          <ul className="note-list">
            {shown.filter((n) => n.section === s).map((n) => (
              <li key={n.id}>
                <Link to={`/notes/${n.id}`} className="note-row">
                  <span className={done[n.id] ? 'note-done' : 'note-dot'} aria-hidden="true">{done[n.id] ? '✓' : ''}</span>
                  <span className="note-title">{n.title}</span>
                  <span className={`badge level-${n.level}`}>{n.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
