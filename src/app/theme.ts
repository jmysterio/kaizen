import { useSyncExternalStore } from 'react'

export type Theme = 'morning' | 'day' | 'evening'
export type ThemeChoice = 'auto' | Theme

export const THEMES: { id: ThemeChoice; label: string }[] = [
  { id: 'auto', label: 'Automatic' },
  { id: 'morning', label: 'Morning' },
  { id: 'day', label: 'Daytime' },
  { id: 'evening', label: 'Evening' },
]

// Keep these boundaries in sync with the inline script in index.html (it runs before React to avoid a flash).
export const themeForHour = (hour: number): Theme => (hour < 11 ? 'morning' : hour < 17 ? 'day' : 'evening')

/** Older saved values (system/light/dark) fall back to Automatic. */
export const resolveTheme = (choice: unknown, hour = new Date().getHours()): Theme =>
  choice === 'morning' || choice === 'day' || choice === 'evening' ? choice : themeForHour(hour)

/** Sets the theme on <html>, the browser bar colour, and a localStorage copy for the next cold start. */
export function applyTheme(choice: unknown) {
  const theme = resolveTheme(choice)
  document.documentElement.dataset.theme = theme
  const canvas = getComputedStyle(document.documentElement).getPropertyValue('--k-canvas').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', canvas)
  try {
    localStorage.setItem('kaizen.theme', String(choice))
  } catch {
    // Storage blocked: the next launch just starts on Automatic.
  }
  return theme
}

const watchTheme = (cb: () => void) => {
  const o = new MutationObserver(cb)
  o.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => o.disconnect()
}

/** The theme currently on screen. */
export const useTheme = () =>
  useSyncExternalStore(watchTheme, () => (document.documentElement.dataset.theme as Theme) ?? 'day')
