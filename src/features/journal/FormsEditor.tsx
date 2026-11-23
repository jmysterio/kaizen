import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../../components/Screen'
import { quiet } from '../../components/styles'
import { DEFAULT_FORMS, saveForms, useForms } from '../../data/repos/journal'
import type { JournalForm } from '../../data/types'

const field = 'min-h-11 w-full rounded-card border border-line bg-washi px-3 text-base focus:border-bamboo focus:outline-none'
const icon = 'grid size-11 shrink-0 place-items-center rounded-card text-muted disabled:opacity-30'

const move = <T,>(list: T[], i: number, by: number) => {
  const next = [...list]
  ;[next[i], next[i + by]] = [next[i + by], next[i]]
  return next
}

/** Edit journal forms. Changes save immediately; past entries keep the wording they were written with. */
export function FormsEditor() {
  const forms = useForms()
  const [confirmReset, setConfirmReset] = useState(false)
  const setForm = (i: number, f: JournalForm) => saveForms(forms.map((x, j) => (j === i ? f : x)))

  return (
    <Card>
      <h2 className="font-medium">Journal forms</h2>
      <p className="mb-4 mt-1 text-sm text-muted">
        Edit the questions you answer. Past entries keep the wording they were written with.
      </p>
      <div className="space-y-3">
        {forms.map((form, i) => (
          <details key={form.id} className="rounded-card border border-line p-3">
            <summary className="min-h-8 cursor-pointer">
              {form.name || 'Untitled form'} <span className="text-sm text-muted">· {form.questions.length} questions</span>
            </summary>
            <div className="mt-3 space-y-2">
              <input
                aria-label="Form name"
                className={field}
                value={form.name}
                onChange={(e) => setForm(i, { ...form, name: e.target.value })}
              />
              {form.questions.map((q, qi) => (
                <div key={qi} className="rounded-card bg-washi">
                  <textarea
                    aria-label={`Question ${qi + 1}`}
                    rows={2}
                    className={`${field} resize-none py-2`}
                    value={q}
                    onChange={(e) =>
                      setForm(i, { ...form, questions: form.questions.map((x, j) => (j === qi ? e.target.value : x)) })
                    }
                  />
                  <div className="flex justify-end">
                  <button className={icon} aria-label={`Move question ${qi + 1} up`} disabled={qi === 0}
                    onClick={() => setForm(i, { ...form, questions: move(form.questions, qi, -1) })}>
                    <ArrowUp size={18} strokeWidth={1.75} aria-hidden />
                  </button>
                  <button className={icon} aria-label={`Move question ${qi + 1} down`} disabled={qi === form.questions.length - 1}
                    onClick={() => setForm(i, { ...form, questions: move(form.questions, qi, 1) })}>
                    <ArrowDown size={18} strokeWidth={1.75} aria-hidden />
                  </button>
                  <button className={icon} aria-label={`Remove question ${qi + 1}`}
                    onClick={() => setForm(i, { ...form, questions: form.questions.filter((_, j) => j !== qi) })}>
                    <X size={18} strokeWidth={1.75} aria-hidden />
                  </button>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <button className={quiet} onClick={() => setForm(i, { ...form, questions: [...form.questions, ''] })}>
                  Add question
                </button>
                <button className={quiet} onClick={() => saveForms(forms.filter((_, j) => j !== i))}>
                  Delete form
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={`${quiet} inline-flex items-center gap-1`}
          onClick={() => saveForms([...forms, { id: crypto.randomUUID(), name: 'New form', questions: [''] }])}
        >
          <Plus size={16} strokeWidth={1.75} aria-hidden /> Add form
        </button>
        {confirmReset ? (
          <>
            <button className={quiet} onClick={() => { void saveForms(DEFAULT_FORMS); setConfirmReset(false) }}>
              Replace with suggested
            </button>
            <button className={quiet} onClick={() => setConfirmReset(false)}>Cancel</button>
          </>
        ) : (
          <button className={quiet} onClick={() => setConfirmReset(true)}>Restore suggested forms</button>
        )}
      </div>
    </Card>
  )
}
