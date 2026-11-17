import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { SUBJECT_OF_SECTION } from '../../content/data/notebooks'
import { NoteMarkdown } from '../components/NoteMarkdown'
import { NotebookButton } from '../components/NotebookButton'
import { todayIST } from '../lib/dates'
import type { Note } from '../lib/noteParse'
import { loadNote, NOTE_LIST, noteMeta, SECTIONS } from '../lib/notesIndex'
import { setText, update, useProgress } from '../store/progress'

export function NoteView() {
  const id = useParams().id ?? ''
  const p = useProgress()
  const note = noteMeta(id)
  // The note's text is its own small file: fetch it when the note opens.
  const [full, setFull] = useState<Note | undefined>()
  useEffect(() => {
    let alive = true
    loadNote(id).then((n) => { if (alive) setFull(n) })
    return () => { alive = false }
  }, [id])
  if (!note) {
    return (
      <section className="page">
        <h1>Note not written yet</h1>
        <p className="muted">This note is planned. It will appear here soon.</p>
        <Link className="btn" to="/notes">All notes</Link>
      </section>
    )
  }

  const inSection = NOTE_LIST.filter((n) => n.section === note.section)
  const i = inSection.findIndex((n) => n.id === id)
  const prev = inSection[i - 1]
  const next = inSection[i + 1]
  const finished = !!p.notesDone[id]
  const myKey = `note:${id}`

  return (
    <article className="page reading-page">
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
      {SUBJECT_OF_SECTION[note.section] && <div className="row"><NotebookButton subject={SUBJECT_OF_SECTION[note.section]!} /></div>}

      {full?.id === id ? <NoteMarkdown noteId={id} body={full.body} /> : <p className="muted" role="status">Loading the note…</p>}

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
