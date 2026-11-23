import { useEffect } from 'react'
import { useSetting, type Theme } from '../data/repos/settings'
import { ROUTES } from './routes'
import { href, useRoute } from './router'

export function Shell() {
  const routeId = useRoute()
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0]
  const active = route.more ? 'more' : route.id
  const theme = useSetting<Theme>('theme', 'system')

  useEffect(() => {
    if (theme === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    scrollTo(0, 0) // returns a Promise in newer browsers; must not become the effect cleanup
  }, [route.id])

  const Screen = route.screen
  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-56 shrink-0 border-r border-line px-3 py-8 md:block">
        <p className="mb-8 px-3 text-sm font-semibold tracking-[0.2em] text-muted">KAIZEN</p>
        <ul className="space-y-1">
          {ROUTES.filter((r) => r.id !== 'more').map((r) => (
            <li key={r.id}>
              <a
                href={href(r.id)}
                aria-current={r.id === route.id ? 'page' : undefined}
                className="flex items-center gap-3 rounded-card px-3 py-2 text-sm text-muted transition-colors duration-200 hover:text-ink aria-[current=page]:bg-surface aria-[current=page]:text-ink"
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
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] text-muted transition-colors duration-200 aria-[current=page]:text-bamboo"
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
