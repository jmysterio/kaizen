# Kaizen

A calm, private, iPhone-first app for journaling, habits, time and weekly reflection.
Everything is stored on your device. Nothing is sent anywhere.

**Live app:** https://jmysterio.github.io/kaizen/

## Status
- ✅ **Phase 0 — Foundation:** data layer (all v1 tables), backup/restore, app shell, design tokens,
  offline PWA, diagnostics, tests, GitHub Pages deploy.
- ✅ **Phase 1 — Daily core:** Journal, Habits, Timer (built in parallel) and the Today screen.
- ⏭ **Now — 2-week live-in:** use it daily; log friction as journal entries tagged `#kaizen-app`.
  Soak checks on day 1, 3, 7 go in DECISIONS.md.
- Then: Phase 3 Year Calendar → Phase 4 Goals + Weekly Review.

Philosophy: PHILOSOPHY.md · Plan: ARCHITECTURE.md · DESIGN_SYSTEM.md · DECISIONS.md · instructions for Claude: CLAUDE.md

## Install on iPhone
1. Open **Chrome** on the iPhone and go to the live app link above.
2. Tap the **Share** button (top right, box with an arrow) → **Add to Home Screen** → **Add**.
3. Always open Kaizen from the Home Screen icon — the installed app keeps its own storage.
4. Settings → **Back up now** saves a file (choose **Save to Files**). Do this regularly.

## Develop
```
npm install
npm run dev        # http://localhost:5173/kaizen/
npm test           # Vitest
npm run e2e        # Playwright (first time: npx playwright install chromium)
npm run build
```
Pushing to `main` deploys to GitHub Pages.
