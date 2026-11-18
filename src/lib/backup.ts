// Automatic safety copy before an upgrade.
// main.tsx imports this file FIRST, so it runs before the store loads or saves anything.
// The first time a new data version opens, every "sdej-" key is copied to
// "sdeJourney_backup_<date>". Nothing is ever cleared; only our own oldest copies are pruned.
import { CURRENT_VERSION } from './progress'

export const BACKUP_PREFIX = 'sdeJourney_backup_'
const KEEP = 3 // keep the newest 3 automatic copies

/** All our app keys and values, as one object. */
function appData(storage: Storage) {
  const data: Record<string, string> = {}
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key?.startsWith('sdej-')) data[key] = storage.getItem(key) ?? ''
  }
  return data
}

/** Version number of the stored progress, or 0 if there is none or it can't be read. */
function storedVersion(storage: Storage) {
  try {
    return Number(JSON.parse(storage.getItem('sdej-progress') ?? '{}').version) || 0
  } catch {
    return 0
  }
}

/** Copy all app data if it was saved by an older version. Returns the backup key, or '' if none was needed. */
export function backupBeforeUpgrade(storage: Storage, today: string) {
  try {
    const version = storedVersion(storage)
    if (!storage.getItem('sdej-progress') || version >= CURRENT_VERSION) return ''
    const key = `${BACKUP_PREFIX}${today}`
    if (storage.getItem(key) === null) storage.setItem(key, JSON.stringify({ fromVersion: version, data: appData(storage) }))
    pruneBackups(storage)
    return key
  } catch {
    return '' // storage blocked or full: the app still works, the upgrade is still non-destructive
  }
}

/** Automatic backup keys, newest first. */
export function listBackups(storage: Storage) {
  const keys: string[] = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key?.startsWith(BACKUP_PREFIX)) keys.push(key)
  }
  return keys.sort().reverse()
}

function pruneBackups(storage: Storage) {
  for (const key of listBackups(storage).slice(KEEP)) storage.removeItem(key)
}

/** Put every key from an automatic backup back. Used by Settings, after a confirm. */
export function restoreBackup(storage: Storage, key: string) {
  const saved = JSON.parse(storage.getItem(key) ?? 'null') as { data: Record<string, string> } | null
  if (!saved?.data) return false
  for (const [k, v] of Object.entries(saved.data)) storage.setItem(k, v)
  return true
}

// Runs once, when main.tsx imports this module.
if (typeof window !== 'undefined') {
  try {
    backupBeforeUpgrade(window.localStorage, new Date().toISOString().slice(0, 10))
  } catch {
    // localStorage itself is blocked (some private modes): nothing to protect.
  }
}
