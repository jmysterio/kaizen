import { useState, type ReactNode } from 'react'
import { useTheme, type Theme } from '../app/theme'

const COPY: Record<Theme, [string, string]> = {
  morning: ['Good morning', 'What matters today?'],
  day: ['Stay with what matters', 'One thing at a time.'],
  evening: ['Take a moment', 'What went well today?'],
}

/** Today's greeting for the time of day. The photo itself is the app background (Shell). */
export function Hero({ children }: { children?: ReactNode }) {
  const [greeting, line] = COPY[useTheme()]
  const [today] = useState(() => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))

  return (
    <header className="mb-8 mt-12 glass rounded-sheet p-5 md:mt-0">
      <p className="text-sm text-ink-muted">{today}</p>
      <h1 className="mt-1 font-display text-3xl font-normal tracking-tight">{greeting}</h1>
      <p className="mt-1 text-ink-muted">{line}</p>
      {children}
    </header>
  )
}
