import { db, TABLES } from './db'

export interface LoggedError { at: number; message: string }

/** Requested once on launch. iOS may still say no; Settings shows the answer. */
export async function requestPersist(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  return (await navigator.storage.persisted()) || navigator.storage.persist()
}

export async function getDiagnostics() {
  const est = await navigator.storage?.estimate?.()
  const counts: Record<string, number> = {}
  for (const t of TABLES) counts[t] = await db.table(t).count()
  return {
    persisted: (await navigator.storage?.persisted?.()) ?? false,
    usage: est?.usage,
    quota: est?.quota,
    counts,
    lastBackupAt: (await db.meta.get('lastBackupAt'))?.value as number | undefined,
    errors: ((await db.meta.get('errors'))?.value as LoggedError[] | undefined) ?? [],
  }
}

/** No Safari Web Inspector on Windows, so errors are kept on-device for the diagnostics panel. */
export function captureErrors() {
  const log = (message: string) =>
    db.meta
      .get('errors')
      .then((r) => {
        const errors = [{ at: Date.now(), message }, ...((r?.value as LoggedError[]) ?? [])].slice(0, 20)
        return db.meta.put({ key: 'errors', value: errors })
      })
      .catch(() => {})
  addEventListener('error', (e) => log(e.message))
  addEventListener('unhandledrejection', (e) => log(String(e.reason)))
}
