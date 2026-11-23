// Every user record carries these. Soft deletes + updatedAt keep future sync possible.
export interface Base {
  id: string
  createdAt: number
  updatedAt: number
  deletedAt?: number
  goalId?: string
}

/** Local calendar date, `YYYY-MM-DD`. */
export type DateKey = string

export type PromptKey = 'accomplished' | 'learned' | 'better' | 'grateful' | 'improve'

export interface Answer {
  question: string
  answer: string
}

export interface JournalEntry extends Base {
  date: DateKey
  text: string
  /** Name of the form used. Question wording is copied into `answers`, so editing a form never rewrites history. */
  form?: string
  answers?: Answer[]
  /** Entries written before forms existed (the 5 fixed prompts). Read them through `answersOf()`. */
  prompts?: Partial<Record<PromptKey, string>>
}

/** A named set of journal questions, kept in settings under `journalForms`. */
export interface JournalForm {
  id: string
  name: string
  questions: string[]
}

export interface Habit extends Base {
  name: string
  frequency: 'daily' | 'weekly' | 'custom'
  /** 0 = Sunday … 6 = Saturday, for 'custom'. */
  daysOfWeek?: number[]
  /** For 'weekly'. */
  timesPerWeek?: number
  minimum: string
  target: string
  stackAfter?: string
  archived?: boolean
  order: number
}

export interface HabitCompletion extends Base {
  habitId: string
  date: DateKey
  level: 'minimum' | 'target'
  note?: string
}

export interface TimeEntry extends Base {
  activity: string
  habitId?: string
  startedAt: number
  endedAt: number | null
  pausedAt: number | null
  pausedMs: number
  /** 1 while running or paused. IndexedDB can't index null/booleans, so this is the index for "the open timer". */
  isOpen: 0 | 1
}

export interface Goal extends Base {
  title: string
  description?: string
  category?: string
  year: number
  targetDate?: DateKey
  status: 'active' | 'done' | 'dropped'
  /** 0–100 */
  progress: number
}

export interface Task extends Base {
  title: string
  kind: 'task' | 'weekly-priority'
  date?: DateKey
  /** ISO week, e.g. `2027-W03`. */
  week?: string
  done: boolean
}

export interface CalendarEvent extends Base {
  title: string
  category: 'personal' | 'trip' | 'milestone' | 'deadline'
  startDate: DateKey
  endDate?: DateKey
  note?: string
}

export interface Review extends Base {
  period: 'week'
  /** e.g. `2027-W03` */
  periodKey: string
  answers: Record<string, string>
}

export interface KeyValue {
  key: string
  value: unknown
}
