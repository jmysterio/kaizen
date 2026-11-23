import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { countRecords, exportBackup, importBackup, validateBackup } from './backup'
import { KaizenDB } from './db'
import { makeRepo } from './repo'
import fixture from './__fixtures__/v1.json'

const freshDb = () => new KaizenDB(`test-${crypto.randomUUID()}`)

describe('makeRepo', () => {
  it('creates, updates and soft-deletes', async () => {
    const db = freshDb()
    const repo = makeRepo(db.journal)
    const e = await repo.create({ date: '2027-01-01', text: 'hi' })
    expect(e.id).toMatch(/[0-9a-f-]{36}/)
    await repo.update(e.id, { text: 'hello' })
    expect((await repo.get(e.id))?.text).toBe('hello')
    await repo.remove(e.id)
    expect(await repo.get(e.id)).toBeUndefined()
    expect(await repo.all()).toHaveLength(0)
    expect(await db.journal.count()).toBe(1) // still there for recovery
  })
})

describe('backup', () => {
  it('round-trips: export → JSON → validate → replace into an empty db', async () => {
    const src = freshDb()
    await importBackup(validateBackup({ app: 'kaizen', schemaVersion: 1, exportedAt: 0, tables: fixture }), 'replace', src)
    const json = JSON.stringify(await exportBackup(src))

    const dest = freshDb()
    await importBackup(validateBackup(JSON.parse(json)), 'replace', dest)
    expect(await exportBackup(dest).then((b) => b.tables)).toEqual(await exportBackup(src).then((b) => b.tables))
    expect(countRecords(validateBackup(JSON.parse(json))).journal).toBe(2)
  })

  it('merge keeps the newer copy and adds missing records', async () => {
    const db = freshDb()
    await db.journal.bulkAdd([
      { id: 'a', createdAt: 1, updatedAt: 10, date: '2027-01-01', text: 'local newer' },
      { id: 'b', createdAt: 1, updatedAt: 1, date: '2027-01-01', text: 'local older' },
    ])
    await importBackup(
      validateBackup({
        app: 'kaizen', schemaVersion: 1, exportedAt: 0,
        tables: { journal: [
          { id: 'a', createdAt: 1, updatedAt: 5, date: '2027-01-01', text: 'backup older' },
          { id: 'b', createdAt: 1, updatedAt: 9, date: '2027-01-01', text: 'backup newer' },
          { id: 'c', createdAt: 1, updatedAt: 1, date: '2027-01-01', text: 'missing' },
        ] },
      }),
      'merge', db,
    )
    expect((await db.journal.get('a'))?.text).toBe('local newer')
    expect((await db.journal.get('b'))?.text).toBe('backup newer')
    expect(await db.journal.count()).toBe(3)
  })

  it('rejects bad files without touching data', async () => {
    expect(() => validateBackup({})).toThrow('Not a Kaizen backup')
    expect(() => validateBackup({ app: 'kaizen', schemaVersion: 99, tables: {} })).toThrow('newer version')
    expect(() => validateBackup({ app: 'kaizen', schemaVersion: 1, tables: { nope: [] } })).toThrow('Unknown table')
    expect(() => validateBackup({ app: 'kaizen', schemaVersion: 1, tables: { journal: [{ text: 'x' }] } })).toThrow('missing its id')
  })

  it('a failed replace rolls back', async () => {
    const db = freshDb()
    await db.journal.add({ id: 'keep', createdAt: 1, updatedAt: 1, date: '2027-01-01', text: 'safe' })
    // duplicate ids make bulkAdd fail mid-transaction
    const bad = { app: 'kaizen' as const, schemaVersion: 1, exportedAt: 0, tables: { journal: [fixture.journal[0], fixture.journal[0]] } }
    await expect(importBackup(bad, 'replace', db)).rejects.toThrow()
    expect((await db.journal.get('keep'))?.text).toBe('safe')
  })
})
