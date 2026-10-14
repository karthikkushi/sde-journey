import { useState } from 'react'
import { RESOURCES } from '../../content/data/resources'

// Free resources, grouped by topic, with a search box.
export function Resources() {
  const [q, setQ] = useState('')
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const shown = RESOURCES.filter((r) => words.every((w) => `${r.name} ${r.topic} ${r.goodFor}`.toLowerCase().includes(w)))
  const topics = [...new Set(shown.map((r) => r.topic))]

  return (
    <section className="page">
      <h1>Free resources</h1>
      <div className="card notice-accent">
        <p><strong>Pick one main source per topic and finish it.</strong> Do not jump between five courses.</p>
        <p style={{ margin: 0 }}>30% learning, 70% practice. Check each page before starting: prices and plans change. Paid certificates are not needed in year one.</p>
      </div>
      <input className="input" type="search" placeholder="Search (for example: SQL, Docker, graphs)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search resources" />
      {topics.map((t) => (
        <div key={t} className="card">
          <h2>{t}</h2>
          <div className="stack">
            {shown.filter((r) => r.topic === t).map((r) => (
              <div key={r.id} className="resource">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  {r.url ? <a href={r.url} target="_blank" rel="noreferrer"><strong>{r.name} ↗</strong></a> : <strong>{r.name}</strong>}
                  <span className={`chip${r.role === 'main' ? ' is-accent' : ''}`}>{r.role}</span>
                </div>
                <div className="small">{r.goodFor}</div>
                <div className="muted small">When: {r.when}{r.verify && ' · check this link before relying on it'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {shown.length === 0 && <p className="muted">Nothing matches.</p>}
    </section>
  )
}
