import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, Screen } from '../../components/Screen'
import { toDateKey } from '../../data/dates'
import {
  PROMPTS, createEntry, isEmpty, matches, removeEntry, updateEntry, useEntries, type EntryContent,
} from '../../data/repos/journal'
import type { JournalEntry } from '../../data/types'

const btn = 'min-h-11 rounded-card px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-50'
const primary = `${btn} bg-bamboo text-on-bamboo`
const quiet = `${btn} border border-line bg-surface`
const field =
  'w-full resize-y rounded-card border border-line bg-washi p-3 text-base placeholder:text-muted focus:border-bamboo focus:outline-none'

const DRAFT_KEY = 'kaizen.journal.draft'
type Draft = EntryContent & { guided: boolean }
const blank: Draft = { text: '', guided: false }

// The draft lives in localStorage and is written on every keystroke, so a reload or a killed app loses nothing.
const loadDraft = (): Draft => {
  try {
    return { ...blank, ...JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') }
  } catch {
    return blank
  }
}
const saveDraft = (d: Draft) => {
  try {
    if (isEmpty(d) && !d.guided) localStorage.removeItem(DRAFT_KEY)
    else localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
  } catch {
    // Storage blocked: the draft is only in memory, nothing more to do.
  }
}

function Fields({ value, guided, onChange }: { value: EntryContent; guided: boolean; onChange: (c: EntryContent) => void }) {
  return (
    <div className="space-y-3">
      {guided ? (
        PROMPTS.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="mb-1 block text-sm text-muted">{label}</span>
            <textarea
              className={field}
              rows={2}
              autoCapitalize="sentences"
              value={value.prompts?.[key] ?? ''}
              onChange={(e) => onChange({ ...value, prompts: { ...value.prompts, [key]: e.target.value } })}
            />
          </label>
        ))
      ) : (
        <textarea
          aria-label="Entry"
          className={`${field} min-h-40`}
          placeholder="What's on your mind?"
          autoCapitalize="sentences"
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
        />
      )}
    </div>
  )
}

function Composer() {
  const [draft, setDraft] = useState(loadDraft)
  const change = (d: Draft) => {
    setDraft(d)
    saveDraft(d)
  }
  const save = async () => {
    await createEntry(draft)
    change({ ...blank, guided: draft.guided })
  }
  return (
    <Card>
      <Fields value={draft} guided={draft.guided} onChange={(c) => change({ ...draft, ...c })} />
      <div className="mt-3 flex items-center justify-between gap-2">
        <button className="min-h-11 text-sm text-muted underline-offset-4 hover:underline" onClick={() => change({ ...draft, guided: !draft.guided })}>
          {draft.guided ? 'Free writing' : 'Use prompts'}
        </button>
        <button className={primary} disabled={isEmpty(draft)} onClick={save}>Save entry</button>
      </div>
    </Card>
  )
}

const time = (t: number) => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

function Entry({ entry }: { entry: JournalEntry }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState<EntryContent>(entry)
  const [confirming, setConfirming] = useState(false)

  if (editing) {
    // Edits are saved as you type, so there is no draft to lose.
    const change = (c: EntryContent) => {
      setValue(c)
      void updateEntry(entry.id, c)
    }
    return (
      <Card>
        <Fields value={value} guided={!!entry.prompts} onChange={change} />
        {entry.prompts && entry.text && (
          <div className="mt-3">
            <Fields value={value} guided={false} onChange={change} />
          </div>
        )}
        {confirming ? (
          <div className="mt-3 rounded-card border border-sand p-3" role="alertdialog" aria-label="Confirm delete">
            <p className="text-sm">Delete this entry?</p>
            <div className="mt-3 flex gap-2">
              <button className={primary} onClick={() => removeEntry(entry.id)}>Delete</button>
              <button className={quiet} onClick={() => setConfirming(false)}>Keep</button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex justify-between gap-2">
            <button className={quiet} onClick={() => setConfirming(true)}>Delete</button>
            <button className={primary} onClick={() => setEditing(false)}>Done</button>
          </div>
        )}
      </Card>
    )
  }

  return (
    <button
      className="block min-h-14 w-full rounded-card border border-line bg-surface p-4 text-left"
      aria-label={`Edit entry from ${time(entry.createdAt)}`}
      onClick={() => {
        setValue(entry)
        setEditing(true)
      }}
    >
      <span className="block text-xs text-muted">{time(entry.createdAt)}</span>
      {entry.text && <span className="mt-1 block whitespace-pre-wrap text-base">{entry.text}</span>}
      {PROMPTS.filter((p) => entry.prompts?.[p.key]).map((p) => (
        <span key={p.key} className="mt-2 block">
          <span className="block text-sm text-muted">{p.label}</span>
          <span className="block whitespace-pre-wrap text-base">{entry.prompts![p.key]}</span>
        </span>
      ))}
    </button>
  )
}

const heading = (date: string) => {
  if (date === toDateKey()) return 'Today'
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function JournalScreen() {
  const entries = useEntries()
  const [query, setQuery] = useState('')
  const shown = (entries ?? []).filter((e) => matches(e, query))
  const days: [string, JournalEntry[]][] = []
  for (const e of shown) {
    if (days.at(-1)?.[0] === e.date) days.at(-1)![1].push(e)
    else days.push([e.date, [e]])
  }

  return (
    <Screen title="Journal">
      <div className="space-y-6">
        <Composer />
        {!!entries?.length && (
          <label className="relative block">
            <Search size={18} strokeWidth={1.75} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              aria-label="Search entries"
              placeholder="Search"
              className={`${field} min-h-11 py-0 pl-10`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}
        {days.map(([date, list]) => (
          <section key={date} className="space-y-2">
            <h2 className="text-sm font-medium text-muted">{heading(date)}</h2>
            {list.map((e) => <Entry key={e.id} entry={e} />)}
          </section>
        ))}
        {query && entries && !shown.length && <p className="text-sm text-muted">No entries match.</p>}
      </div>
    </Screen>
  )
}
