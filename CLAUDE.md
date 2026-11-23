# Kaizen 2027 — instructions for Claude

Personal journal, habits, time, planning and reflection app. One user, iPhone first.
Prioritise usability, simplicity, data integrity, privacy and mobile performance over feature count.
Challenge unnecessary requirements. Build one thing at a time.

Why the app exists and the rules for every build decision: PHILOSOPHY.md (read it first).
Full plan and reasoning: ARCHITECTURE.md, DESIGN_SYSTEM.md, DECISIONS.md. Status: README.md.

## Commands
- `npm run dev` — dev server at http://localhost:5173/kaizen/
- `npm test` — Vitest (data layer, migrations, backup)
- `npm run e2e` — Playwright against the production build (iPhone 15 viewport)
- `npm run build` — type-check + build; `npx oxlint src` — lint
- `npx impeccable detect http://localhost:5173/kaizen/#/<route>` — design lint on a running screen

## Platform
PWA only — no Capacitor/native (no Mac, no Apple developer account). Develop in Chrome on Windows.
The user installs on iPhone via Chrome "Add to Home Screen" (WebKit underneath — the real phone is the test).
Settings → Diagnostics replaces Safari Web Inspector. Deployed to GitHub Pages at /kaizen/ (hash routing).

## Data rules (critical)
- Local-first: IndexedDB + Dexie. No backend, cloud DB, analytics or telemetry. Data never leaves the device.
- Only `src/data/**` touches Dexie. Screens import from `src/data/repos/*` (hooks + functions), never `db`.
- Feature repos build on `makeRepo()` in `src/data/repo.ts`: UUID ids, createdAt/updatedAt, soft delete via `deletedAt`.
- Every record may carry an optional `goalId`.
- Schema lives in `SCHEMAS` in `src/data/db.ts`. Never edit a published version: add a new version, an `UPGRADES`
  entry if shapes change, and `src/data/__fixtures__/vN.json`. `migrations.test.ts` must pass.
- Timers are stored timestamps recomputed on open (`startedAt`, `endedAt`, `pausedAt`, `pausedMs`, `isOpen`).
  At most one open TimeEntry, enforced inside a Dexie transaction.
- Dates are local `YYYY-MM-DD` via `toDateKey()` in `src/data/dates.ts`, never `toISOString()`.
- Backup = JSON with `schemaVersion`; import is validated and transactional. Don't weaken `validateBackup`.

## V1 scope — the six
Today · Journal · Habits · Timer · Year Calendar · Weekly Review, plus a light goals layer
(annual goals + weekly priorities) and Settings. Everything else is backlog: monthly/quarterly/annual reviews,
full goal cascade, Google Calendar, charts, push reminders, local speech-to-text, sync, voice inbox, LLM reviews.

- JOURNAL: multiple entries/day, free-form or 5 skippable prompts (accomplished, learned, do better, grateful,
  one small improvement tomorrow), timestamps, history, search, edit, delete, native-dictation-friendly input.
- HABITS: daily/weekly/custom; minimum + target (e.g. guitar 5/20 min); completions, streaks, consistency;
  stacking note. Reward consistency over perfection.
- TIMER: start/stop/pause/resume/switch, manual entries, daily/weekly totals, optional habit/goal link.
- YEAR CALENDAR: purpose-built, no stock month widget. 12 months on desktop; compact scrollable year on iPhone.
- WEEKLY REVIEW: original prompts inspired by Covey's 7 Habits and Atomic Habits' four laws (never book
  passages); exports a markdown "review packet".

## Design
Target look: DESIGN_SYSTEM.md (owner's v1.1 spec — source of truth) + `design-references/` (moodboard).
Follow the spec's §17 image-reference workflow; the written spec wins over images. Use role token classes
(`bg-canvas`, `bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `bg-primary text-on-primary`, `bg-accent`,
`font-display`) — never raw hex. Green (`accent`) is rare. Everything must work in Morning, Daytime and Evening.
Use `Screen` / `Card` / `Hero` and `primary` / `quiet`. Lucide icons strokeWidth 1.75. Touch targets ≥ 44px.
Critique UI with the impeccable, hallmark and ui-ux-pro-max skills. Reference repos in ../ are READ-ONLY.

## Workflow
**Every change goes through a pull request — never commit to `main` directly** (push to main = deploy).
`feature/<name>` branch → `gh pr create` → `/ponytail-review` → owner checks on iPhone via `npm run dev -- --host`
(LAN link) → merge only after the owner's OK.
Before merge: `npm test` + `npm run e2e` pass → `/ponytail-review` (evaluate, don't blindly apply) →
impeccable detect + DESIGN_REVIEW checklist on the iPhone for UI → no unresolved data-integrity or security issue.
Phase end: `/ponytail-audit`. Keep README status, DECISIONS.md and ARCHITECTURE.md current.
