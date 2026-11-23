import { useLiveQuery } from 'dexie-react-hooks'
import { db as shared, type KaizenDB } from '../db'
import { toDateKey } from '../dates'
import { makeRepo } from '../repo'
import type { JournalEntry, PromptKey } from '../types'

export const PROMPTS: { key: PromptKey; label: string }[] = [
  { key: 'accomplished', label: 'What did I accomplish?' },
  { key: 'learned', label: 'What did I learn?' },
  { key: 'better', label: 'What could I do better?' },
  { key: 'grateful', label: 'What am I grateful for?' },
  { key: 'improve', label: 'One small improvement for tomorrow' },
]

export type EntryContent = Pick<JournalEntry, 'text' | 'prompts'>

const repo = (db: KaizenDB) => makeRepo(db.journal)

/** Drops blank prompt answers so an entry only stores what was written. */
const clean = ({ text, prompts }: EntryContent): EntryContent => {
  const kept = Object.entries(prompts ?? {}).filter(([, v]) => v?.trim())
  return { text, prompts: kept.length ? (Object.fromEntries(kept) as EntryContent['prompts']) : undefined }
}

export const isEmpty = (c: EntryContent) => !c.text.trim() && !clean(c).prompts

export const createEntry = (c: EntryContent, db = shared) =>
  repo(db).create({ date: toDateKey(), ...clean(c) })

export const updateEntry = (id: string, c: EntryContent, db = shared) => repo(db).update(id, clean(c))

export const removeEntry = (id: string, db = shared) => repo(db).remove(id)

/** Newest first. */
export const listEntries = async (db = shared) =>
  (await repo(db).all()).sort((a, b) => b.createdAt - a.createdAt)

export const useEntries = () => useLiveQuery(() => listEntries(), [])

/** Case-insensitive match over free text and every prompt answer. */
export const matches = (e: JournalEntry, query: string) => {
  const q = query.trim().toLowerCase()
  return !q || [e.text, ...Object.values(e.prompts ?? {})].some((s) => s?.toLowerCase().includes(q))
}
