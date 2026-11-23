import { Pause, Pencil, Play, Plus, Square, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Card, Screen } from '../../components/Screen'
import { toDateKey } from '../../data/dates'
import {
  addManualEntry, editEntry, elapsed, pauseTimer, removeEntry, resumeTimer, startTimer, stopTimer,
  useActiveTimer, useNow, useRecentActivities, useTodayEntries, useWeekTotals,
} from '../../data/repos/time'
import type { TimeEntry } from '../../data/types'

const btn = 'min-h-11 rounded-card px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-50'
const primary = `${btn} bg-bamboo text-on-bamboo`
const quiet = `${btn} border border-line bg-surface`
const field = 'min-h-11 w-full rounded-card border border-line bg-surface px-3 text-base placeholder:text-muted'

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${Math.floor(s / 3600)}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`
}
const dur = (ms: number) => {
  const m = Math.round(ms / 60000)
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`
}
const hhmm = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// datetime-local wants local `YYYY-MM-DDTHH:mm`
const local = (t: number) => `${toDateKey(new Date(t))}T${new Date(t).toTimeString().slice(0, 5)}`

function Running({ timer }: { timer: TimeEntry }) {
  const paused = !!timer.pausedAt
  const now = useNow(!paused)
  return (
    <Card className="mb-6 text-center">
      <p className="text-muted">{timer.activity}{paused && ' · paused'}</p>
      <p className="my-2 text-2xl font-semibold tabular-nums" role="timer" aria-label="Elapsed" data-testid="elapsed">
        {clock(elapsed(timer, now))}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className={`${quiet} min-h-14 flex items-center justify-center gap-2`} onClick={() => void (paused ? resumeTimer() : pauseTimer())}>
          {paused ? <Play size={20} strokeWidth={1.75} aria-hidden /> : <Pause size={20} strokeWidth={1.75} aria-hidden />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button className={`${primary} min-h-14 flex items-center justify-center gap-2`} onClick={() => void stopTimer()}>
          <Square size={20} strokeWidth={1.75} aria-hidden /> Stop
        </button>
      </div>
    </Card>
  )
}

function EntryForm({ entry, onDone }: { entry?: TimeEntry; onDone: () => void }) {
  const [error, setError] = useState<string>()
  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const [a, s, e] = ['activity', 'start', 'end'].map((k) => String(f.get(k)))
    const start = new Date(s).getTime()
    const end = new Date(e).getTime()
    try {
      if (Number.isNaN(start) || Number.isNaN(end)) throw new Error('Set a start and end.')
      await (entry ? editEntry(entry.id, a, start, end) : addManualEntry(a, start, end))
      onDone()
    } catch (err) {
      setError((err as Error).message)
    }
  }
  return (
    <form onSubmit={submit} className="mb-4 grid gap-3">
      <input name="activity" aria-label="Activity" placeholder="Activity" defaultValue={entry?.activity} className={field} />
      <label className="grid gap-1 text-sm text-muted">Start
        <input name="start" type="datetime-local" defaultValue={entry ? local(entry.startedAt) : ''} className={field} />
      </label>
      <label className="grid gap-1 text-sm text-muted">End
        <input name="end" type="datetime-local" defaultValue={entry?.endedAt ? local(entry.endedAt) : ''} className={field} />
      </label>
      {error && <p role="alert" className="text-sm">{error}</p>}
      <div className="flex gap-3">
        <button className={primary}>Save</button>
        <button type="button" className={quiet} onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}

export function TimerScreen() {
  const active = useActiveTimer()
  const recent = useRecentActivities()
  const entries = useTodayEntries()
  const week = useWeekTotals()
  const now = useNow(!!active && !active.pausedAt)
  const [name, setName] = useState('')
  const [form, setForm] = useState<'new' | string>()
  const [error, setError] = useState<string>()

  const start = async (activity: string) => {
    try {
      await startTimer(activity)
      setName('')
      setError(undefined)
    } catch (e) {
      setError((e as Error).message)
    }
  }
  const today = (entries ?? []).reduce((sum, e) => sum + elapsed(e, now), 0)

  return (
    <Screen title="Timer">
      {active && <Running timer={active} />}

      <form className="mb-3 flex gap-3" onSubmit={(e) => { e.preventDefault(); void start(name) }}>
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Activity" placeholder="What are you working on?" className={field} />
        <button className={primary}>{active ? 'Switch' : 'Start'}</button>
      </form>
      {error && <p role="alert" className="mb-3 text-sm">{error}</p>}
      <div className="mb-8 flex flex-wrap gap-2">
        {recent?.filter((a) => a !== active?.activity).map((a) => (
          <button key={a} className={`${quiet} rounded-full`} onClick={() => void start(a)}>{a}</button>
        ))}
      </div>

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Today <span className="text-muted" data-testid="today-total">{dur(today)}</span></h2>
        <button className="flex min-h-11 items-center gap-1 text-sm text-muted" onClick={() => setForm('new')}>
          <Plus size={18} strokeWidth={1.75} aria-hidden /> Add entry
        </button>
      </div>
      {form === 'new' && <EntryForm onDone={() => setForm(undefined)} />}
      <ul className="mb-8 divide-y divide-line">
        {entries?.map((e) =>
          form === e.id ? (
            <li key={e.id} className="py-3"><EntryForm entry={e} onDone={() => setForm(undefined)} /></li>
          ) : (
            <li key={e.id} className="flex min-h-14 items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate">{e.activity}</p>
                <p className="text-xs text-muted">{hhmm(e.startedAt)}{e.endedAt ? ` – ${hhmm(e.endedAt)}` : ' – now'}</p>
              </div>
              <span className="tabular-nums">{dur(elapsed(e, now))}</span>
              {!e.isOpen && (
                <button aria-label={`Edit ${e.activity}`} className="grid size-11 place-items-center text-muted" onClick={() => setForm(e.id)}>
                  <Pencil size={18} strokeWidth={1.75} aria-hidden />
                </button>
              )}
              <button aria-label={`Delete ${e.activity}`} className="grid size-11 place-items-center text-muted" onClick={() => void removeEntry(e.id)}>
                <Trash2 size={18} strokeWidth={1.75} aria-hidden />
              </button>
            </li>
          ),
        )}
        {entries?.length === 0 && <li className="py-3 text-muted">Nothing tracked yet today.</li>}
      </ul>

      {week.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-semibold">This week</h2>
          <ul className="divide-y divide-line">
            {week.map(([a, ms]) => (
              <li key={a} className="flex min-h-11 items-center justify-between"><span>{a}</span><span className="tabular-nums text-muted">{dur(ms)}</span></li>
            ))}
          </ul>
        </>
      )}
    </Screen>
  )
}
