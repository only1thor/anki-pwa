# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment (Nix)

**Always use Nix** to run commands in this project. The repo includes a `flake.nix` that provides Node.js 20, npm, and TypeScript.

```bash
nix develop          # Enter the dev shell (provides node, npm, tsc)
```

To run a single command without entering the shell:

```bash
nix develop --command npm run build
nix develop --command npm run dev
nix develop --command npx tsc --noEmit
```

Do **not** rely on system-installed `node`, `npm`, or `tsc` — use `nix develop` so the environment is reproducible.

## Commands

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Type-check + production build (tsc && vite build)
npm run preview      # Preview production build
npm run type-check   # TypeScript check without emit
```

No linting or test runner is configured.

## Architecture

This is an offline-first PWA flashcard app using React 19 + TypeScript + Vite with all data stored in IndexedDB via Dexie.js.

**Data flow:** React components → Dexie operations → IndexedDB → `useLiveQuery` re-renders components reactively. No global state manager; `useLiveQuery` (from `dexie-react-hooks`) handles reactive data.

**Routing:** State-based view switching in `App.tsx` (no router library) — views are `DeckList`, `DeckEditor`, and `CardReview`.

### Key source files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces (`Card`, `Deck`, `ReviewRating`, etc.) |
| `src/lib/db/index.ts` | Dexie schema + all CRUD operations for decks, cards, sessions, reviews |
| `src/lib/anki/sm2.ts` | SM-2 spaced repetition algorithm — card state machine (new → learning → review → relearning) |
| `src/lib/anki/parser.ts` | `.apkg` import stub (incomplete — file validation only, SQLite parsing not implemented) |
| `src/App.tsx` | Root component, view routing, shared state |
| `src/components/DeckList.tsx` | Deck listing and creation |
| `src/components/DeckEditor.tsx` | Deck/card editing |
| `src/components/CardReview.tsx` | Study interface (keyboard shortcuts: Space = flip, 1-4 = rate) |

### Database schema (IndexedDB, `AnkiPWA` db v1)

- `decks` — indexed on `id, name, created, modified`
- `cards` — indexed on `id, deckId, dueDate, state, created, modified`; stores SM-2 parameters (`easeFactor`, `interval`, `repetitions`)
- `sessions` / `reviews` — study history
- `settings` — app-wide settings

### SM-2 algorithm

`calculateSM2()` in `src/lib/anki/sm2.ts` handles interval/ease transitions. Ease factor range: 1.3–2.5. Ratings: Again (1) resets progress, Hard (2) ease −0.15, Good (3) no change, Easy (4) ease +0.15.

## PWA / service worker

The service worker is registered in `src/main.tsx`. PWA config (including Workbox cache strategies) lives in `vite.config.ts`. The app is designed to work fully offline after first load.
