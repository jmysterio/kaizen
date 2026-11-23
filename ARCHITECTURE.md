# Architecture

## Layers

```
Screens  src/features/<feature>/*Screen.tsx      (React, Tailwind tokens)
   │  import hooks/functions only
   ▼
Repositories  src/data/repos/*.ts                (useLiveQuery hooks + commands)
   │  built on makeRepo()  src/data/repo.ts
   ▼
Dexie  src/data/db.ts                            (versioned schema + upgrades)
   ▼
IndexedDB on the device                          [future: encrypted sync adapter — not built]
```

Shell: `src/app/Shell.tsx` (iPhone tab bar / desktop sidebar), `src/app/routes.tsx` (route table),
`src/app/router.ts` (hash routing — works on GitHub Pages and offline).

## Rules
- Only `src/data/**` imports `db`. Screens never do.
- Every user record: `id` (UUID), `createdAt`, `updatedAt`, optional `deletedAt` (soft delete), optional `goalId`.
- `all()` / `get()` in `makeRepo` hide soft-deleted rows.
- Dates are local `YYYY-MM-DD` (`toDateKey`).
- **Timer rule:** a running clock is never stored. A `TimeEntry` stores `startedAt`, `endedAt|null`,
  `pausedAt|null`, `pausedMs`, `isOpen (0|1)`. Elapsed = (endedAt ?? pausedAt ?? now) − startedAt − pausedMs.
  At most one entry with `isOpen = 1`, enforced inside a `rw` transaction on `timeEntries`.
- **Migrations:** `SCHEMAS[n]` is immutable once shipped. A change adds `SCHEMAS[n+1]`, an optional `UPGRADES[n+1]`,
  and `__fixtures__/v(n+1).json`. `migrations.test.ts` seeds every version's fixture and opens it with the
  current schema, asserting nothing is lost.
- **Backup:** `exportBackup()` → `{ app, schemaVersion, exportedAt, tables }`. `validateBackup()` is the trust
  boundary for user files. `importBackup(b, 'replace' | 'merge')` runs in one transaction across all tables
  (failure = no change). Merge keeps whichever copy has the newer `updatedAt`.
- **Persistence:** `navigator.storage.persist()` is requested on launch. Status shows in Settings → Diagnostics,
  with storage use, record counts, last backup, build time and the last 20 errors.

## Database schema (v1)

| Table | Key / indexes | Record |
|---|---|---|
| journal | id, date, updatedAt | `date`, `text`, `prompts?` {accomplished, learned, better, grateful, improve} |
| habits | id, order | `name`, `frequency` daily/weekly/custom, `daysOfWeek?`, `timesPerWeek?`, `minimum`, `target`, `stackAfter?`, `archived?`, `order` |
| habitCompletions | id, habitId, date, [habitId+date] | `habitId`, `date`, `level` minimum/target, `note?` |
| timeEntries | id, startedAt, isOpen | `activity`, `habitId?`, `startedAt`, `endedAt`, `pausedAt`, `pausedMs`, `isOpen` |
| goals | id, year | `title`, `description?`, `category?`, `year`, `targetDate?`, `status`, `progress` 0–100 |
| tasks | id, date, week | `title`, `kind` task/weekly-priority, `date?`, `week?` (ISO `2027-W03`), `done` |
| events | id, startDate | `title`, `category` personal/trip/milestone/deadline, `startDate`, `endDate?`, `note?` |
| reviews | id, [period+periodKey] | `period` week, `periodKey`, `answers` |
| settings | key | `{ key, value }` (theme, …) |
| meta | key | `{ key, value }` (lastBackupAt, errors) |

Types: `src/data/types.ts`. External Google Calendar events get their own table when that backlog item is built.

## Tests
- `src/data/*.test.ts` (Vitest + fake-indexeddb): repo CRUD/soft delete, migrations, backup round-trip,
  merge, validation, rollback on failed import.
- `e2e/*.spec.ts` (Playwright, iPhone 15 viewport, production build): navigation, offline after first load,
  restore + backup through the Settings UI, rejecting bad files.
