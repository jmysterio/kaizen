import { useLiveQuery } from 'dexie-react-hooks'
import { db as shared, type KaizenDB } from '../db'
import { toDateKey } from '../dates'
import { makeRepo } from '../repo'
import type { Answer, JournalEntry, JournalForm, PromptKey } from '../types'
import { getSetting, setSetting, useSetting } from './settings'

/** Suggested forms: plan in the morning, check during the day, reflect at night. Editable in Settings. */
export const DEFAULT_FORMS: JournalForm[] = [
  {
    id: 'morning',
    name: 'Morning intentions',
    questions: [
      'What one result would make today a success?',
      'How will I get there? What is my first step?',
      'What could get in the way, and how will I handle it?',
      'Whose help or what resources do I need?',
      'Which habit or goal am I moving forward today?',
    ],
  },
  {
    id: 'progress',
    name: 'Daily progress',
    questions: [
      'What am I working on, and is it going as expected?',
      'Where is it slowing down or breaking down?',
      'What step could I simplify, skip or automate?',
      'What have I noticed that is worth remembering?',
      'What small adjustment will I try next?',
    ],
  },
  {
    id: 'evening',
    name: 'Evening reflection',
    questions: [
      'What did I accomplish today?',
      'Did today’s improvement work? How do I know?',
      'What did I learn, and what would I do differently?',
      'What am I grateful for?',
      'What is one small improvement for tomorrow?',
    ],
  },
]

const FORMS_KEY = 'journalForms'
export const getForms = () => getSetting<JournalForm[]>(FORMS_KEY, DEFAULT_FORMS)
export const saveForms = (forms: JournalForm[]) => setSetting(FORMS_KEY, forms)
export const useForms = () => useSetting<JournalForm[]>(FORMS_KEY, DEFAULT_FORMS)

/** Morning before 11, evening from 17, progress in between — if that form still exists. */
export const suggestedFormId = (forms: JournalForm[], hour = new Date().getHours()) => {
  const id = hour < 11 ? 'morning' : hour >= 17 ? 'evening' : 'progress'
  return forms.some((f) => f.id === id && f.questions.length) ? id : null
}

const LEGACY: Record<PromptKey, string> = {
  accomplished: 'What did I accomplish?',
  learned: 'What did I learn?',
  better: 'What could I do better?',
  grateful: 'What am I grateful for?',
  improve: 'One small improvement for tomorrow',
}

/** Question/answer pairs for any entry, including ones written with the old fixed prompts. */
export const answersOf = (e: Pick<JournalEntry, 'answers' | 'prompts'>): Answer[] =>
  e.answers ??
  (Object.keys(LEGACY) as PromptKey[])
    .filter((k) => e.prompts?.[k])
    .map((k) => ({ question: LEGACY[k], answer: e.prompts![k]! }))

export type EntryContent = Pick<JournalEntry, 'text' | 'form' | 'answers'>

/** Drops blank answers so an entry only stores what was written; no answers means no form. */
const clean = ({ text, form, answers }: EntryContent): EntryContent => {
  const kept = (answers ?? []).filter((a) => a.answer.trim())
  return kept.length ? { text, form, answers: kept } : { text, form: undefined, answers: undefined }
}

export const isEmpty = (c: EntryContent) => !c.text.trim() && !clean(c).answers

const repo = (db: KaizenDB) => makeRepo(db.journal)

export const createEntry = (c: EntryContent, db = shared) => repo(db).create({ date: toDateKey(), ...clean(c) })

/** Editing keeps blank answers so a cleared box can be refilled; empty ones are hidden when shown. */
export const updateEntry = (id: string, c: Partial<EntryContent>, db = shared) => repo(db).update(id, c)

export const removeEntry = (id: string, db = shared) => repo(db).remove(id)

/** Newest first. */
export const listEntries = async (db = shared) => (await repo(db).all()).sort((a, b) => b.createdAt - a.createdAt)

export const useEntries = () => useLiveQuery(() => listEntries(), [])

/** Case-insensitive match over free text, answers and the form name. */
export const matches = (e: JournalEntry, query: string) => {
  const q = query.trim().toLowerCase()
  return !q || [e.text, e.form, ...answersOf(e).map((a) => a.answer)].some((s) => s?.toLowerCase().includes(q))
}
