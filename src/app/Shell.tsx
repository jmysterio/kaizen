import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { getSetting } from '../data/repos/settings'
import { ROUTES } from './routes'
import { href, useRoute } from './router'
import { applyTheme, useTheme } from './theme'
import { usePhoto } from '../data/repos/photos'

export function Shell() {
  const routeId = useRoute()
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0]
  const active = route.more ? 'more' : route.id
  // undefined while loading: index.html already applied the cached choice, so don't flash a default.
  const themeChoice = useLiveQuery(() => getSetting('theme', 'auto'))

  useEffect(() => {
    if (themeChoice === undefined) return
    applyTheme(themeChoice)
    // Automatic re-checks the time only when you come back to the app, never mid-task.
    const onReturn = () => document.visibilityState === 'visible' && applyTheme(themeChoice)
    document.addEventListener('visibilitychange', onReturn)
    return () => document.removeEventListener('visibilitychange', onReturn)
  }, [themeChoice])

  useEffect(() => {
    scrollTo(0, 0) // returns a Promise in newer browsers; must not become the effect cleanup
  }, [route.id])

  const photo = usePhoto(useTheme())

  const Screen = route.screen
  return (
    <div className="min-h-dvh md:flex">
      {/* Time-of-day photo behind every page (not the sidebar); the canvas tint keeps loose text readable. */}
      <div aria-hidden className="fixed inset-0 -z-10 md:left-56">
        <img key={photo} src={photo} alt="" className="size-full object-cover" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
        <div className="absolute inset-0 bg-canvas/45" />
      </div>
      {/* Desktop sidebar */}
      <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-56 shrink-0 border-r border-line bg-canvas px-3 py-8 md:block">
        <p className="mb-8 px-3 text-sm font-semibold tracking-[0.2em] text-ink-muted">KAIZEN</p>
        <ul className="space-y-1">
          {ROUTES.filter((r) => r.id !== 'more').map((r) => (
            <li key={r.id}>
              <a
                href={href(r.id)}
                aria-current={r.id === route.id ? 'page' : undefined}
                className="flex items-center gap-3 rounded-card px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink aria-[current=page]:bg-surface aria-[current=page]:text-ink"
              >
                <r.icon size={18} strokeWidth={1.75} aria-hidden />
                {r.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 flex-1 pt-[env(safe-area-inset-top)]">
        <Screen />
      </div>

      {/* iPhone tab bar — the one place glass is used */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 border-t border-line bg-glass pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      >
        <ul className="mx-auto flex max-w-lg">
          {ROUTES.filter((r) => r.tab).map((r) => (
            <li key={r.id} className="flex-1">
              <a
                href={href(r.id)}
                aria-current={r.id === active ? 'page' : undefined}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] text-ink-muted transition-colors duration-200 aria-[current=page]:text-ink"
              >
                <r.icon size={22} strokeWidth={1.75} aria-hidden />
                {r.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
