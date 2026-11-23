import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { Card, Screen } from '../../components/Screen'
import { primary, quiet } from '../../components/styles'
import {
  archiveHabit, clearCompletion, createHabit, setCompletion, updateHabit, useArchivedHabits, useTodayHabits,
  type TodayHabit,
} from '../../data/repos/habits'
import type { Habit } from '../../data/types'

const field = 'min-h-11 w-full rounded-card border border-line bg-surface-raised px-3 text-base'
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const schedule = (h: Habit) =>
  h.frequency === 'daily' ? 'Daily'
  : h.frequency === 'weekly' ? `${h.timesPerWeek ?? 1}× a week`
  : (h.daysOfWeek ?? []).map((d) => DAY_NAMES[d].slice(0, 3)).join(' ')

export function HabitsScreen() {
  const rows = useTodayHabits()
  const archived = useArchivedHabits()
  const [editing, setEditing] = useState<Habit | 'new'>()

  if (editing)
    return (
      <Screen title={editing === 'new' ? 'New habit' : 'Edit habit'}>
        <HabitForm habit={editing === 'new' ? undefined : editing} done={() => setEditing(undefined)} />
      </Screen>
    )

  return (
    <Screen
      title="Habits"
      action={
        <button className={quiet} onClick={() => setEditing('new')}>
          <Plus size={18} strokeWidth={1.75} aria-hidden className="mr-1 inline" />
          New
        </button>
      }
    >
      {rows?.length === 0 && <p className="glass rounded-card p-4 text-ink-muted">No habits yet. Start with one small thing.</p>}
      <ul className="space-y-3">
        {rows?.map((r) => (
          <li key={r.habit.id}>
            <HabitRow r={r} edit={() => setEditing(r.habit)} />
          </li>
        ))}
      </ul>
      {archived.length > 0 && (
        <details className="glass mt-8 rounded-sheet px-4 pb-2">
          <summary className="min-h-11 cursor-pointer py-2 text-sm text-ink-muted">Archived ({archived.length})</summary>
          <ul className="space-y-1">
            {archived.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">{h.name}</span>
                <button className={quiet} onClick={() => archiveHabit(h.id, false)}>Restore</button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Screen>
  )
}

export function HabitRow({ r, edit }: { r: TodayHabit; edit: () => void }) {
  const { habit, completion, streak, consistency, dueToday } = r
  const level = completion?.level
  const unit = habit.frequency === 'weekly' ? 'week' : 'day'
  const stats = [
    streak > 0 && `${streak} ${unit} streak`,
    consistency !== null && `${consistency}% last 30 days`,
  ].filter(Boolean)

  return (
    <Card className="flex items-center gap-3">
      <button
        aria-label={level ? `Undo ${habit.name}` : `Mark ${habit.name} done`}
        aria-pressed={!!level}
        onClick={() => (level ? clearCompletion(habit.id) : setCompletion(habit.id, 'minimum'))}
        className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-on-accent transition-colors duration-200 aria-pressed:border-accent aria-pressed:bg-accent"
      >
        {level && <Check size={22} strokeWidth={1.75} aria-hidden />}
      </button>
      <button onClick={edit} className="min-h-11 min-w-0 flex-1 text-left" aria-label={`Edit ${habit.name}`}>
        <span className={`block truncate ${dueToday ? '' : 'text-ink-muted'}`}>{habit.name}</span>
        <span className="block truncate text-xs text-ink-muted">
          {habit.stackAfter ? `After I ${habit.stackAfter} · ` : ''}
          {schedule(habit)} · {habit.minimum}
          {habit.target && ` / ${habit.target}`}
        </span>
        {stats.length > 0 && <span className="block text-xs text-ink-muted">{stats.join(' · ')}</span>}
      </button>
      {level === 'minimum' && habit.target && (
        <button className={quiet} onClick={() => setCompletion(habit.id, 'target')}>
          Did {habit.target}
        </button>
      )}
      {level === 'target' && <span className="text-xs text-accent">Target</span>}
    </Card>
  )
}

function HabitForm({ habit, done }: { habit?: Habit; done: () => void }) {
  const [name, setName] = useState(habit?.name ?? '')
  const [frequency, setFrequency] = useState<Habit['frequency']>(habit?.frequency ?? 'daily')
  const [times, setTimes] = useState(habit?.timesPerWeek ?? 3)
  const [days, setDays] = useState<number[]>(habit?.daysOfWeek ?? [1, 3, 5])
  const [minimum, setMinimum] = useState(habit?.minimum ?? '')
  const [target, setTarget] = useState(habit?.target ?? '')
  const [stackAfter, setStackAfter] = useState(habit?.stackAfter ?? '')

  const valid = name.trim() && (frequency !== 'custom' || days.length > 0)
  const save = async () => {
    const data = {
      name: name.trim(),
      frequency,
      timesPerWeek: frequency === 'weekly' ? times : undefined,
      daysOfWeek: frequency === 'custom' ? [...days].sort() : undefined,
      minimum: minimum.trim(),
      target: target.trim(),
      stackAfter: stackAfter.trim() || undefined,
    }
    if (habit) await updateHabit(habit.id, data)
    else await createHabit(data)
    done()
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) void save()
      }}
    >
      <label className="block">
        <span className="mb-1 block text-sm text-ink-muted">Name</span>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoFocus={!habit} />
      </label>

      <div>
        <span className="mb-1 block text-sm text-ink-muted">How often</span>
        <div role="radiogroup" aria-label="How often" className="grid grid-cols-3 gap-1 rounded-card bg-surface p-1">
          {(['daily', 'weekly', 'custom'] as const).map((f) => (
            <button
              type="button"
              key={f}
              role="radio"
              aria-checked={frequency === f}
              onClick={() => setFrequency(f)}
              className="min-h-11 rounded-[9px] text-sm capitalize text-ink-muted aria-checked:bg-canvas aria-checked:text-ink aria-checked:shadow-soft"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {frequency === 'weekly' && (
        <label className="block">
          <span className="mb-1 block text-sm text-ink-muted">Times per week</span>
          <select className={field} value={times} onChange={(e) => setTimes(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
      )}
      {frequency === 'custom' && (
        <div className="flex justify-between" role="group" aria-label="Days">
          {DAYS.map((d, i) => (
            <button
              type="button"
              key={i}
              aria-label={DAY_NAMES[i]}
              aria-pressed={days.includes(i)}
              onClick={() => setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i])}
              className="size-11 rounded-full border border-line bg-surface text-sm aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent"
            >
              {d}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm text-ink-muted">Minimum</span>
          <input className={field} placeholder="5 min" value={minimum} onChange={(e) => setMinimum(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-ink-muted">Target</span>
          <input className={field} placeholder="20 min" value={target} onChange={(e) => setTarget(e.target.value)} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-ink-muted">After I… (optional)</span>
        <input className={field} placeholder="pour my morning coffee" value={stackAfter} onChange={(e) => setStackAfter(e.target.value)} />
      </label>

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" className={primary} disabled={!valid}>Save</button>
        <button type="button" className={quiet} onClick={done}>Cancel</button>
        {habit && (
          <button type="button" className={`${quiet} ml-auto`} onClick={() => archiveHabit(habit.id).then(done)}>
            Archive
          </button>
        )}
      </div>
    </form>
  )
}
