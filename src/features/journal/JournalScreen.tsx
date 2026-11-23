import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, Screen } from '../../components/Screen'
import { primary, quiet } from '../../components/styles'
import { toDateKey } from '../../data/dates'
import {
  answersOf, createEntry, isEmpty, matches, removeEntry, suggestedFormId, updateEntry, useEntries, useForms,
  type EntryContent,
} from '../../data/repos/journal'
import type { Answer, JournalEntry } from '../../data/types'

const field =
  'w-full resize-y rounded-card border border-line bg-canvas p-3 text-base placeholder:text-ink-muted focus:border-ink-muted focus:outline-none'

const DRAFT_KEY = 'kaizen.journal.draft'
/** formId: undefined = not chosen yet (use the time-of-day suggestion), null = free writing. */
type Draft = { text: string; formId?: string | null; values: Record<string, string[]> }
const blank: Draft = { text: '', values: {} }

// The draft lives in localStorage and is written on every keystroke, so a reload or a killed app loses nothing.
const loadDraft = (): Draft => {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}')
    return { text: typeof d.text === 'string' ? d.text : '', formId: d.formId, values: d.values ?? {} }
  } catch {
    return blank
  }
}
const saveDraft = (d: Draft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
  } catch {
    // Storage blocked: the draft is only in memory, nothing more to do.
  }
}

function Questions({ answers, onChange }: { answers: Answer[]; onChange: (i: number, value: string) => void }) {
  return answers.map((a, i) => (
    <label key={i} className="block">
      <span className="mb-1.5 block font-display text-base text-ink">{a.question}</span>
      <textarea
        className={field}
        rows={2}
        autoCapitalize="sentences"
        value={a.answer}
        onChange={(e) => onChange(i, e.target.value)}
      />
    </label>
  ))
}

function Notes({ value, guided, onChange }: { value: string; guided: boolean; onChange: (v: string) => void }) {
  return guided ? (
    <label className="block">
      <span className="mb-1 block text-sm text-ink-muted">Notes (optional)</span>
      <textarea className={field} rows={2} autoCapitalize="sentences" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  ) : (
    <textarea
      aria-label="Entry"
      className={`${field} min-h-40`}
      placeholder="What's on your mind?"
      autoCapitalize="sentences"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function Composer() {
  const forms = useForms().filter((f) => f.questions.length)
  const [draft, setDraft] = useState(loadDraft)
  const change = (d: Draft) => {
    setDraft(d)
    saveDraft(d)
  }
  const formId = draft.formId === undefined ? suggestedFormId(forms) : draft.formId
  const form = forms.find((f) => f.id === formId)
  const values = (form && draft.values[form.id]) || []
  const content: EntryContent = {
    text: draft.text,
    form: form?.name,
    answers: form?.questions.map((question, i) => ({ question, answer: values[i] ?? '' })),
  }

  const save = async () => {
    await createEntry(content)
    change({ ...blank, formId: draft.formId })
  }

  const choices = [...forms.map((f) => ({ id: f.id as string | null, name: f.name })), { id: null, name: 'Free write' }]
  return (
    <Card>
      <div role="radiogroup" aria-label="Form" className="mb-4 flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.id ?? 'free'}
            role="radio"
            aria-checked={formId === c.id || (!form && c.id === null)}
            onClick={() => change({ ...draft, formId: c.id })}
            className="min-h-10 shrink-0 rounded-card border border-line px-4 text-sm text-ink-muted aria-checked:border-primary aria-checked:bg-primary aria-checked:text-on-primary"
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {form && (
          <Questions
            answers={content.answers!}
            onChange={(i, v) => {
              const next = form.questions.map((_, j) => (j === i ? v : (values[j] ?? '')))
              change({ ...draft, values: { ...draft.values, [form.id]: next } })
            }}
          />
        )}
        <Notes value={draft.text} guided={!!form} onChange={(text) => change({ ...draft, text })} />
      </div>
      <div className="mt-3 flex justify-end">
        <button className={primary} disabled={isEmpty(content)} onClick={save}>Save entry</button>
      </div>
    </Card>
  )
}

const time = (t: number) => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

function Entry({ entry }: { entry: JournalEntry }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(entry.text)
  const [answers, setAnswers] = useState(() => answersOf(entry))
  const [confirming, setConfirming] = useState(false)

  if (editing) {
    // Edits are saved as you type, so there is no draft to lose.
    const save = (c: Partial<EntryContent>) => void updateEntry(entry.id, c)
    return (
      <Card>
        <div className="space-y-3">
          <Questions
            answers={answers}
            onChange={(i, v) => {
              const next = answers.map((a, j) => (j === i ? { ...a, answer: v } : a))
              setAnswers(next)
              save({ answers: next })
            }}
          />
          <Notes
            value={text}
            guided={answers.length > 0}
            onChange={(v) => {
              setText(v)
              save({ text: v })
            }}
          />
        </div>
        {confirming ? (
          <div className="mt-3 rounded-card border border-ink-muted p-3" role="alertdialog" aria-label="Confirm delete">
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
        setText(entry.text)
        setAnswers(answersOf(entry))
        setEditing(true)
      }}
    >
      <span className="block text-xs text-ink-muted">
        {time(entry.createdAt)}
        {entry.form && ` · ${entry.form}`}
      </span>
      {answersOf(entry)
        .filter((a) => a.answer.trim())
        .map((a, i) => (
          <span key={i} className="mt-2 block">
            <span className="block font-display text-sm text-ink-muted">{a.question}</span>
            <span className="block whitespace-pre-wrap text-base">{a.answer}</span>
          </span>
        ))}
      {entry.text && <span className="mt-2 block whitespace-pre-wrap text-base">{entry.text}</span>}
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
            <Search size={18} strokeWidth={1.75} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
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
            <h2 className="text-sm font-medium text-ink-muted">{heading(date)}</h2>
            {list.map((e) => <Entry key={e.id} entry={e} />)}
          </section>
        ))}
        {query && entries && !shown.length && <p className="text-sm text-ink-muted">No entries match.</p>}
      </div>
    </Screen>
  )
}
