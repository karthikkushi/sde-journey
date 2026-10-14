import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router'
import { Checkpoint } from '../pages/Checkpoint'
import { Focus } from '../pages/Focus'
import { More } from '../pages/More'
import { Roadmap } from '../pages/Roadmap'
import { Settings } from '../pages/Settings'
import { Soon } from '../pages/Soon'
import { Today } from '../pages/Today'
import { Week } from '../pages/Week'
import { Layout } from './Layout'
import { NAV } from './nav'

// Pages that are built. Everything else in NAV shows "coming soon".
const PAGES: Record<string, ReactNode> = {
  '/': <Today />,
  '/roadmap': <Roadmap />,
  '/settings': <Settings />,
}

export default function App() {
  return (
    <Routes>
      {/* Focus mode is full screen: no menu, no tabs. */}
      <Route path="/focus" element={<Focus />} />
      <Route element={<Layout />}>
        {NAV.filter((n) => n.to !== '/focus').map((n) => (
          <Route key={n.to} path={n.to} element={PAGES[n.to] ?? <Soon title={n.label} hint={n.hint} />} />
        ))}
        <Route path="/roadmap/week/:n" element={<Week />} />
        <Route path="/checkpoint/:m" element={<Checkpoint />} />
        <Route path="/more" element={<More />} />
        <Route path="*" element={<Soon title="Page not found" hint="This page does not exist yet." />} />
      </Route>
    </Routes>
  )
}
