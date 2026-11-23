import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { KaizenDB } from '../db'
import type { Habit } from '../types'
import { archiveHabit, clearCompletion, consistency, createHabit, listToday, setCompletion, streak } from './habits'

const freshDb = () => new KaizenDB(`test-${crypto.randomUUID()}`)
const h = (p: Partial<Habit>) => ({ frequency: 'daily', ...p }) as Habit
const S = (...d: string[]) => new Set(d)

// 2027-01-01 is a Friday: Mon 2026-12-28 … Sun 2027-01-03, Mon 2027-01-04 starts a new week.
describe('streak', () => {
  it('daily: counts back from today, or from yesterday while today is still open', () => {
    const d = S('2027-01-01', '2027-01-02', '2027-01-03')
    expect(streak(h({}), d, '2027-01-03')).toBe(3)
    expect(streak(h({}), d, '2027-01-04')).toBe(3)
    expect(streak(h({}), d, '2027-01-05')).toBe(0)
    expect(streak(h({}), S(), '2027-01-05')).toBe(0)
  })
  it('daily: a gap breaks it, across month and year ends', () => {
    expect(streak(h({}), S('2026-12-30', '2026-12-31', '2027-01-01', '2027-01-03'), '2027-01-03')).toBe(1)
    expect(streak(h({}), S('2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'), '2027-01-02')).toBe(4)
  })
  it('custom: skips unscheduled days, breaks on a missed scheduled day', () => {
    const mwf = h({ frequency: 'custom', daysOfWeek: [1, 3, 5] })
    expect(streak(mwf, S('2026-12-28', '2026-12-30', '2027-01-01'), '2027-01-03')).toBe(3)
    expect(streak(mwf, S('2026-12-28', '2027-01-01'), '2027-01-03')).toBe(1) // missed Wed
    // today (Mon) is scheduled but not done yet: does not break
    expect(streak(mwf, S('2026-12-30', '2027-01-01'), '2027-01-04')).toBe(2)
    expect(streak(h({ frequency: 'custom', daysOfWeek: [] }), S('2027-01-01'), '2027-01-01')).toBe(0)
  })
  it('weekly 3x: a quiet Tuesday does not break it; weeks run Monday to Sunday', () => {
    const w3 = h({ frequency: 'weekly', timesPerWeek: 3 })
    // week of Dec 21: Mon, Wed, Sun = 3. Week of Dec 28: Mon, Tue, Sun Jan 3 = 3 (Sunday ends that week).
    const d = S('2026-12-21', '2026-12-23', '2026-12-27', '2026-12-28', '2026-12-29', '2027-01-03')
    expect(streak(w3, d, '2027-01-03')).toBe(2)
    expect(streak(w3, d, '2027-01-04')).toBe(2) // Monday: new empty week does not break it
    // Sunday Jan 3 is still the old week; Monday Jan 4 would count toward the new one
    expect(streak(w3, S('2026-12-28', '2026-12-29', '2027-01-04'), '2027-01-04')).toBe(0)
    expect(streak(w3, S('2026-12-28', '2026-12-29', '2027-01-03'), '2027-01-03')).toBe(1)
  })
  it('weekly: the current week adds once met; a missed full week breaks', () => {
    const w2 = h({ frequency: 'weekly', timesPerWeek: 2 })
    expect(streak(w2, S('2027-01-04'), '2027-01-05')).toBe(0)
    expect(streak(w2, S('2027-01-04', '2027-01-05'), '2027-01-05')).toBe(1)
    // week of Dec 21 met, Dec 28 missed, Jan 4 met
    expect(streak(w2, S('2026-12-21', '2026-12-22', '2027-01-04', '2027-01-05'), '2027-01-05')).toBe(1)
  })
})

describe('consistency', () => {
  it('daily: only counts days since the habit began and ignores an open today', () => {
    const d = S('2027-01-02', '2027-01-03')
    expect(consistency(h({}), d, '2027-01-04', '2027-01-01')).toBe(67) // Jan 1-3, 2 of 3
    expect(consistency(h({}), d, '2027-01-03', '2027-01-03')).toBe(100)
    expect(consistency(h({}), S(), '2027-01-01', '2027-01-01')).toBeNull()
  })
  it('daily: uses a 30 day window', () => {
    const d = new Set<string>()
    for (let i = 1; i <= 15; i++) d.add(`2027-01-${String(i).padStart(2, '0')}`)
    expect(consistency(h({}), d, '2027-01-30', '2026-01-01')).toBe(52) // 15 of 29 (open today excluded)
  })
  it('custom: only scheduled days count', () => {
    const sat = h({ frequency: 'custom', daysOfWeek: [6] })
    expect(consistency(sat, S('2027-01-02'), '2027-01-03', '2026-12-26')).toBe(50) // Sat Dec 26 missed, Sat Jan 2 done
  })
  it('weekly: compares against timesPerWeek x weeks, capped at 100, null before a week', () => {
    const w = h({ frequency: 'weekly', timesPerWeek: 2 })
    expect(consistency(w, S('2027-01-01'), '2027-01-02', '2026-12-28')).toBeNull()
    expect(consistency(w, S('2026-12-28', '2026-12-30'), '2027-01-03', '2026-12-28')).toBe(100)
    expect(consistency(w, S('2026-12-28'), '2027-01-03', '2026-12-28')).toBe(50)
  })
})

describe('repo', () => {
  const base = { name: 'Guitar', frequency: 'daily' as const, minimum: '5 min', target: '20 min' }
  it('create, complete minimum, upgrade to target, undo', async () => {
    const db = freshDb()
    const habit = await createHabit(base, db)
    await setCompletion(habit.id, 'minimum', '2027-01-03', db)
    await setCompletion(habit.id, 'target', '2027-01-03', db)
    let [t] = await listToday(db, '2027-01-03')
    expect(t.completion?.level).toBe('target')
    expect(t.streak).toBe(1)
    expect(await db.habitCompletions.count()).toBe(1) // upgrade edits in place
    await clearCompletion(habit.id, '2027-01-03', db)
    ;[t] = await listToday(db, '2027-01-03')
    expect(t.completion).toBeUndefined()
    await setCompletion(habit.id, 'minimum', '2027-01-03', db) // re-complete after undo
    ;[t] = await listToday(db, '2027-01-03')
    expect(t.completion?.level).toBe('minimum')
  })
  it('archived habits leave the list; order follows creation', async () => {
    const db = freshDb()
    const a = await createHabit(base, db)
    const b = await createHabit({ ...base, name: 'Read' }, db)
    expect((await listToday(db)).map((x) => x.habit.name)).toEqual(['Guitar', 'Read'])
    await archiveHabit(a.id, true, db)
    expect((await listToday(db)).map((x) => x.habit.id)).toEqual([b.id])
  })
})
