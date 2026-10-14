import { Route, Routes } from 'react-router'
import { More } from '../pages/More'
import { Soon } from '../pages/Soon'
import { Layout } from './Layout'
import { NAV } from './nav'

// Every page of the site. Pages that are not built yet show a "coming soon" card.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {NAV.map((n) => (
          <Route key={n.to} path={n.to} element={<Soon title={n.label} hint={n.hint} />} />
        ))}
        <Route path="/more" element={<More />} />
        <Route path="*" element={<Soon title="Page not found" hint="This page does not exist." />} />
      </Route>
    </Routes>
  )
}
