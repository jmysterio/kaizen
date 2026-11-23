# Decisions

Short log of significant choices and why. Newest first.

## 2026-11-23 — Design v1.1 and PR workflow
- **Owner's Design System v1.1 adopted** (DESIGN_SYSTEM.md + moodboard) and implemented now rather than after the
  live-in, so the look keeps the app in daily use and later features are built in the final style.
- **Three time-of-day themes replace light/dark**; Automatic by local time with manual override.
- **Charcoal is the identity, green is rare**: v0 bamboo-green primary replaced.
- **Photography**: free-license defaults, owner can set their own per theme (stored on-device, in backups).
- **All changes via pull request**, reviewed on the iPhone before merge.

## 2026-11-23 — Foundation (Phase 0)
- **PWA only, no native shell.** Capacitor/iOS needs a Mac + Xcode and a $99/yr Apple developer account; the user
  wants neither. The soak test therefore decides how aggressive backup reminders are, not PWA vs native.
- **Chrome, not Safari.** iOS 16.4+ lets Chrome add web apps to the Home Screen. All iOS browsers use WebKit, so
  storage behaviour is the same; always use the installed app (separate storage from a browser tab).
- **Diagnostics panel instead of Safari Web Inspector** (which needs macOS).
- **GitHub Pages hosting** (public repo; only code is published — personal data never leaves the device).
  Hash routing so deep links and offline reloads work without server rewrites.
- **Scope: six features** (Today, Journal, Habits, Timer, Year Calendar, Weekly Review) per the LLM Council
  verdict; everything else is backlog until daily use asks for it.
- **All v1 tables defined up front** so Journal, Habits and Timer can be built by parallel agents without
  touching shared files.
- **Soft deletes + updatedAt on every record** — recovery now, sync later.
- **System font stack** — native on iPhone, zero download.
- **Process:** no PR-review committee. Gate = tests + `/ponytail-review` (lint) + impeccable detect + the
  user's DESIGN_REVIEW on the iPhone. Docs cut to README, DECISIONS, ARCHITECTURE, DESIGN_SYSTEM.

## Soak test results
| Check | Date | Result |
|---|---|---|
| Install from Chrome → Home Screen, opens offline | 2026-11-23 | ✅ iPhone + PC (Chrome app) |
| Backup → export → restore | 2026-11-23 | ✅ iPhone + PC (reinstall not yet tested) |
| Day 1: data present after force-quit + reboot | | |
| Day 3: present after 2 days unopened | | |
| Day 7: present after a week | | |
| Settings → Diagnostics "Storage persisted" | 2026-11-23 | ❌ No on both (checked before installing as apps — recheck) |

**Backup reminder level** (decide after day 7): weekly / after each session.
