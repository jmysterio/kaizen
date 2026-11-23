import { useState } from 'react'
import { THEMES, type Theme } from '../../app/theme'
import { Card } from '../../components/Screen'
import { quiet } from '../../components/styles'
import { clearPhoto, setPhoto, useCustomPhoto, usePhoto } from '../../data/repos/photos'

function PhotoRow({ theme, label }: { theme: Theme; label: string }) {
  const src = usePhoto(theme)
  const custom = useCustomPhoto(theme)
  const [error, setError] = useState<string>()

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-card bg-mist">
        <img src={src} alt="" className="size-full object-cover" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
      </div>
      <div className="min-w-0 flex-1">
        <p>{label}</p>
        <p className="text-xs text-ink-muted">{error ?? (custom ? 'Your photo' : 'Default')}</p>
      </div>
      <label className={`${quiet} inline-flex cursor-pointer items-center`}>
        Choose…
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label={`Choose ${label} photo`}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) setPhoto(theme, file).then(() => setError(undefined), () => setError('Couldn’t read that photo.'))
          }}
        />
      </label>
      {custom && (
        <button className={quiet} onClick={() => clearPhoto(theme)} aria-label={`Use default ${label} photo`}>
          Reset
        </button>
      )}
    </li>
  )
}

/** Per-theme photos for the Today header. Stored on this device and included in backups. */
export function Atmosphere() {
  return (
    <Card>
      <h2 className="font-medium">Atmosphere</h2>
      <p className="mt-1 text-sm text-ink-muted">Photos for the Today header. Yours stay on this device and are included in backups.</p>
      <ul className="mt-2 divide-y divide-line">
        {THEMES.filter((t) => t.id !== 'auto').map((t) => (
          <PhotoRow key={t.id} theme={t.id as Theme} label={t.label} />
        ))}
      </ul>
    </Card>
  )
}
