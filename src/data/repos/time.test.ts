import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KaizenDB } from '../db'
import { addManualEntry, editEntry, elapsed, pauseTimer, removeEntry, resumeTimer, startTimer, stopTimer } from './time'

let db: KaizenDB
const openCount = () => db.timeEntries.where('isOpen').equals(1).count()
const MIN = 60_000
const t = (h: number, m = 0) => new Date(2027, 0, 5, h, m).getTime()

beforeEach(() => {
  db = new KaizenDB(`test-${crypto.randomUUID()}`)
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(t(12))
})
afterEach(() => vi.useRealTimers())

describe('timer', () => {
  it('excludes pause time from elapsed', async () => {
    const e = await startTimer('Guitar', undefined, db)
    vi.setSystemTime(t(12, 10))
    await pauseTimer(db)
    vi.setSystemTime(t(12, 40))
    expect(elapsed((await db.timeEntries.get(e.id))!)).toBe(10 * MIN)
    await resumeTimer(db)
    vi.setSystemTime(t(12, 45))
    await stopTimer(db)
    const done = (await db.timeEntries.get(e.id))!
    expect(done.isOpen).toBe(0)
    expect(elapsed(done)).toBe(15 * MIN)
  })

  it('stopping while paused ends at the pause moment', async () => {
    const e = await startTimer('Read', undefined, db)
    vi.setSystemTime(t(12, 4))
    await pauseTimer(db)
    vi.setSystemTime(t(12, 24))
    await stopTimer(db)
    expect(elapsed((await db.timeEntries.get(e.id))!)).toBe(4 * MIN)
  })

  it('never has two open entries: starting switches', async () => {
    await startTimer('A', undefined, db)
    vi.setSystemTime(t(12, 1))
    await Promise.all([startTimer('B', undefined, db), startTimer('C', undefined, db)])
    expect(await openCount()).toBe(1)
    expect(await db.timeEntries.count()).toBe(3)
  })

  it('rejects an empty activity', async () => {
    await expect(startTimer('  ', undefined, db)).rejects.toThrow()
    expect(await db.timeEntries.count()).toBe(0)
  })
})

describe('manual entries', () => {
  it('validates end after start', async () => {
    await expect(addManualEntry('X', t(9), t(9), db)).rejects.toThrow('End must be after start')
  })

  it('rejects overlap with the open timer but allows earlier ranges', async () => {
    await startTimer('Run', undefined, db)
    await expect(addManualEntry('X', t(11, 30), t(12, 30), db)).rejects.toThrow('Overlaps')
    await expect(addManualEntry('X', t(9), t(10), db)).resolves.toBeTruthy()
  })

  it('edits and soft-deletes; deleting the open timer closes it', async () => {
    const m = await addManualEntry('X', t(9), t(10), db)
    await editEntry(m.id, 'Y', t(9), t(11), db)
    expect(elapsed((await db.timeEntries.get(m.id))!)).toBe(120 * MIN)
    const run = await startTimer('Run', undefined, db)
    await expect(editEntry(run.id, 'Run', t(8), t(9), db)).rejects.toThrow('Stop the timer')
    await removeEntry(run.id, db)
    expect(await openCount()).toBe(0)
    expect((await db.timeEntries.get(run.id))?.deletedAt).toBeTruthy()
  })
})
