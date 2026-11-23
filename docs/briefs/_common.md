# Rules for every Phase 1 feature agent

Read CLAUDE.md, ARCHITECTURE.md and DESIGN_SYSTEM.md first. They are binding.

- Work only on your branch (`feature/<name>`) in your own worktree. Commit there; do not merge or push.
- **You own only the files listed in your brief.** Do NOT edit `src/data/db.ts`, `src/data/types.ts`,
  `src/data/repo.ts`, `src/app/*`, `src/components/*`, `src/index.css`, the Today screen or another feature.
  If you genuinely need a change there (e.g. a type field), stop and report exactly what and why.
  You may add new files under your feature folder and your repo file.
- Data: build your repo on `makeRepo()` from `src/data/repo.ts`; expose `useLiveQuery` hooks + commands.
  Screens import only from your repo file. Hide soft-deleted rows. Use `toDateKey()` for dates.
- UI: `Screen` and `Card` from `src/components/Screen.tsx`, token classes only, Lucide icons strokeWidth 1.75,
  touch targets ≥ 44px, light + dark. Keep it calm and sparse — fewer controls beat more.
- Tests: `src/data/repos/<name>.test.ts` (Vitest, `import 'fake-indexeddb/auto'`, a fresh `new KaizenDB(uniqueName)`
  per test — so make your repo functions accept an optional db, defaulting to the shared one) and
  `e2e/<name>.spec.ts` (Playwright) for the main flow.
- Before handing back: `npm test`, `npm run e2e`, `npm run build`, `npx oxlint src` all pass;
  `npx impeccable detect http://localhost:5173/kaizen/#/<route>` is clean (start `npm run dev` first);
  run `/ponytail-review` on your diff and apply what is right.
- Hand back: what you built, test results, any shortcut you took, and anything you need changed in shared files.
