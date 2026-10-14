import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './app/App.tsx'

// HashRouter keeps the page path after "#" (for example /sde-journey/#/notes).
// GitHub Pages only knows about index.html, so this is what makes refresh work.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
