import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { KaizenDB, SCHEMAS, SCHEMA_VERSION } from './db'

// Each published schema version has a fixture of realistic data at that version.
// Adding schema v2? Add __fixtures__/v2.json; this test then proves v1→latest and v2→latest lose nothing.
const fixtures = import.meta.glob<Record<string, Record<string, unknown>[]>>('./__fixtures__/v*.json', {
  eager: true,
  import: 'default',
})

describe('schema migrations', () => {
  for (const v of Object.keys(SCHEMAS).map(Number)) {
    it(`upgrades v${v} data to v${SCHEMA_VERSION} without losing records`, async () => {
      const data = fixtures[`./__fixtures__/v${v}.json`]
      expect(data, `missing __fixtures__/v${v}.json`).toBeDefined()
      const name = `migrate-${v}-${crypto.randomUUID()}`

      const old = new Dexie(name)
      for (let i = 1; i <= v; i++) old.version(i).stores(SCHEMAS[i])
      await old.open()
      for (const [t, rows] of Object.entries(data)) await old.table(t).bulkAdd(rows)
      old.close()

      const db = new KaizenDB(name)
      for (const [t, rows] of Object.entries(data)) {
        expect(await db.table(t).count(), t).toBe(rows.length)
      }
      expect((await db.journal.get('j1'))?.text).toBe('First entry')
      db.close()
    })
  }
})
