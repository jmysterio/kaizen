import type { DateKey } from './types'

/** Local-time `YYYY-MM-DD` (not UTC — a late-night entry belongs to today). */
export const toDateKey = (d: Date = new Date()): DateKey =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
