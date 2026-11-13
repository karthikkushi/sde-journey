import { useState } from 'react'
import { PlanDates } from '../components/PlanDates'
import { formatLong, todayIST } from '../lib/dates'
import { backupDue } from '../lib/study'
import { backupFileName, defaultProgress, parseProgress, type Progress } from '../lib/progress'
import { getProgress, replaceProgress, update, useProgress } from '../store/progress'

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
        <h2>Danger zone</h2>
        <button className="btn danger" onClick={reset}>Delete all progress</button>
      </div>
    </section>
  )
}
