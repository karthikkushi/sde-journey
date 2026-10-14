import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Icon } from '../components/Icon'
import { applyTheme, nextTheme, readTheme } from '../lib/theme'
import { NAV_GROUPS, TABS, mobileTabFor } from './nav'

// The frame around every page: side menu on laptop, bottom tabs on phone.
export function Layout() {
  const [theme, setTheme] = useState(readTheme)
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [pathname])

  function cycleTheme() {
    const t = nextTheme(theme)
    applyTheme(t)
    setTheme(t)
  }

  const themeIcon = theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'auto'

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main-content')?.focus()
      }}>Skip to content</a>
      <header className="topbar">
        <NavLink to="/" className="brand">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="26" height="26" />
          SDE Journey
        </NavLink>
        <span className="workspace-label">Your learning workspace</span>
        <div className="topbar-actions">
          <Link to="/notes" className="search-link"><Icon name="book" size={17} /><span>Find a note</span><span aria-hidden="true">↗</span></Link>
          <button className="icon-btn" onClick={cycleTheme} aria-label={`Theme: ${theme}. Tap to change.`} title={`Theme: ${theme}`}>
            <Icon name={themeIcon} size={20} />
          </button>
        </div>
      </header>

      <nav className="sidenav" aria-label="Sections">
        {NAV_GROUPS.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className="sidenav-link">
                <Icon name={n.icon} size={18} />{n.label}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="sidebar-note"><Icon name="book" size={18} /><span>Learn it. Build it. Make it yours.</span></div>
      </nav>

      <main className="main" id="main-content" tabIndex={-1}>
        {/* A new key on every page change clears an old error. */}
        <ErrorBoundary key={pathname}>
          {/* Pages download on first visit; the menu stays visible meanwhile. */}
          <Suspense fallback={<div className="page-loading" role="status"><span className="loading-mark" />Opening your workspace…</div>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <nav className="tabbar" aria-label="Main">
        {TABS.map((n) => (
          <Link key={n.to} to={n.to} aria-current={mobileTabFor(pathname) === n.to ? 'page' : undefined} className={`tab${mobileTabFor(pathname) === n.to ? ' active' : ''}`}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
