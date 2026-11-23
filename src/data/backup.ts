import { db as defaultDb, KaizenDB, SCHEMA_VERSION, TABLES } from './db'

export interface Backup {
  app: 'kaizen'
  schemaVersion: number
  exportedAt: number
  tables: Record<string, Record<string, unknown>[]>
}

const KEY_TABLES = new Set(['settings', 'meta'])
const keyOf = (table: string) => (KEY_TABLES.has(table) ? 'key' : 'id')

export async function exportBackup(db: KaizenDB = defaultDb): Promise<Backup> {
  const tables: Backup['tables'] = {}
  await db.transaction('r', TABLES, async () => {
    for (const t of TABLES) tables[t] = (await db.table(t).toArray()) as Record<string, unknown>[]
  })
  return { app: 'kaizen', schemaVersion: SCHEMA_VERSION, exportedAt: Date.now(), tables }
}

/** Trust boundary: a backup file is user-supplied. Throws a readable message if invalid. */
export function validateBackup(input: unknown): Backup {
  const b = input as Partial<Backup> | null
  if (!b || typeof b !== 'object' || b.app !== 'kaizen') throw new Error('Not a Kaizen backup file.')
  if (typeof b.schemaVersion !== 'number' || b.schemaVersion < 1)
    throw new Error('Backup has no valid schema version.')
  if (b.schemaVersion > SCHEMA_VERSION)
    throw new Error('This backup is from a newer version of Kaizen. Update the app first.')
  if (!b.tables || typeof b.tables !== 'object') throw new Error('Backup has no data.')
  for (const [name, rows] of Object.entries(b.tables)) {
    if (!TABLES.includes(name)) throw new Error(`Unknown table "${name}" in backup.`)
    if (!Array.isArray(rows)) throw new Error(`Table "${name}" is not a list.`)
    const k = keyOf(name)
    for (const r of rows)
      if (!r || typeof r !== 'object' || typeof (r as Record<string, unknown>)[k] !== 'string')
        throw new Error(`A record in "${name}" is missing its ${k}.`)
  }
  return b as Backup
}

export const countRecords = (b: Backup) =>
  Object.fromEntries(Object.entries(b.tables).map(([t, rows]) => [t, rows.length]))

/**
 * replace: wipe and load the backup. merge: add missing records, keep whichever copy is newer.
 * One transaction across all tables, so a failure leaves the database untouched.
 */
// shortcut: older-version backups are loaded as-is; add per-version transforms once a schema change reshapes data.
export async function importBackup(backup: Backup, mode: 'replace' | 'merge', db: KaizenDB = defaultDb) {
  await db.transaction('rw', TABLES, async () => {
    for (const t of TABLES) {
      const table = db.table(t)
      const rows = backup.tables[t] ?? []
      if (mode === 'replace') {
        await table.clear()
        await table.bulkAdd(rows)
        continue
      }
      const k = keyOf(t)
      const existing = await table.bulkGet(rows.map((r) => r[k] as string))
      const newer = rows.filter((r, i) => {
        const cur = existing[i] as Record<string, unknown> | undefined
        return !cur || KEY_TABLES.has(t) || (r.updatedAt as number) > (cur.updatedAt as number)
      })
      await table.bulkPut(newer)
    }
  })
}

export const markBackedUp = (db: KaizenDB = defaultDb) =>
  db.meta.put({ key: 'lastBackupAt', value: Date.now() })
