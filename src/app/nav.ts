import type { IconName } from '../components/Icon'

// One list of every section. The side menu (laptop) and the More page (phone) both read it.
export type NavItem = { to: string; label: string; icon: IconName; hint: string }

export const NAV: NavItem[] = [
  { to: '/', label: 'Today', icon: 'sun', hint: 'Your checklist for today' },
  { to: '/roadmap', label: 'Roadmap', icon: 'map', hint: '65 weeks, step by step' },
  { to: '/performance', label: 'Performance', icon: 'chart', hint: 'Pace, graphs, strengths and weak spots' },
  { to: '/notes', label: 'Notes', icon: 'book', hint: 'Basic to advanced notes' },
  { to: '/patterns', label: 'Patterns', icon: 'puzzle', hint: 'DSA patterns and clues' },
  { to: '/viz', label: 'Visualizers', icon: 'play', hint: 'See data structures move' },
  { to: '/games', label: 'Games', icon: 'game', hint: 'Pattern Guess, Big-O, Code Order' },
  { to: '/cards', label: 'Flashcards', icon: 'cards', hint: 'Spaced repetition review' },
  { to: '/badges', label: 'Badges', icon: 'trophy', hint: 'Levels and badges' },
  { to: '/focus', label: 'Focus', icon: 'timer', hint: '45/10 focus timer' },
  { to: '/timetable', label: 'Timetable', icon: 'clock', hint: 'Your daily plan' },
  { to: '/review', label: 'Weekly review', icon: 'check', hint: 'Sunday review form' },
  { to: '/resources', label: 'Resources', icon: 'link', hint: 'Free courses and sites' },
  { to: '/projects', label: 'Projects', icon: 'hammer', hint: 'Portfolio ladder' },
  { to: '/ai-tutor', label: 'AI as tutor', icon: 'spark', hint: 'Prompts that teach, not solve' },
  { to: '/career', label: 'Career', icon: 'brief', hint: 'Hiring, resume, mocks' },
  { to: '/settings', label: 'Settings', icon: 'gear', hint: 'Backup, plan dates' },
]

// The five tabs at the bottom of the phone screen.
const nav = (to: string) => NAV.find((n) => n.to === to)!
export const TABS: NavItem[] = [
  nav('/'),
  nav('/roadmap'),
  nav('/notes'),
  nav('/focus'),
  { to: '/more', label: 'More', icon: 'grid', hint: '' },
]
