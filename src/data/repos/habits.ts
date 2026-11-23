import { useLiveQuery } from 'dexie-react-hooks'
import { db as shared, type KaizenDB } from '../db'
import { toDateKey } from '../dates'
import { makeRepo, type NewRecord } from '../repo'
import type { DateKey, Habit, HabitCompletion } from '../types'

export const addDays = (key: DateKey, n: number): DateKey => {
  const [y, m, d] = key.split('-').map(Number)
  return toDateKey(new Date(y, m - 1, d + n))
}
const dow = (key: DateKey) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}
/** Weeks run Monday to Sunday. */
const weekStart = (key: DateKey) => addDays(key, -((dow(key) + 6) % 7))

const scheduled = (h: Habit, key: DateKey) => h.frequency !== 'custom' || !!h.daysOfWeek?.includes(dow(key))

/**
 * Current streak in days (daily/custom: consecutive scheduled days done; unscheduled days are skipped)
 * or weeks (weekly: consecutive weeks with at least `timesPerWeek` done days).
 * Today/this week never breaks a streak until it is over; it only adds to it once met.
 */
export function streak(h: Habit, dates: ReadonlySet<DateKey>, today: DateKey): number {
  const earliest = [...dates].sort()[0]
  if (!earliest) return 0
  let n = 0
  if (h.frequency === 'weekly') {
    const need = h.timesPerWeek ?? 1
    const done = (ws: DateKey) => Array.from({ length: 7 }, (_, i) => addDays(ws, i)).filter((d) => dates.has(d)).length
    let ws = weekStart(today)
    if (done(ws) >= need) n++
    for (ws = addDays(ws, -7); ws >= weekStart(earliest) && done(ws) >= need; ws = addDays(ws, -7)) n++
    return n
  }
  if (h.frequency === 'custom' && !h.daysOfWeek?.length) return 0
  for (let d = today; d >= earliest; d = addDays(d, -1)) {
    if (!scheduled(h, d)) continue
    if (dates.has(d)) n++
    else if (d !== today) break
  }
  return n
}

/**
 * Percent (0-100) of the last 30 days done, counting only days since the habit began.
 * Today is only counted once done. Weekly habits compare against timesPerWeek x weeks elapsed.
 * Returns null when there is nothing to measure yet.
 */
export function consistency(h: Habit, dates: ReadonlySet<DateKey>, today: DateKey, since: DateKey): number | null {
  const start = since > addDays(today, -29) ? since : addDays(today, -29)
  const days: DateKey[] = []
  for (let d = start; d <= today; d = addDays(d, 1)) days.push(d)
  const done = days.filter((d) => dates.has(d))
  if (h.frequency === 'weekly') {
    if (days.length < 7) return null
    return Math.min(100, Math.round((done.length / (((h.timesPerWeek ?? 1) * days.length) / 7)) * 100))
  }
  const due = days.filter((d) => scheduled(h, d) && (d !== today || dates.has(d)))
  return due.length ? Math.round((due.filter((d) => dates.has(d)).length / due.length) * 100) : null
}

export type HabitInput = NewRecord<Habit>

export const createHabit = async (data: Omit<HabitInput, 'order'>, db: KaizenDB = shared) =>
  makeRepo(db.habits).create({ ...data, order: await db.habits.count() })
export const updateHabit = (id: string, changes: Partial<Omit<HabitInput, 'order'>>, db: KaizenDB = shared) =>
  makeRepo(db.habits).update(id, changes)
export const archiveHabit = (id: string, archived = true, db: KaizenDB = shared) => updateHabit(id, { archived }, db)

const liveCompletion = (db: KaizenDB, habitId: string, date: DateKey) =>
  db.habitCompletions.where('[habitId+date]').equals([habitId, date]).filter((c) => !c.deletedAt).first()

/** Marks (or changes the level of) a habit for a day. One live completion per habit per day. */
export const setCompletion = (habitId: string, level: HabitCompletion['level'], date = toDateKey(), db: KaizenDB = shared) =>
  db.transaction('rw', db.habitCompletions, async () => {
    const existing = await liveCompletion(db, habitId, date)
    if (existing) await makeRepo(db.habitCompletions).update(existing.id, { level })
    else await makeRepo(db.habitCompletions).create({ habitId, date, level })
  })

export const clearCompletion = (habitId: string, date = toDateKey(), db: KaizenDB = shared) =>
  db.transaction('rw', db.habitCompletions, async () => {
    const existing = await liveCompletion(db, habitId, date)
    if (existing) await makeRepo(db.habitCompletions).remove(existing.id)
  })

export interface TodayHabit {
  habit: Habit
  completion?: HabitCompletion
  /** Streak in days, or weeks for weekly habits. */
  streak: number
  /** 0-100 over the last 30 days, null until there is something to measure. */
  consistency: number | null
  dueToday: boolean
}

export async function listToday(db: KaizenDB = shared, today = toDateKey()): Promise<TodayHabit[]> {
  const [habits, completions] = await Promise.all([
    makeRepo(db.habits).all(),
    db.habitCompletions.filter((c) => !c.deletedAt).toArray(),
  ])
  return habits
    .filter((h) => !h.archived)
    .sort((a, b) => a.order - b.order)
    .map((habit) => {
      const mine = completions.filter((c) => c.habitId === habit.id)
      const dates = new Set(mine.map((c) => c.date))
      const since = [toDateKey(new Date(habit.createdAt)), ...dates].sort()[0]
      return {
        habit,
        completion: mine.find((c) => c.date === today),
        streak: streak(habit, dates, today),
        consistency: consistency(habit, dates, today, since),
        dueToday: scheduled(habit, today),
      }
    })
}

/** Active habits with today's completion, streak and consistency. For the Habits and Today screens. */
export const useTodayHabits = () => useLiveQuery(() => listToday(), [])

export const useArchivedHabits = () =>
  useLiveQuery(async () => (await makeRepo(shared.habits).all()).filter((h) => h.archived), [], [] as Habit[])
