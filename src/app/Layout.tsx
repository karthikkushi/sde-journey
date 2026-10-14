import { Suspense, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Icon } from '../components/Icon'
import { applyTheme, nextTheme, readTheme } from '../lib/theme'
import { NAV, TABS } from './nav'

// The frame around every page: side menu on laptop, bottom tabs on phone.
export function Layout() {
  const [theme, setTheme] = useState(readTheme)
  const { pathname } = useLocation()

  function cycleTheme() {
    const t = nextTheme(theme)
    applyTheme(t)
    setTheme(t)
  }

  const themeIcon = theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'auto'

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="26" height="26" />
          SDE Journey
        </NavLink>
        <button className="icon-btn" onClick={cycleTheme} aria-label={`Theme: ${theme}. Tap to change.`} title={`Theme: ${theme}`}>
          <Icon name={themeIcon} />
        </button>
      </header>

      <nav className="sidenav" aria-label="Sections">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="sidenav-link">
            <Icon name={n.icon} size={20} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <main className="main">
        {/* A new key on every page change clears an old error. */}
        <ErrorBoundary key={pathname}>
          {/* Pages download on first visit; the menu stays visible meanwhile. */}
          <Suspense fallback={<p className="muted">Loading…</p>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <nav className="tabbar" aria-label="Main">
        {TABS.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="tab">
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
