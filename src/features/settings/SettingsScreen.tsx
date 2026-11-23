import { useEffect, useState, type ReactNode } from 'react'
import { Card, Screen } from '../../components/Screen'
import { countRecords, exportBackup, importBackup, markBackedUp, validateBackup, type Backup } from '../../data/backup'
import { getDiagnostics } from '../../data/diagnostics'
import { toDateKey } from '../../data/dates'
import { setSetting, useSetting, type Theme } from '../../data/repos/settings'

type Diagnostics = Awaited<ReturnType<typeof getDiagnostics>>

const btn = 'min-h-11 rounded-card px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-50'
const primary = `${btn} bg-bamboo text-on-bamboo`
const quiet = `${btn} border border-line bg-surface`

const fmtDate = (t?: number) => (t ? new Date(t).toLocaleString() : 'Never')
const fmtMB = (b?: number) => (b === undefined ? '—' : `${(b / 1_048_576).toFixed(1)} MB`)

async function saveFile(backup: Backup): Promise<boolean> {
  const file = new File([JSON.stringify(backup)], `kaizen-backup-${toDateKey()}.json`, { type: 'application/json' })
  // On iPhone the share sheet is how you get to "Save to Files"; desktop just downloads.
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return true
    } catch (e) {
      if ((e as Error).name === 'AbortError') return false
      throw e
    }
  }
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(file), download: file.name })
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  return true
}

export function SettingsScreen() {
  const theme = useSetting<Theme>('theme', 'system')
  const [diag, setDiag] = useState<Diagnostics>()
  const [pending, setPending] = useState<Backup>()
  const [message, setMessage] = useState<string>()
  const [busy, setBusy] = useState(false)

  const refresh = () => getDiagnostics().then(setDiag)
  useEffect(() => void refresh(), [])

  const run = async (fn: () => Promise<string | void>) => {
    setBusy(true)
    setMessage(undefined)
    try {
      const m = await fn()
      if (m) setMessage(m)
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setBusy(false)
      void refresh()
    }
  }

  const backUp = () =>
    run(async () => {
      if (!(await saveFile(await exportBackup()))) return 'Backup cancelled.'
      await markBackedUp()
      return 'Backup saved.'
    })

  const pickFile = (file?: File) =>
    file && run(async () => setPending(validateBackup(JSON.parse(await file.text()))))

  const restore = (mode: 'replace' | 'merge') =>
    run(async () => {
      await importBackup(pending!, mode)
      setPending(undefined)
      return mode === 'replace' ? 'Restored from backup.' : 'Backup merged.'
    })

  return (
    <Screen title="Settings">
      <div className="space-y-6">
        <Card>
          <h2 className="mb-3 font-medium">Appearance</h2>
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-card bg-washi p-1">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                role="radio"
                aria-checked={theme === t}
                onClick={() => setSetting('theme', t)}
                className="min-h-10 rounded-[9px] text-sm capitalize text-muted aria-checked:bg-surface aria-checked:text-ink aria-checked:shadow-soft"
              >
                {t}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-medium">Backup</h2>
          <p className="mb-4 mt-1 text-sm text-muted">
            Your data lives only on this device. Last backup: {fmtDate(diag?.lastBackupAt)}
          </p>
          <div className="flex flex-wrap gap-2">
            <button className={primary} onClick={backUp} disabled={busy}>Back up now</button>
            <label className={`${quiet} inline-flex cursor-pointer items-center`}>
              Restore…
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                data-testid="restore-input"
                onChange={(e) => {
                  pickFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          {pending && (
            <div className="mt-4 rounded-card border border-sand p-4" role="alertdialog" aria-label="Confirm restore">
              <p className="text-sm">
                Backup from {fmtDate(pending.exportedAt)} with{' '}
                {Object.values(countRecords(pending)).reduce((a, b) => a + b, 0)} records.
              </p>
              <p className="mt-1 text-sm text-muted">
                Replace erases what is on this device first. Merge keeps the newer copy of each record.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={primary} onClick={() => restore('merge')} disabled={busy}>Merge</button>
                <button className={quiet} onClick={() => restore('replace')} disabled={busy}>Replace</button>
                <button className={quiet} onClick={() => setPending(undefined)}>Cancel</button>
              </div>
            </div>
          )}
          {message && <p role="status" className="mt-3 text-sm">{message}</p>}
        </Card>

        <details className="rounded-card border border-line bg-surface p-4" onToggle={refresh}>
          <summary className="cursor-pointer font-medium">Diagnostics</summary>
          {diag && (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm" data-testid="diagnostics">
              <Row k="Storage persisted">{diag.persisted ? 'Yes' : 'No — back up often'}</Row>
              <Row k="Used / available">{fmtMB(diag.usage)} / {fmtMB(diag.quota)}</Row>
              {Object.entries(diag.counts).map(([t, n]) => (
                <Row key={t} k={t}><span data-testid={`count-${t}`}>{n}</span></Row>
              ))}
              <Row k="Build">{__BUILD_TIME__}</Row>
            </dl>
          )}
          {diag && diag.errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-muted">
              {diag.errors.map((e) => <li key={e.at}>{fmtDate(e.at)} — {e.message}</li>)}
            </ul>
          )}
        </details>
      </div>
    </Screen>
  )
}

const Row = ({ k, children }: { k: string; children: ReactNode }) => (
  <>
    <dt className="text-muted">{k}</dt>
    <dd>{children}</dd>
  </>
)
