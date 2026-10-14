import { useState } from 'react'
import { PlanDates } from '../components/PlanDates'
import { todayIST } from '../lib/dates'
import { backupFileName, defaultProgress, parseProgress } from '../lib/progress'
import { getProgress, replaceProgress } from '../store/progress'

export function Settings() {
  const [message, setMessage] = useState('')

  // Export: turn progress into a JSON file and let the browser download it.
  function exportProgress() {
    const blob = new Blob([JSON.stringify(getProgress(), null, 1)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = backupFileName(todayIST())
    a.click()
    URL.revokeObjectURL(a.href)
    setMessage('Backup downloaded. Keep it somewhere safe (Google Drive, email to yourself).')
  }

  // Import: read the chosen file, check it, then replace progress after a confirm.
  async function importProgress(file: File | undefined) {
    if (!file) return
    try {
      const next = parseProgress(JSON.parse(await file.text()))
      if (!confirm('Replace ALL progress on this device with the backup file?')) return
      replaceProgress(next)
      setMessage('Progress imported.')
    } catch (e) {
      setMessage(e instanceof Error && e.message.includes('backup') ? e.message : 'Could not read that file. Is it a backup JSON?')
    }
  }

  function reset() {
    if (!confirm('Delete ALL progress on this device? Export a backup first.')) return
    if (!confirm('Really delete everything? This cannot be undone.')) return
    replaceProgress(defaultProgress())
    setMessage('All progress deleted.')
  }

  return (
    <section className="page">
      <h1>Settings</h1>

      <div className="card">
        <h2>Backup</h2>
        <p className="muted small">
          Progress lives only in this browser. Export once a week, and to move between phone and laptop.
        </p>
        <div className="row">
          <button className="btn primary" onClick={exportProgress}>Export progress</button>
          <label className="btn">
            Import progress
            <input type="file" accept="application/json,.json" hidden onChange={(e) => { importProgress(e.target.files?.[0]); e.target.value = '' }} />
          </label>
        </div>
        {message && <p role="status" style={{ marginTop: 12 }}>{message}</p>}
      </div>

      <PlanDates />

      <div className="card">
        <h2>Danger zone</h2>
        <button className="btn danger" onClick={reset}>Delete all progress</button>
      </div>
    </section>
  )
}
