import { ChevronRight } from 'lucide-react'
import { ROUTES } from '../../app/routes'
import { href } from '../../app/router'
import { Screen } from '../../components/Screen'

export function MoreScreen() {
  return (
    <Screen title="More">
      <ul className="overflow-hidden glass rounded-card">
        {ROUTES.filter((r) => r.more).map((r) => (
          <li key={r.id} className="border-b border-line last:border-0">
            <a href={href(r.id)} className="flex min-h-14 items-center gap-3 px-4">
              <r.icon size={20} strokeWidth={1.75} className="text-ink-muted" aria-hidden />
              <span className="flex-1">{r.label}</span>
              <ChevronRight size={18} className="text-ink-muted" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
