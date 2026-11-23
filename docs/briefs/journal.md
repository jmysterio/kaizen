# Brief: Journal (branch feature/journal)

Owns: `src/features/journal/**`, `src/data/repos/journal.ts` (+ test), `e2e/journal.spec.ts`.
Route `#/journal` already renders `JournalScreen`. Table: `journal` (`JournalEntry` in types.ts).

Build:
- Today's entries at the top; a large, calm writing area that works with iPhone dictation (plain `<textarea>`,
  `autocapitalize="sentences"`, no custom key handling that fights dictation). Save keeps the draft safe —
  never lose text on navigation (autosave the draft or save on blur).
- Free-form entry by default. Optional guided mode: the 5 prompts (accomplished, learned, could do better,
  grateful, one small improvement tomorrow), each skippable, stored in `prompts`.
- Multiple entries per day, each timestamped (`createdAt`).
- History: entries grouped by date, newest first; tap to edit; delete (soft) with a confirm.
- Search across text and prompt answers.
Done when: write → force reload → entry is there; edit and delete work; search finds prompt answers.
