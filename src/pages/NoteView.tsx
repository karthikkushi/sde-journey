import { Link, useParams } from 'react-router'
import { NoteMarkdown } from '../components/NoteMarkdown'
import { todayIST } from '../lib/dates'
import { NOTES, noteById, SECTIONS } from '../lib/notes'
import { setText, update, useProgress } from '../store/progress'

export function NoteView() {
  const id = useParams().id ?? ''
  const p = useProgress()
  const note = noteById(id)
  if (!note) {
    return (
      <section className="page">
        <h1>Note not written yet</h1>
        <p className="muted">This note is planned. It will appear here soon.</p>
        <Link className="btn" to="/notes">All notes</Link>
      </section>
    )
  }

  const inSection = NOTES.filter((n) => n.section === note.section)
  const i = inSection.indexOf(note)
  const prev = inSection[i - 1]
  const next = inSection[i + 1]
  const finished = !!p.notesDone[id]
  const myKey = `note:${id}`

  return (
    <article className="page">
      <div className="row muted small">
        <Link to="/notes">Notes</Link> / {note.section}. {SECTIONS[note.section]}
      </div>
      <h1>{note.title}</h1>
      <div className="row">
        <span className={`badge level-${note.level}`}>{note.level}</span>
        <span className="chip">{note.estMinutes} min</span>
        {note.week > 0 && <Link className="chip" to={`/roadmap/week/${note.week}`}>Week {note.week}</Link>}
        {note.tags.map((t) => <span key={t} className="chip is-muted">#{t}</span>)}
      </div>

      <NoteMarkdown noteId={id} body={note.body} />

      <div className="card">
        <label htmlFor={myKey}><h2>My notes</h2></label>
        <textarea id={myKey} className="input" rows={4} value={p.texts[myKey] ?? ''} onChange={(e) => setText(myKey, e.target.value)} placeholder="Write what you learned, in your words." />
      </div>

      <button
        className={`btn${finished ? '' : ' primary'}`}
        onClick={() => update((d) => { if (d.notesDone[id]) delete d.notesDone[id]; else d.notesDone[id] = todayIST() })}
      >
        {finished ? '✓ Finished (tap to undo)' : 'I finished this note (+25 XP)'}
      </button>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        {prev ? <Link className="btn" to={`/notes/${prev.id}`}>← {prev.title}</Link> : <span />}
        {next && <Link className="btn" to={`/notes/${next.id}`}>{next.title} →</Link>}
      </div>
    </article>
  )
}
