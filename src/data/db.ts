import Dexie, { type Table, type Transaction } from 'dexie'
import type {
  CalendarEvent, Goal, Habit, HabitCompletion, JournalEntry, KeyValue, Review, Task, TimeEntry,
} from './types'

/**
 * Schema history. NEVER edit a published version — add a new one, an UPGRADES entry if
 * data must change shape, and a fixture in src/data/__fixtures__/ (see migrations.test.ts).
 */
export const SCHEMAS: Record<number, Record<string, string>> = {
  1: {
    journal: 'id, date, updatedAt',
    habits: 'id, order',
    habitCompletions: 'id, habitId, date, [habitId+date]',
    timeEntries: 'id, startedAt, isOpen',
    goals: 'id, year',
    tasks: 'id, date, week',
    events: 'id, startDate',
    reviews: 'id, [period+periodKey]',
    settings: 'key',
    meta: 'key',
  },
}

export const UPGRADES: Record<number, (tx: Transaction) => Promise<void>> = {}

export const SCHEMA_VERSION = Math.max(...Object.keys(SCHEMAS).map(Number))
export const TABLES = Object.keys(SCHEMAS[SCHEMA_VERSION])

export class KaizenDB extends Dexie {
  declare journal: Table<JournalEntry, string>
  declare habits: Table<Habit, string>
  declare habitCompletions: Table<HabitCompletion, string>
  declare timeEntries: Table<TimeEntry, string>
  declare goals: Table<Goal, string>
  declare tasks: Table<Task, string>
  declare events: Table<CalendarEvent, string>
  declare reviews: Table<Review, string>
  declare settings: Table<KeyValue, string>
  declare meta: Table<KeyValue, string>

  constructor(name = 'kaizen') {
    super(name)
    for (const v of Object.keys(SCHEMAS).map(Number)) {
      const version = this.version(v).stores(SCHEMAS[v])
      if (UPGRADES[v]) version.upgrade(UPGRADES[v])
    }
  }
}

export const db = new KaizenDB()
