# Brief: Habits (branch feature/habits)

Owns: `src/features/habits/**`, `src/data/repos/habits.ts` (+ test), `e2e/habits.spec.ts`.
Route `#/habits` renders `HabitsScreen`. Tables: `habits`, `habitCompletions`.

Build:
- Today's habits as a list; one tap marks the **minimum**, a second action marks **target** (Atomic Habits:
  "never miss twice", reward consistency over perfection). Undo a completion.
- Create/edit habit: name, frequency (daily / weekly N times / custom weekdays), minimum, target
  (free text, e.g. "5 min" / "20 min"), optional "after I…" stacking note. Archive instead of delete.
- Per habit: current streak and consistency (e.g. last 30 days %). Streak logic must respect the frequency
  (a weekly 3× habit isn't broken by a quiet Tuesday). Unit-test streak/consistency thoroughly.
- Expose `useTodayHabits()` (habit + today's completion) for the Today screen later.
Done when: create → complete minimum → upgrade to target → reload persists; streak tests pass for all frequencies.
