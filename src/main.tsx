// Must stay the FIRST import: it copies saved data before anything else can touch it.
import './lib/backup'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './app/App.tsx'
import { registerSW } from 'virtual:pwa-register'

// A new version deletes the old files, so an old open page that loads a page for the first time gets a 404.
// Reload once into the new version. The time guard stops a reload loop while offline. Progress is already saved.
window.addEventListener('vite:preloadError', (e) => {
  try {
    if (Number(sessionStorage.getItem('sdej-reloaded')) > Date.now() - 10_000) return
    sessionStorage.setItem('sdej-reloaded', String(Date.now()))
  } catch { return }
  e.preventDefault()
  location.reload()
})

// Phones keep the app in memory for days: look for a new version each time it comes back on screen.
// autoUpdate then reloads the page into it.
registerSW({
  immediate: true,
  onRegisteredSW(_url, r) {
    if (r) document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') r.update() })
  },
})

// HashRouter keeps the page path after "#" (for example /sde-journey/#/notes).
// GitHub Pages only knows about index.html, so this is what makes refresh work.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
