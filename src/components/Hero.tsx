import { useState, type ReactNode } from 'react'
import { useTheme, type Theme } from '../app/theme'
import { usePhoto } from '../data/repos/photos'

// Text over a photo is always light, whatever the theme (the scrim keeps it readable).
const ON_PHOTO = 'text-[#f8f7f3]'

const COPY: Record<Theme, [string, string]> = {
  morning: ['Good morning', 'What matters today?'],
  day: ['Stay with what matters', 'One thing at a time.'],
  evening: ['Take a moment', 'What went well today?'],
}

/**
 * Atmospheric header (DESIGN_SYSTEM.md §6). Text sits on a scrim over the photo; if the photo is missing
 * or fails, it falls back to a quiet mist panel with normal ink text, so contrast holds either way.
 */
export function Hero({ children }: { children?: ReactNode }) {
  const theme = useTheme()
  const src = usePhoto(theme)
  const [loaded, setLoaded] = useState<string>()
  const [failed, setFailed] = useState<string>()
  const [today] = useState(() => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))
  const photo = loaded === src
  const [greeting, line] = COPY[theme]

  return (
    <header className="relative -mx-5 mb-8 overflow-hidden bg-mist md:mx-0 md:rounded-sheet">
      {failed !== src && (
      <img
        src={src}
        alt=""
        onLoad={() => setLoaded(src)}
        onError={() => setFailed(src)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${photo ? 'opacity-100' : 'opacity-0'}`}
      />
      )}
      {photo && <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/60" aria-hidden />}
      <div className={`relative flex min-h-64 flex-col justify-end px-5 pb-6 pt-12 md:min-h-72 md:px-8 ${photo ? ON_PHOTO : 'text-ink'}`}>
        <p className={`text-sm ${photo ? `${ON_PHOTO} opacity-85` : 'text-ink-muted'}`}>
          {today}
        </p>
        <h1 className="mt-1 font-display text-3xl font-normal tracking-tight">{greeting}</h1>
        <p className={`mt-1 ${photo ? `${ON_PHOTO} opacity-90` : 'text-ink-muted'}`}>{line}</p>
        {children}
      </div>
    </header>
  )
}
