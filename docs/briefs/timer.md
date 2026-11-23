# Brief: Timer (branch feature/timer)

Owns: `src/features/timer/**`, `src/data/repos/time.ts` (+ test), `e2e/timer.spec.ts`.
Route `#/timer` renders `TimerScreen`. Table: `timeEntries`.

Build (read the Timer rule in ARCHITECTURE.md):
- Start an activity (free text with recent activities as quick picks; optional habit link via `habitId`).
- Pause / resume / stop / switch (switch = stop current + start new, atomically).
- **Never store a running clock.** Elapsed time is computed from timestamps; the display ticks with a 1s
  interval only while visible. At most one open entry — enforce in a `rw` transaction; starting while one
  is open is either a switch or rejected, never an overlap.
- Manual entry (activity, start, end) with validation (end after start, no overlap with the open timer).
- Today's entries and totals; this week's total per activity. Edit/delete (soft) an entry.
- Expose `useActiveTimer()` and `useTodayTotal()` for the Today screen later.
Done when: Playwright starts a timer, closes the page, reopens later (advance the clock) and sees correct elapsed
time; a second concurrent timer is impossible; pause time is excluded.
