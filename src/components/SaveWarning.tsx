import { Link } from 'react-router'
import { storageUnreadable } from '../lib/progress'
import { retrySave, useSaveFailed } from '../store/progress'

export function SaveWarning() {
  const failed = useSaveFailed()
  if (!failed) return null
  if (storageUnreadable()) return (
    <div className="save-warning card notice" role="alert">
      <strong>Your saved progress could not be read, so nothing is being saved over it.</strong>
      <p>It may come from a newer version of the app. Reload to get the latest version. If this stays, import a backup in Settings.</p>
      <div className="row">
        <button className="btn primary" onClick={() => location.reload()}>Reload</button>
        <Link className="btn" to="/settings">Settings</Link>
      </div>
    </div>
  )
  return (
    <div className="save-warning card notice" role="alert">
      <strong>Your latest progress could not be saved.</strong>
      <p>Keep this tab open and export a backup before closing or reloading it.</p>
      <div className="row">
        <button className="btn" onClick={retrySave}>Try saving again</button>
        <Link className="btn primary" to="/settings">Export a backup</Link>
      </div>
    </div>
  )
}
