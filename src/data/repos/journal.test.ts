import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { KaizenDB } from '../db'
import type { JournalEntry } from '../types'
import {
  DEFAULT_FORMS, answersOf, createEntry, isEmpty, listEntries, matches, removeEntry, suggestedFormId, updateEntry,
} from './journal'

const freshDb = () => new KaizenDB(`test-${crypto.randomUUID()}`)
const qa = (question: string, answer: string) => ({ question, answer })

describe('journal repo', () => {
  it('creates several entries a day, newest first, keeping only answered questions', async () => {
    const db = freshDb()
    const a = await createEntry({ text: 'first' }, db)
    await new Promise((r) => setTimeout(r, 2))
    const b = await createEntry({ text: '', form: 'Evening reflection', answers: [qa('Grateful?', 'tea'), qa('Learned?', '  ')] }, db)
    expect(a.date).toBe(b.date)
    expect(b.answers).toEqual([qa('Grateful?', 'tea')])
    expect(b.form).toBe('Evening reflection')
    expect((await listEntries(db)).map((e) => e.id)).toEqual([b.id, a.id])
  })

  it('drops the form name when no question was answered', async () => {
    const e = await createEntry({ text: 'just notes', form: 'Daily progress', answers: [qa('Q', '')] }, freshDb())
    expect(e.form).toBeUndefined()
    expect(e.answers).toBeUndefined()
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

  it('reads entries written with the old fixed prompts', () => {
    const old = { prompts: { grateful: 'Coffee', learned: 'Patience' } } as Pick<JournalEntry, 'prompts'>
    expect(answersOf(old)).toEqual([qa('What did I learn?', 'Patience'), qa('What am I grateful for?', 'Coffee')])
  })

  it('searches text, answers, old prompts and the form name', async () => {
    const e = await createEntry({ text: 'Long walk', form: 'Morning intentions', answers: [qa('Q', 'Patience pays')] }, freshDb())
    expect(matches(e, 'walk')).toBe(true)
    expect(matches(e, 'PATIENCE')).toBe(true)
    expect(matches(e, 'morning')).toBe(true)
    expect(matches(e, 'nothing')).toBe(false)
    expect(matches(e, ' ')).toBe(true)
    expect(matches({ text: '', prompts: { grateful: 'Coffee' } } as JournalEntry, 'coffee')).toBe(true)
  })

  it('knows an empty entry', () => {
    expect(isEmpty({ text: ' ', answers: [qa('Q', '')] })).toBe(true)
    expect(isEmpty({ text: '', answers: [qa('Q', 'x')] })).toBe(false)
  })

  it('suggests a form by time of day, only if it still exists', () => {
    expect(suggestedFormId(DEFAULT_FORMS, 7)).toBe('morning')
    expect(suggestedFormId(DEFAULT_FORMS, 13)).toBe('progress')
    expect(suggestedFormId(DEFAULT_FORMS, 21)).toBe('evening')
    expect(suggestedFormId(DEFAULT_FORMS.filter((f) => f.id !== 'evening'), 21)).toBeNull()
    expect(DEFAULT_FORMS.every((f) => f.questions.length === 5)).toBe(true)
  })
})
