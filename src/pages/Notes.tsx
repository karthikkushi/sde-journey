import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { NOTES, SECTIONS } from '../lib/notes'
import { useProgress } from '../store/progress'
import { Icon } from '../components/Icon'

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
      <header className="page-heading"><span className="eyebrow">Study library</span><h1>Notes<span className="accent-text">.</span></h1><p>Understand the idea. Practise it. Make it yours.</p><span className="library-count">{Object.keys(done).length} of {NOTES.length} notes finished</span></header>

      <div className="card stack library-filters">
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

      <div className="section-title"><span className="muted small" role="status">{shown.length} notes in {sections.length} sections</span>{(q || section || level || phase) && <button className="link-btn" onClick={() => { setQ(''); setSection(''); setLevel(''); setPhase('') }}>Clear filters</button>}</div>
      {shown.length === 0 && <div className="empty-state"><Icon name="book" size={32} /><h2>No notes found</h2><p>Try a broader topic or clear the filters to explore the library.</p></div>}

      {sections.map((s) => (
        <div key={s} className="card library-section">
          <div className="section-title"><h2><span className="section-letter">{s}</span>{SECTIONS[s]}</h2><span className="muted small">{shown.filter((n) => n.section === s).length} notes</span></div>
          <ul className="note-list">
            {shown.filter((n) => n.section === s).map((n) => (
              <li key={n.id}>
                <Link to={`/notes/${n.id}`} className="note-row">
                  <span className={done[n.id] ? 'note-done' : 'note-dot'} aria-hidden="true">{done[n.id] ? '✓' : ''}</span>
                  <span className="note-title">{n.title}</span>
                  {done[n.id] && <span className="sr-only">Completed</span>}
                  <span className="note-duration">{n.estMinutes} min</span>
                  <span className={`badge level-${n.level}`}>{n.level}</span>
                  <span className="note-arrow" aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
