import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { KaizenDB } from '../db'
import { createEntry, isEmpty, listEntries, matches, removeEntry, updateEntry } from './journal'

const freshDb = () => new KaizenDB(`test-${crypto.randomUUID()}`)

describe('journal repo', () => {
  it('creates several entries a day, newest first, and strips blank prompts', async () => {
    const db = freshDb()
    const a = await createEntry({ text: 'first' }, db)
    await new Promise((r) => setTimeout(r, 2))
    const b = await createEntry({ text: '', prompts: { grateful: 'tea', learned: '  ' } }, db)
    expect(a.date).toBe(b.date)
    expect(b.prompts).toEqual({ grateful: 'tea' })
    expect((await listEntries(db)).map((e) => e.id)).toEqual([b.id, a.id])
  })

  it('edits and soft-deletes', async () => {
    const db = freshDb()
    const e = await createEntry({ text: 'draft' }, db)
    await updateEntry(e.id, { text: 'final' }, db)
    expect((await listEntries(db))[0].text).toBe('final')
    await removeEntry(e.id, db)
    expect(await listEntries(db)).toHaveLength(0)
    expect(await db.journal.count()).toBe(1)
  })

  it('searches text and prompt answers', async () => {
    const db = freshDb()
    const e = await createEntry({ text: 'Long walk', prompts: { learned: 'Patience pays' } }, db)
    expect(matches(e, 'walk')).toBe(true)
    expect(matches(e, 'PATIENCE')).toBe(true)
    expect(matches(e, 'nothing')).toBe(false)
    expect(matches(e, ' ')).toBe(true)
  })

  it('knows an empty entry', () => {
    expect(isEmpty({ text: ' ', prompts: { learned: '' } })).toBe(true)
    expect(isEmpty({ text: '', prompts: { learned: 'x' } })).toBe(false)
  })
})
