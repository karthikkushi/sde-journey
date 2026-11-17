import { useState } from 'react'
import { SUBJECTS, studyInstructions } from '../../content/data/notebooks'
import { PlanDates } from '../components/PlanDates'
import { BACKUP_PREFIX, listBackups, restoreBackup } from '../lib/backup'
import { formatLong, todayIST } from '../lib/dates'
import { backupDue } from '../lib/study'
import { backupFileName, defaultProgress, parseProgress, type Progress } from '../lib/progress'
import { getProgress, replaceProgress, setText, update, useProgress } from '../store/progress'

export function Settings() {
  const [message, setMessage] = useState('')
  const [undo, setUndo] = useState<Progress | null>(null) // progress before the last Import or Delete
  function replaceWithUndo(next: Progress, done: string) {
    setUndo(getProgress())
    replaceProgress(next)
    setMessage(done)
  }
  const p = useProgress()

  // Export. Phones: the share sheet (save to Files, Drive or send to yourself), as .txt because
  // Android's share list refuses .json. Elsewhere: a normal download. The date counts only once it worked.
  async function exportProgress() {
    navigator.storage?.persist?.().catch(() => {}) // ask the browser not to evict our data
    const date = todayIST()
    const text = JSON.stringify({ ...getProgress(), lastBackup: date }, null, 1)
    const file = new File([text], backupFileName(date).replace(/\.json$/, '.txt'), { type: 'text/plain' })
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'SDE Journey backup' })
        update((d) => { d.lastBackup = date })
        setMessage('Backup shared. Keep the file somewhere safe, off this phone.')
        return
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return setMessage('Backup cancelled. Nothing was saved.')
      // Share failed for another reason: fall back to a download below.
    }
    try {
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = backupFileName(date)
      try { a.click() } finally { setTimeout(() => URL.revokeObjectURL(url), 1000) }
      update((d) => { d.lastBackup = date })
      setMessage('Backup download started. Check your downloads and keep the file somewhere safe.')
    } catch {
      setMessage('Could not create the backup. Keep this tab open and try again.')
    }
  }

  // Import: read the chosen file, check it, then replace progress after a confirm.
  async function importProgress(file: File | undefined) {
    if (!file) return
    try {
      const next = parseProgress(JSON.parse(await file.text()))
      if (!confirm('Replace ALL progress on this device with the backup file?')) return
      replaceWithUndo(next, 'Progress imported.')
    } catch (e) {
      setMessage(e instanceof Error && e.message.includes('backup') ? e.message : 'Could not read that file. Is it a backup file?')
    }
  }

  async function copyInstructions() {
    try {
      await navigator.clipboard.writeText(studyInstructions(p.texts['instructions:about'] ?? ''))
      setMessage('Study instructions copied. Paste them into your study chat.')
    } catch {
      setMessage('Could not copy. Your browser blocked the clipboard; try again after tapping the page.')
    }
  }

  const autoBackups = (() => { try { return listBackups(localStorage) } catch { return [] } })()
  function restoreAuto(key: string) {
    if (!confirm('Replace ALL progress on this device with this automatic backup?')) return
    const current = getProgress()
    if (!restoreBackup(localStorage, key)) return setMessage('That backup could not be read.')
    setUndo(current)
    location.reload() // the store reads the restored data on start
  }

  function reset() {
    if (!confirm('Delete ALL progress on this device? Export a backup first.')) return
    if (!confirm('Really delete everything? This cannot be undone.')) return
    replaceWithUndo(defaultProgress(), 'All progress deleted.')
  }

  return (
    <section className="page">
      <h1>Settings</h1>

      <div className="card">
        <h2>Backup</h2>
        <p className="muted small">
          Progress lives only in this browser. Export once a week, and to move between phone and laptop.
          On iPhone, Safari deletes site data after 7 days without a visit, and an app added to the home screen
          starts empty: export in Safari, then import inside the home-screen app.
        </p>
        <p className="small">
          {p.lastBackup ? `Last backup: ${formatLong(p.lastBackup)}.` : 'No backup export recorded yet.'}
          {backupDue(p.lastBackup, todayIST()) && ' Time to save a backup.'}
        </p>
        <div className="row">
          <button className="btn primary" onClick={exportProgress}>Export progress</button>
          <label className="btn file-btn">
            Import progress
            <input type="file" accept="application/json,.json,text/plain,.txt" className="sr-only" onChange={(e) => { importProgress(e.target.files?.[0]); e.target.value = '' }} />
          </label>
        </div>
        <p role="status" style={{ marginTop: message ? 12 : 0 }}>{message}</p>
        {undo && <button className="btn" onClick={() => { replaceProgress(undo); setUndo(null); setMessage('Undone. Your earlier progress is back.') }}>Undo</button>}
      </div>

      <PlanDates />

      <div className="card">
        <h2>Study notebooks</h2>
        <p className="muted small">
          Paste the share link of each NotebookLM or Gemini notebook. Notes and roadmap weeks then show an "Open notebook" button.
          Links stay on this device and go into your backup.
        </p>
        <div className="stack">
          {SUBJECTS.map((s) => <LinkField key={s.id} id={s.id} label={`${s.label} notebook`} hint={s.week > 1 ? `from week ${s.week}` : 'now'} />)}
          <LinkField id="chat" label="Study chat (your pinned Gemini chat)" hint="opens from Today" />
        </div>
      </div>

      <div className="card">
        <h2>My study instructions</h2>
        <p className="muted small">
          Paste these into your study chat or notebook so every answer follows your rules. Your name and city are added here only,
          and stay on this device (the app's code is public).
        </p>
        <label className="stack small" style={{ gap: 6 }}>
          About me (first line)
          <input className="input" placeholder="e.g. Asha, a junior developer in Pune," value={p.texts['instructions:about'] ?? ''}
            onChange={(e) => setText('instructions:about', e.target.value)} />
        </label>
        <button className="btn primary" style={{ marginTop: 12 }} onClick={copyInstructions}>Copy my study instructions</button>
      </div>

      {autoBackups.length > 0 && (
        <div className="card">
          <h2>Automatic backups</h2>
          <p className="muted small">The app copied everything before an update. Restore one only if something looks wrong.</p>
          {autoBackups.map((key) => (
            <div key={key} className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small">{formatLong(key.slice(BACKUP_PREFIX.length))}</span>
              <button className="btn" onClick={() => restoreAuto(key)}>Restore</button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2>Danger zone</h2>
        <button className="btn danger" onClick={reset}>Delete all progress</button>
      </div>
    </section>
  )
}

/** One https link, saved as you type once it is valid. Anything else shows a short error and is not saved. */
function LinkField({ id, label, hint }: { id: string; label: string; hint: string }) {
  const saved = useProgress().links[id] ?? ''
  const [value, setValue] = useState(saved)
  const valid = !value || /^https:\/\/\S+$/i.test(value.trim())
  function change(v: string) {
    setValue(v)
    const url = v.trim()
    if (!url) update((d) => { delete d.links[id] })
    else if (/^https:\/\/\S+$/i.test(url)) update((d) => { d.links[id] = url })
  }
  return (
    <label className="stack small" style={{ gap: 4 }}>
      <span>{label} <span className="muted">({hint})</span></span>
      <input className="input" type="url" inputMode="url" placeholder="https://notebooklm.google.com/notebook/…" value={value} onChange={(e) => change(e.target.value)} aria-invalid={!valid} />
      {!valid && <span className="warn-text">Paste a full link starting with https://</span>}
    </label>
  )
}
