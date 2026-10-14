import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { Route, Routes } from 'react-router'
import { More } from '../pages/More'
import { Soon } from '../pages/Soon'
import { Today } from '../pages/Today'
import { Celebrations } from '../components/Celebrations'
import { Layout } from './Layout'
import { NAV } from './nav'

// Today loads at once. Every other page is downloaded only when you open it,
// so the first load on a phone stays small. (The PWA still caches all of them for offline use.)
const page = <T extends Record<string, ComponentType>>(load: () => Promise<T>, name: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[name] })))

const Roadmap = page(() => import('../pages/Roadmap'), 'Roadmap')
const Week = page(() => import('../pages/Week'), 'Week')
const Checkpoint = page(() => import('../pages/Checkpoint'), 'Checkpoint')
const Settings = page(() => import('../pages/Settings'), 'Settings')
const Focus = page(() => import('../pages/Focus'), 'Focus')
const Notes = page(() => import('../pages/Notes'), 'Notes')
const NoteView = page(() => import('../pages/NoteView'), 'NoteView')
const Patterns = page(() => import('../pages/Patterns'), 'Patterns')
const PatternView = page(() => import('../pages/Patterns'), 'PatternView')
const CheatSheet = page(() => import('../pages/Patterns'), 'CheatSheet')
const Resources = page(() => import('../pages/Resources'), 'Resources')
const Projects = page(() => import('../pages/Projects'), 'Projects')
const ProjectView = page(() => import('../pages/Projects'), 'ProjectView')
const Earning = page(() => import('../pages/Projects'), 'Earning')
const Timetable = page(() => import('../pages/Timetable'), 'Timetable')
const Review = page(() => import('../pages/Review'), 'Review')
const AiTutor = page(() => import('../pages/AiTutor'), 'AiTutor')
const Career = page(() => import('../pages/Career'), 'Career')
const Games = page(() => import('../pages/Games'), 'Games')
const PatternGuess = page(() => import('../pages/Games'), 'PatternGuess')
const BigOQuiz = page(() => import('../pages/Games'), 'BigOQuiz')
const CodeOrder = page(() => import('../pages/Games'), 'CodeOrder')
const Cards = page(() => import('../pages/Cards'), 'Cards')
const Badges = page(() => import('../pages/Badges'), 'Badges')
const VizList = page(() => import('../pages/Viz'), 'VizList')
const VizView = page(() => import('../pages/Viz'), 'VizView')

// Pages that are built. Everything else in NAV shows "coming soon".
const PAGES: Record<string, ReactNode> = {
  '/': <Today />,
  '/roadmap': <Roadmap />,
  '/notes': <Notes />,
  '/patterns': <Patterns />,
  '/resources': <Resources />,
  '/projects': <Projects />,
  '/timetable': <Timetable />,
  '/review': <Review />,
  '/ai-tutor': <AiTutor />,
  '/career': <Career />,
  '/games': <Games />,
  '/cards': <Cards />,
  '/badges': <Badges />,
  '/viz': <VizList />,
  '/settings': <Settings />,
}

const loading = <p className="muted" style={{ padding: 16 }}>Loading…</p>

export default function App() {
  return (
    <Suspense fallback={loading}>
      <Celebrations />
      <Routes>
        {/* Focus mode is full screen: no menu, no tabs. */}
        <Route path="/focus" element={<Focus />} />
        <Route element={<Layout />}>
          {NAV.filter((n) => n.to !== '/focus').map((n) => (
            <Route key={n.to} path={n.to} element={PAGES[n.to] ?? <Soon title={n.label} hint={n.hint} />} />
          ))}
          <Route path="/roadmap/week/:n" element={<Week />} />
          <Route path="/checkpoint/:m" element={<Checkpoint />} />
          <Route path="/notes/:id" element={<NoteView />} />
          <Route path="/patterns/cheatsheet" element={<CheatSheet />} />
          <Route path="/patterns/:id" element={<PatternView />} />
          <Route path="/projects/:id" element={<ProjectView />} />
          <Route path="/earning" element={<Earning />} />
          <Route path="/games/pattern" element={<PatternGuess />} />
          <Route path="/games/bigo" element={<BigOQuiz />} />
          <Route path="/games/order" element={<CodeOrder />} />
          <Route path="/viz/:id" element={<VizView />} />
          <Route path="/more" element={<More />} />
          <Route path="*" element={<Soon title="Page not found" hint="This page does not exist yet." />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
