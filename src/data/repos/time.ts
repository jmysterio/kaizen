import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db as sharedDb, type KaizenDB } from '../db'
import { makeRepo } from '../repo'
import type { TimeEntry } from '../types'

/** Elapsed ms, from timestamps only. Pause time is excluded. */
export const elapsed = (e: TimeEntry, now = Date.now()) =>
  Math.max(0, (e.endedAt ?? e.pausedAt ?? now) - e.startedAt - e.pausedMs)

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const startOfWeek = (d: Date) => startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)))

const open = (db: KaizenDB) => db.timeEntries.where('isOpen').equals(1).filter((e) => !e.deletedAt).first()

const stopChanges = (e: TimeEntry, now: number): Partial<TimeEntry> => ({ endedAt: e.pausedAt ?? now, pausedAt: null, isOpen: 0 })

/** Starting while a timer is open is a switch: stop it and start the new one in one transaction. */
export const startTimer = (activity: string, habitId?: string, db: KaizenDB = sharedDb) =>
  db.transaction('rw', db.timeEntries, async () => {
    const name = activity.trim()
    if (!name) throw new Error('Name the activity.')
    const now = Date.now()
    const cur = await open(db)
    const repo = makeRepo(db.timeEntries)
    if (cur) await repo.update(cur.id, stopChanges(cur, now))
    return repo.create({ activity: name, habitId, startedAt: now, endedAt: null, pausedAt: null, pausedMs: 0, isOpen: 1 })
  })

const withOpen = (fn: (e: TimeEntry, now: number) => Partial<TimeEntry> | null, db: KaizenDB) =>
  db.transaction('rw', db.timeEntries, async () => {
    const cur = await open(db)
    const changes = cur && fn(cur, Date.now())
    if (cur && changes) await makeRepo(db.timeEntries).update(cur.id, changes)
  })

export const pauseTimer = (db: KaizenDB = sharedDb) => withOpen((e, now) => (e.pausedAt ? null : { pausedAt: now }), db)
export const resumeTimer = (db: KaizenDB = sharedDb) =>
  withOpen((e, now) => (e.pausedAt ? { pausedAt: null, pausedMs: e.pausedMs + now - e.pausedAt } : null), db)
export const stopTimer = (db: KaizenDB = sharedDb) => withOpen(stopChanges, db)

/** A manual range must be valid and must not overlap the open timer (which runs from its start until now). */
async function checkRange(start: number, end: number, db: KaizenDB, ignoreId?: string) {
  if (!(end > start)) throw new Error('End must be after start.')
  const cur = await open(db)
  if (cur && cur.id !== ignoreId && start < Date.now() && end > cur.startedAt) throw new Error('Overlaps the running timer.')
}

export const addManualEntry = (activity: string, startedAt: number, endedAt: number, db: KaizenDB = sharedDb) =>
  db.transaction('rw', db.timeEntries, async () => {
    if (!activity.trim()) throw new Error('Name the activity.')
    await checkRange(startedAt, endedAt, db)
    return makeRepo(db.timeEntries).create({ activity: activity.trim(), startedAt, endedAt, pausedAt: null, pausedMs: 0, isOpen: 0 })
  })

/** Editing a finished entry's times resets its pause time (the range is now the truth). */
export const editEntry = (id: string, activity: string, startedAt: number, endedAt: number, db: KaizenDB = sharedDb) =>
  db.transaction('rw', db.timeEntries, async () => {
    if (!activity.trim()) throw new Error('Name the activity.')
    const cur = await db.timeEntries.get(id)
    if (!cur || cur.deletedAt || cur.isOpen) throw new Error('Stop the timer before editing it.')
    await checkRange(startedAt, endedAt, db, id)
    await makeRepo(db.timeEntries).update(id, { activity: activity.trim(), startedAt, endedAt, pausedMs: 0 })
  })

/** Deleting the open timer also closes it, so the "one open entry" index stays honest. */
export const removeEntry = (id: string, db: KaizenDB = sharedDb) =>
  db.transaction('rw', db.timeEntries, async () => {
    const repo = makeRepo(db.timeEntries)
    await repo.update(id, { isOpen: 0 })
    await repo.remove(id)
  })

/** Re-renders every second while `on` and the page is visible. */
export function useNow(on = true) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!on) return
    const tick = () => document.visibilityState === 'visible' && setNow(Date.now())
    tick()
    const id = setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [on])
  return now
}

export const useActiveTimer = (db: KaizenDB = sharedDb) => useLiveQuery(() => open(db), [db])

const since = (db: KaizenDB, from: number) =>
  db.timeEntries.where('startedAt').aboveOrEqual(from).filter((e) => !e.deletedAt).toArray()

export const useTodayEntries = (db: KaizenDB = sharedDb) =>
  useLiveQuery(async () => (await since(db, startOfDay(new Date()))).sort((a, b) => b.startedAt - a.startedAt), [db])

/** Total ms today; ticks while a timer is running. Entries count on the day they started. */
export function useTodayTotal(db: KaizenDB = sharedDb) {
  const entries = useTodayEntries(db)
  const now = useNow(!!entries?.some((e) => e.isOpen && !e.pausedAt))
  return (entries ?? []).reduce((sum, e) => sum + elapsed(e, now), 0)
}

/** This week's (Monday start) total ms per activity, largest first. */
export function useWeekTotals(db: KaizenDB = sharedDb) {
  const entries = useLiveQuery(() => since(db, startOfWeek(new Date())), [db])
  const now = useNow(!!entries?.some((e) => e.isOpen && !e.pausedAt))
  const totals = new Map<string, number>()
  for (const e of entries ?? []) totals.set(e.activity, (totals.get(e.activity) ?? 0) + elapsed(e, now))
  return [...totals].sort((a, b) => b[1] - a[1])
}

/** Most recent distinct activities, for quick picks. */
export const useRecentActivities = (db: KaizenDB = sharedDb) =>
  useLiveQuery(async () => {
    const rows = await db.timeEntries.orderBy('startedAt').reverse().filter((e) => !e.deletedAt).limit(40).toArray()
    return [...new Set(rows.map((e) => e.activity))].slice(0, 5)
  }, [db])
