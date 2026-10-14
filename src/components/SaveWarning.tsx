import { Link } from 'react-router'
import { retrySave, useSaveFailed } from '../store/progress'

export function SaveWarning() {
  const failed = useSaveFailed()
  if (!failed) return null
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
