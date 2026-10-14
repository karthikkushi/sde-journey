// Theme: "system" follows the phone setting. "light" and "dark" force one look.
// The choice lives in its own localStorage key (not in progress), so it is not exported.
export type Theme = 'system' | 'light' | 'dark'

const KEY = 'sdej-theme'

export function readTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function applyTheme(t: Theme) {
  const root = document.documentElement
  if (t === 'system') delete root.dataset.theme
  else root.dataset.theme = t
  try {
    if (t === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, t)
  } catch {
    // Storage blocked (private mode). The theme still works until the page closes.
  }
}

// system -> light -> dark -> system
export const nextTheme = (t: Theme): Theme => (t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system')
