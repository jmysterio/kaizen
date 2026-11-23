# Kaizen 2027 --- Design System

**Version:** 1.1 --- refined visual direction\
**Status:** Working design specification\
**Product:** Personal journal, planning, habits, time tracking, and
continuous improvement\
**Primary platform:** iPhone-first responsive PWA, with Windows and Mac
support\
**Design direction:** Japanese architectural minimalism · modern
wabi-sabi · quiet luxury · natural photography · calm focus

------------------------------------------------------------------------

## 1. The refined creative direction

Kaizen should feel like a quiet, carefully designed Japanese
architectural space: uncluttered, precise, grounded in natural
materials, and connected to the landscape beyond it.

The strongest influence is **Japanese architectural minimalism**, rather
than rustic or heavily decorative wabi-sabi. Think generous space,
considered proportions, clean geometry, restrained details, natural
light, and a close relationship between interior and nature.

The interface itself should remain exceptionally clean. Natural
materials appear as subtle tactile details---paper-like surfaces, a
little wood grain, dark stone, and occasional translucent glass---not as
textures layered over every screen.

Nature photography is an important part of the experience. It should
create atmosphere, emotional connection, and a sense of changing seasons
and time. Photography should be composed and art-directed, not used as
generic stock decoration. It must never make controls or text hard to
read.

The overall palette is nearly monochromatic: warm off-whites, charcoal,
stone gray, and deep brown. Green is used sparingly as a quiet signal of
life, selection, or progress---not as the dominant brand color.

Evening should feel like a warm, dim interior: walnut, dark brown,
charcoal, muted amber, and soft pools of light. It should be restful and
intimate, not a blue-black developer dashboard.

**Emotional goal:** When the user opens Kaizen, they should feel calmer,
more present, and clearer about what matters next.

**Design mantra:** *Make space for what matters.*

### The balance to preserve

  -----------------------------------------------------------------------
  Attribute                           Direction
  ----------------------------------- -----------------------------------
  Minimalism                          Strong --- spacious, precise,
                                      uncluttered

  Wabi-sabi                           Present in material, light, and
                                      natural imperfection; not rustic
                                      clutter

  Natural texture                     Subtle and tactile

  Photography                         Strong visual element, used
                                      intentionally

  Color                               Restrained, near-monochromatic

  Green                               Rare accent, not the main identity

  Glass                               Occasional and functional

  Overall feeling                     Architectural, calm, premium,
                                      restorative
  -----------------------------------------------------------------------

## 2. Design principles

### 2.1 Ma --- meaningful negative space

Whitespace is a design material. Give content room to breathe. Avoid
filling every available area with cards, metrics, labels, or decoration.

### 2.2 Architectural restraint

Use clear alignment, consistent proportions, strong composition, and
simple geometry. A screen should feel deliberately arranged, not
assembled from a pile of widgets.

### 2.3 Wabi-sabi --- natural warmth

Allow subtle irregularity and organic material cues through photography,
paper-like surfaces, wood, and stone. Do not make the UI visually rough,
distressed, or difficult to scan.

### 2.4 Shibui --- quiet refinement

Favor understatement. Use a small number of carefully selected details.
Avoid loud gradients, saturated accent colors, excessive badges, thick
borders, and gratuitous animation.

### 2.5 Nature as atmosphere

Photography can establish the mood of a screen or moment. It should
support the user's experience, not compete with the information or
become a wallpaper slideshow.

### 2.6 Gentle accountability

Progress should be visible without shame. Missed habits are information,
not failure. Encourage returning, adjusting, and continuing.

### 2.7 Functional simplicity

Make the user's frequent actions immediate: capture a thought, see
today's priorities, complete a habit, start or stop a timer, and
reflect.

### 2.8 Responsive by design

Design for a real iPhone first, then expand gracefully to tablet and
desktop. Never shrink a desktop dashboard onto a phone.

## 3. Visual language and references

Use these influences as a coherent visual vocabulary:

  -----------------------------------------------------------------------
  Influence               Desired qualities       UI translation
  ----------------------- ----------------------- -----------------------
  Japanese contemporary   Clean geometry, natural Layout grid, alignment,
  architecture            materials, proportion,  spacing, composition
                          restraint               

  Shoji and washi         Diffused light, warm    Light surfaces, subtle
                          translucency, paper     overlays, quiet
                                                  separators

  Black stone             Graphite, charcoal,     Text, dark surfaces,
                          depth, natural texture  neutral controls

  Walnut and aged wood    Warm brown, grain,      Evening surfaces and
                          tactility               small material details

  Bamboo and moss         Muted organic green,    Rare accent and
                          vertical rhythm         positive progress

  Misty mountains         Atmospheric depth, soft Hero photography,
                          transitions             time-of-day mood

  Water, sand, and raked  Rhythm, repetition,     Subtle progress
  gravel                  stillness               patterns and motion
                                                  inspiration
  -----------------------------------------------------------------------

**Do not** turn these influences into obvious themed decoration. Avoid
random kanji, red sun symbols, torii gates, fans, cherry blossoms
everywhere, samurai imagery, or stereotypical "Japanese" motifs.

### Reference-image collection

Create a `design-references/` folder in the project and keep approved
references there. Recommended files:

-   `kaizen-moodboard.png` --- overall moodboard and UI direction
-   `architecture-interior.jpg` --- contemporary Japanese architecture,
    wood, stone, and light
-   `bamboo-filtered-light.jpg` --- bamboo and soft natural light
-   `zen-stone-garden.jpg` --- black stone, gravel, and negative space
-   `walnut-wood-detail.jpg` --- restrained warm wood grain
-   `shoji-paper-light.jpg` --- diffused light and translucent paper
-   `misty-mountain-morning.jpg` --- morning atmosphere
-   `forest-daylight.jpg` --- balanced daytime nature photography
-   `warm-interior-evening.jpg` --- dark wood, warm pools of light, and
    evening calm

Use original or appropriately licensed images. Treat references as
visual guidance, not assets to copy from another product.

## 4. Color system

The core interface is near-monochromatic and warm. Avoid a conventional
green SaaS identity. Charcoal and stone establish the visual identity;
green is a rare natural accent.

These are initial design tokens. Validate contrast and rendering on
actual iPhone hardware before locking them.

### 4.1 Core palette

  Token                Starting value Role
  ------------------ ---------------- ------------------------------------
  `canvas`                  `#F1EFE9` Main warm architectural background
  `surface`                 `#F8F7F3` Primary content surface
  `surface-raised`          `#FCFBF8` Floating or elevated surface
  `surface-muted`           `#E6E3DC` Secondary surface
  `ink`                     `#292A28` Primary text
  `ink-muted`               `#777873` Secondary text
  `stone`                   `#777873` Neutral emphasis
  `stone-light`             `#D2D0C9` Quiet borders and dividers
  `charcoal`                `#303230` Dark neutral and selected controls
  `charcoal-deep`           `#202220` Dark theme foundation
  `walnut`                  `#70513D` Evening warmth
  `wood-light`              `#A88A70` Very restrained warm detail
  `amber-muted`             `#B58B58` Evening highlight, used sparingly
  `moss`                    `#69745C` Rare organic accent
  `paper`                   `#EAE6DC` Warm light text/surface
  `mist`                    `#DADBD6` Atmospheric neutral

### 4.2 Color behavior

-   Use warm off-white rather than pure white for the primary light
    theme.
-   Use charcoal and stone for primary identity, controls, and visual
    hierarchy.
-   Use green only for selected states, subtle progress, or a small
    nature-inspired detail.
-   Use walnut and muted amber primarily in Evening mode.
-   Keep status colors semantic and distinct from decorative colors.
-   Never communicate status through color alone.
-   Avoid bright saturated colors, neon, and large colorful gradients.
-   Ensure text and controls meet WCAG AA contrast targets where
    applicable.

## 5. Time-of-day themes

Morning, Daytime, and Evening are atmospheric variations of one design
system. Layout, component behavior, spacing, and interaction patterns
remain consistent. The palette, photography, and lighting mood change
gently.

Provide **Automatic** and manual theme selection. Automatic mode uses
local device time, but a user override always takes precedence.

### 5.1 Morning --- "First light"

**Mood:** quiet optimism, clarity, renewal, fresh attention.

-   Warm ivory and pale stone foundation.
-   Soft natural light, mist, pale sky, and restrained warm highlights.
-   Photography: misty hills, bamboo with filtered light, soft morning
    shadows, still water.
-   Charcoal typography with excellent contrast.
-   Green may appear as a subtle accent.
-   Keep the interface bright and open, not yellow or overly cheerful.

Suggested copy tone: - "Good morning." - "What matters today?" - "Begin
with one small step."

### 5.2 Daytime --- "In balance"

**Mood:** grounded, clear, productive, composed.

-   Neutral warm-paper canvas.
-   Stone, charcoal, and off-white surfaces.
-   Photography: forest paths, bamboo in natural daylight, architectural
    wood and stone, quiet landscapes.
-   Minimal atmospheric effects; information and controls take priority.
-   This is the most functional and neutral mode.

Suggested copy tone: - "Stay with what matters." - "One thing at a
time." - "Progress is taking shape."

### 5.3 Evening --- "Warm retreat"

**Mood:** restorative, intimate, reflective, peaceful.

-   Deep warm charcoal and brown rather than blue-black.
-   Walnut and dark wood undertones.
-   Muted amber used like warm lamplight, not a bright accent.
-   Warm off-white text; avoid harsh pure white.
-   Photography: warmly lit Japanese interiors, dark wood, quiet gardens
    at dusk, soft lantern-like light, evening landscapes.
-   Reflection and journaling become visually prominent.
-   Lower visual stimulation while retaining readable contrast.

Suggested copy tone: - "Take a moment." - "What went well today?" -
"What can be made easier tomorrow?"

### 5.4 Theme behavior requirements

-   Avoid a sudden theme flash when opening the app.
-   Do not switch themes while the user is actively writing or
    completing an interaction.
-   Respect the system reduced-motion setting.
-   Test all themes for forms, calendar states, charts, overlays, and
    text contrast.
-   Offer a manual override and a clear way to return to Automatic.
-   The app must remain fully usable if photography fails to load.

## 6. Photography art direction

Photography is a defining part of Kaizen's atmosphere. Treat it as a
curated visual layer with a consistent art direction.

### 6.1 Subject matter

Prioritize: - Japanese contemporary architecture and quiet interiors. -
Bamboo, forests, moss, stone, water, and restrained gardens. - Misty
mountains, fog, overcast light, dawn, and dusk. - Natural wood, paper,
stone, and filtered sunlight. - Seasonal changes and subtle details in
nature.

Avoid: - Generic corporate lifestyle stock photography. - Overly
saturated travel imagery. - Clichéd Japanese tourist imagery. - Busy
scenes with many people or objects. - Images with embedded text, logos,
or watermarks.

### 6.2 Composition

-   Favor calm, spacious compositions with a clear focal point.
-   Use negative space where text may overlay the image.
-   Favor natural light, soft contrast, and restrained color grading.
-   Avoid busy high-frequency detail behind text or controls.
-   Use a consistent crop and focal-point strategy across screen sizes.
-   Use portrait-friendly compositions for mobile hero areas and wider
    landscapes for desktop.

### 6.3 Where photography belongs

Appropriate places: - A dashboard welcome/hero region. - Morning,
daytime, and evening atmosphere. - Journal and reflection moments. -
Empty states or occasional milestone reflections. - Optional seasonal or
annual review experiences.

Avoid putting photography: - Behind dense forms or long journal text. -
Behind calendar grids or data tables. - Behind every card or list row. -
In places where it makes the interface slower or harder to scan.

### 6.4 Technical and accessibility rules

-   Store selected images locally or serve optimized assets; do not rely
    on a remote image request for the app's core function.
-   Use responsive image sizes and modern formats such as WebP/AVIF
    where supported.
-   Lazy-load nonessential images.
-   Provide a solid-color fallback.
-   Add appropriate alt text for meaningful images; mark purely
    decorative imagery as decorative.
-   Add a subtle scrim or separate solid surface behind overlaid text.
-   Test text contrast across the entire crop, not just the center.
-   Never let image loading block the journal, timer, habits, or
    calendar.

## 7. Typography

Typography should feel architectural, editorial, and highly readable.

-   Use a refined serif sparingly for page titles, reflective prompts,
    and occasional editorial moments.
-   Use a clean sans-serif for navigation, body text, buttons, forms,
    tables, calendar labels, and data.
-   Avoid decorative Japanese fonts for ordinary English UI.
-   Use a restrained type scale and consistent weights.
-   Keep mobile body text comfortable and controls legible.

Fonts to evaluate: - **UI/body:** Inter, Geist, or another clean modern
sans-serif. - **Display/reflective headings:** Newsreader or a similarly
restrained, readable serif. - **Japanese glyph fallback:** reliable
system fallback only where needed.

Choose based on rendering quality, licensing, performance, and glyph
coverage. Avoid loading unnecessary font families.

## 8. Layout, spacing, and shape

-   Use a consistent 4px or 8px spacing scale.
-   Give content generous margins and clear section separation.
-   Favor simple geometry, careful alignment, and consistent
    proportions.
-   Use restrained corner radii; do not make everything a pill.
-   Avoid cards inside cards and unnecessary containers.
-   Use thin, low-contrast dividers only when they improve scanning.
-   Keep primary actions easy to reach with one hand on iPhone.
-   Respect iOS safe areas and bottom navigation space.
-   Aim for touch targets of at least 44×44 CSS pixels.
-   On desktop, use considered content widths rather than stretching all
    content edge to edge.

## 9. Surfaces and materials

### 9.1 Paper and plaster

Use warm, matte surfaces with subtle tonal variation. The interface
should feel tactile but remain crisp and clean.

### 9.2 Stone and charcoal

Use as the core neutral identity. Dark controls and selected states can
feel grounded without requiring a bright accent color.

### 9.3 Wood

Use walnut tones primarily in Evening mode and occasional small details.
Do not make the entire interface look like a wood texture.

### 9.4 Glass

Use selective glass effects for floating navigation, overlays, or a
small number of layered surfaces.

-   Keep translucency and blur subtle.
-   Maintain text contrast over every background.
-   Provide solid-color fallbacks.
-   Avoid blur on large scrolling surfaces and repeated list rows.
-   Do not make every card look like frosted glass.

### 9.5 Shadows and borders

Use soft, low-elevation shadows. Avoid heavy drop shadows, glowing
borders, and decorative outlines. Keep keyboard focus indicators visible
even if they are more pronounced than the aesthetic.

## 10. Motion and interaction

Motion should feel fluid, quiet, and purposeful.

-   Use short, subtle transitions for selection, expansion, navigation,
    and state changes.
-   Prefer gentle fades and small positional shifts over bouncy motion.
-   Avoid parallax, constant movement, and animated backgrounds.
-   Use animation to communicate cause and effect.
-   Provide immediate feedback for important actions.
-   Support reduced motion.
-   Never delay an action with an animation.

## 11. Iconography and graphic details

-   Use one consistent line-icon family (Lucide is the proposed
    baseline).
-   Keep stroke weight and optical size consistent.
-   Pair unfamiliar icons with labels.
-   Avoid emoji as the primary interface icon system.
-   Use small graphic details sparingly: thin rules, subtle circles,
    simple progress marks, and quiet geometric motifs.
-   Do not add decorative Japanese symbols merely to signal the theme.

## 12. Data visualization

The app should make progress understandable without turning life into a
competition.

-   Favor quiet bars, lines, small multiples, and simple completion
    indicators.
-   Use charcoal and stone as the baseline; use green sparingly for
    positive progress.
-   Use muted amber only for carefully chosen comparisons or evening
    details.
-   Avoid excessive gradients, 3D charts, gauges, and confetti.
-   Show context and time range clearly.
-   Do not imply a streak is the same as meaningful progress.
-   Explain metrics and provide useful empty states.
-   Ensure charts remain legible in all three themes.

## 13. Product-specific UX guidance

### Dashboard

A calm daily landing space. Show the date, one or two priorities,
habits, active timer, upcoming events, and a short intention or
reflection. A strong atmospheric image may anchor the top of the screen,
but the functional content should remain easy to reach and scan.

### Journal

Make writing welcoming and frictionless. Prioritize a comfortable
writing area, autosave feedback, search/history, and device dictation.
Prompts are optional. Photography may appear in the surrounding
atmosphere, never behind long-form writing.

### Habits

Celebrate returning and consistency, not perfection. Make minimum
commitments easy to complete. Missed days are not failures.

### Time tracking

Starting, pausing, resuming, switching, and stopping a timer should be
immediate and obvious. Persist active timer state safely. Prevent
overlapping timers without confusing the user.

### Goals and planning

Use progressive disclosure: annual direction, quarterly/monthly
milestones, weekly priorities, and daily actions. Avoid showing the
entire planning hierarchy on every screen.

### Annual calendar

The year-at-a-glance view is a signature feature. It should feel
spacious and scannable, with meaningful markers rather than dense text.
On iPhone, use a scrollable or focused month/day presentation rather
than forcing twelve tiny months onto one screen. Do not place
photographic backgrounds behind the calendar grid.

### Reviews

Reflection should feel like a quiet ritual, not a performance review.
Use encouraging prompts, concise summaries, and a clear path from
insight to one small next action. Evening mode can make this experience
especially warm and inviting.

## 14. Accessibility and usability standards

-   Target WCAG 2.2 AA contrast where applicable.
-   Support keyboard navigation and visible focus states on desktop.
-   Use semantic HTML and accessible labels.
-   Do not use color as the only signal.
-   Respect reduced motion and text scaling.
-   Make touch targets comfortable on iPhone.
-   Keep form labels persistent; do not rely on placeholder text alone.
-   Provide clear confirmation for destructive actions and undo where
    practical.
-   Test screen-reader names and interaction order.
-   Ensure the app works in bright outdoor light and dim evening
    conditions.
-   Ensure text over photography remains readable at all responsive
    sizes.

## 15. Technical implementation guidance

The initial application is a responsive, offline-capable PWA using
React, TypeScript, Vite, Tailwind, and reusable components.

-   Centralize colors, typography, spacing, radii, shadows, and motion
    as CSS variables.
-   Implement Morning, Daytime, and Evening through semantic theme
    variables, not duplicated component styles.
-   Keep components theme-agnostic.
-   Use a small set of reusable primitives; do not build an elaborate
    design-system framework prematurely.
-   Keep reference imagery separate from production imagery.
-   Optimize and locally cache essential imagery.
-   Lazy-load nonessential imagery.
-   Ensure the app remains useful offline if images are unavailable.
-   Test on a real iPhone throughout development.
-   Evaluate glass blur and image performance on actual hardware.

Suggested semantic tokens: `--color-canvas`, `--color-surface`,
`--color-surface-raised`, `--color-surface-muted`, `--color-ink`,
`--color-ink-muted`, `--color-stone`, `--color-charcoal`,
`--color-walnut`, `--color-amber-muted`, `--color-moss`,
`--color-border`, `--color-success`, `--color-warning`,
`--color-danger`, `--font-body`, `--font-display`, `--space-*`,
`--radius-*`, `--shadow-*`, `--motion-*`.

## 16. Design review checklist

Before accepting each screen or significant component, ask:

1.  Does this feel like a calm, contemporary Japanese architectural
    space?
2.  Is the composition spacious, precise, and intentional?
3.  Is the primary action obvious without shouting?
4.  Can the common task be completed in three taps or fewer where
    practical?
5.  Is the screen comfortable to use one-handed on iPhone?
6.  Is there unnecessary visual clutter or redundant information?
7.  Are natural materials subtle and tactile rather than decorative
    overload?
8.  Does photography add atmosphere without competing with content?
9.  Does the screen work in Morning, Daytime, and Evening modes?
10. Is every text/control combination legible and accessible?
11. Does motion feel fluid without being showy?
12. Is there a simpler way to accomplish the same task?
13. Does this feel like part of one coherent product?

Record important decisions and unresolved issues in `DESIGN_REVIEW.md`.
Code review is not visual design review: inspect the running app on a
real iPhone and desktop.

## 17. Image reference workflow for Claude Code

When reference images are present in `design-references/`:

1.  Inspect every image and describe the specific qualities worth
    borrowing: light, color, material, composition, typography, or
    atmosphere.
2.  Separate environmental inspiration from actual interface references.
3.  Do not copy a reference image literally or use it as a page
    background by default.
4.  Translate the qualities into design tokens and reusable components.
5.  Explain where each influence appears in the product and where it
    should not appear.
6.  Compare the rendered app against the references during visual QA.
7.  Keep reference assets read-only and do not replace them without
    approval.
8.  Verify that images are optimized, licensed/owned, and usable offline
    where needed.

The written design system is the source of truth for behavior,
accessibility, and implementation constraints. Images provide visual
context, not a substitute for a specification.

## 18. Open decisions for future refinement

These can be decided after seeing a working prototype:

-   Exact time boundaries for Automatic Morning, Daytime, and Evening.
-   Whether Morning and Daytime use different photography or share one
    default image.
-   How often nature imagery changes: fixed per theme, seasonal, or
    user-selectable.
-   Whether the dashboard hero image is large and immersive or a
    smaller, restrained header.
-   Whether Evening uses one deep warm theme or offers an additional dim
    warm-paper option.
-   Final font pairing after testing on iPhone and desktop.

## 19. Initial implementation recommendation

Build the first polished prototype around these choices:

-   Warm off-white and stone daytime foundation.
-   Charcoal as the primary visual identity.
-   Muted green used rarely.
-   Refined serif for selected headings; highly readable sans-serif for
    the interface.
-   Strong but carefully art-directed nature photography in a small
    number of meaningful places.
-   Subtle paper, stone, and wood material cues.
-   A warm walnut/charcoal/amber Evening theme.
-   Spacious architectural layouts and precise alignment.
-   No decorative Japanese clichés.

The success criterion is not "does this look Japanese?" It is: **does
opening Kaizen create a little more calm, clarity, and intention---and
does the interface make the next meaningful action feel easy?**

------------------------------------------------------------------------

## Implementation notes (how the code applies this spec)

*Added by Claude Code. Everything above is the owner's v1.1 spec and is the source of truth; this section only
maps it onto the code. Moodboard: `design-references/kaizen-moodboard.png`.*

### Tokens → Tailwind classes (`src/index.css`)

Components use **role** names only, never hex values or material names:

| Class | Role | Daytime | Morning | Evening |
|---|---|---|---|---|
| `canvas` | page background | `#F1EFE9` | `#F5F2EB` | `#1F1B17` |
| `surface` / `surface-raised` / `surface-muted` | cards, inputs, chips | `#F8F7F3` / `#FCFBF8` / `#E6E3DC` | warmer ivory | walnut-brown steps |
| `ink` / `ink-muted` | text | `#292A28` / `#636460` | `#292A28` / `#65625C` | paper `#EAE6DC` / `#ADA394` |
| `line` | hairlines | `#D2D0C9` | `#DBD5CA` | `#433A31` |
| `primary` / `on-primary` | primary buttons, selected controls | charcoal `#303230` | charcoal | amber-muted `#B58B58` |
| `accent` / `on-accent` | rare green: completed habits, progress | moss `#5F6A52` | moss | moss `#95A184` |
| `mist` | photo fallback panel | `#E4E2DC` | `#E9E4DA` | `#3A322B` |
| `glass` | tab bar only | canvas @ 82% | | |

Deviations from §4.1, made for WCAG AA: `ink-muted` `#777873` → `#636460` (5.2:1 on canvas) and moss `#69745C` → `#5F6A52`.
`impeccable detect` flags the warm off-white canvas as a common AI default; it is kept deliberately because §4.2 asks for it.

### Themes
`<html data-theme="morning|day|evening">`. Settings → Appearance: Automatic / Morning / Daytime / Evening.
Automatic = Morning before 11:00, Daytime until 17:00, Evening after (`themeForHour` in `src/app/theme.ts`, mirrored
in the pre-paint script in `index.html` so there is no flash). Re-checked only on launch and on returning to the app.

### Type
Inter Variable (UI) and Newsreader Variable (`font-display`: screen titles, Today greeting, daily question,
journal questions, section headings), self-hosted via `@fontsource-variable/*` and precached for offline use.
Scale: `text-xs` 13 · `sm` 15 · `base` 17 · `lg` 20 · `xl` 24 · `2xl` 32 · `3xl` 40.

### Components
- `Screen` (`src/components/Screen.tsx`) — page frame with serif title; no title = flush top (Today).
- `Card` — `rounded-card border-line bg-surface p-4`.
- `Hero` (`src/components/Hero.tsx`) — Today's greeting and daily question in a glass panel.
- `glass` utility (`src/index.css`) — frosted panel (surface ≈60% + 24px blur + hairline). **Any text that sits over the
  background photo must be on a `glass` panel**; inputs you type into stay solid (`bg-canvas` / `bg-surface-raised`).
- `primary` / `quiet` button classes (`src/components/styles.ts`).
- Photos: the app background (`Shell`), defaults in `public/photos/{morning,day,evening}.webp` (credits in `design-references/PHOTO_CREDITS.md`);
  the owner's own photos via Settings → Atmosphere, resized on-device and stored in settings (`photo.<theme>`),
  included in backups.

### Owner decision: immersive background (overrides §6.3 and §9.4)
At the owner's request the time-of-day photo fills the whole app background (not the desktop sidebar), behind a
`canvas/45` tint, and content sits on glass panels. Guardrails kept from the spec: text never sits directly on the
photo, writing areas are solid, the app works without the photo (canvas colour), and the photo is local/precached.

### Checks
- `npx impeccable detect http://localhost:5173/kaizen/#/<route>` on every changed screen, in each theme.
- §16 checklist on the real iPhone before merging any UI PR; record outcomes in `DESIGN_REVIEW.md`.
