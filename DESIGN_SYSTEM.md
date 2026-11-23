# Design system

Japanese-inspired minimalism: restraint, natural materials, balance, detail. Not a "Japanese restaurant website".
Calm, organised, premium. **Legibility beats decoration.** Tokens live in `src/index.css`.

## Colour tokens

| Tailwind name | Role | Light | Dark |
|---|---|---|---|
| `washi` | Page background | `#F6F4EF` | `#141413` |
| `surface` | Cards, inputs | `#FFFFFF` | `#1E1E1C` |
| `ink` | Primary text | `#1C1C1A` | `#ECEAE4` |
| `muted` | Secondary text, idle icons | `#6E6B64` | `#9B978E` |
| `line` | Hairline borders | `#E4E0D7` | `#2E2D2A` |
| `bamboo` | Primary accent, active tab, primary button | `#5E7D52` | `#93B486` |
| `on-bamboo` | Text on bamboo | `#FFFFFF` | `#141413` |
| `sand` | Secondary accent, attention without alarm | `#C9B79A` | `#B8A586` |
| `stone` | High-contrast surfaces (sparingly) | `#2A2A28` | `#0E0E0D` |
| `glass` | Tab bar / sheets only, with `backdrop-blur-lg` | washi @ 78% | washi @ 78% |

Theme: System / Light / Dark in Settings (`data-theme` on `<html>`). Never raw hex in components.

## Type
System font (SF Pro on iPhone, Segoe UI on Windows). Scale: `text-xs` 13 · `text-sm` 15 · `text-base` 17 (body)
· `text-lg` 20 · `text-xl` 24 · `text-2xl` 32 (screen titles, semibold, tight tracking). Line height 1.5.
Labels are sentence case — no tracked capitals except the sidebar wordmark.

## Space, shape, depth
- 4pt grid: 4, 8, 12, 16, 24, 32, 48. Screen gutters 20px (iPhone), 40px (desktop). Generous whitespace.
- Radius: `rounded-card` 12px, `rounded-sheet` 16px.
- Hairline `border-line` borders; `shadow-soft` only for raised selections.

## Motion
150–250ms, `ease-calm`. Colour and opacity only for small state changes. `prefers-reduced-motion` respected globally.

## Interaction
- Touch targets ≥ 44px (`min-h-11` buttons, `min-h-14` tabs/rows). Primary actions in thumb reach.
- iPhone: bottom tab bar — Today, Journal, Habits, Timer, More (Year, Weekly Review, Settings). Desktop: sidebar.
- Safe areas: content pads `env(safe-area-inset-top)`, tab bar pads `env(safe-area-inset-bottom)`.
- Icons: Lucide, `strokeWidth={1.75}`, 18–22px, `aria-hidden` when labelled by text.

## Components (src/components)
- `Screen` — page frame: large title + optional action, max width 2xl, bottom padding clears the tab bar.
- `Card` — `rounded-card border-line bg-surface p-4`.
- Buttons — primary `bg-bamboo text-on-bamboo`, quiet `border-line bg-surface`; `min-h-11 rounded-card text-sm`.
Add shadcn/ui components only when a feature needs one, restyled with these tokens.

## Critics (run, don't study)
- `npx impeccable detect http://localhost:5173/kaizen/#/<route>` on every new screen; `/impeccable critique|polish` skill.
- `hallmark` skill for audits against AI-generated tells.
- `ui-ux-pro-max` skill for mobile patterns (navigation, sheets, forms, accessibility).
- Optional references: drop screenshots of apps whose feel you like into `docs/design/refs/`.

## DESIGN_REVIEW checklist — every screen, on the real iPhone
- [ ] The primary task takes 3 taps or fewer.
- [ ] The most important action is obvious immediately.
- [ ] Comfortable one-handed.
- [ ] Nothing that could be removed.
- [ ] Follows this document and feels like the other screens.
- [ ] No simpler way to do the same thing.
- [ ] Readable in light and dark; respects reduced motion.
