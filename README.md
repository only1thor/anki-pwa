# Anki PWA

A progressive web app for flashcard learning with spaced repetition, built with React, TypeScript, and IndexedDB.

## Features

- ✅ **Multiple Decks**: Organize flashcards into separate decks
- ✅ **Spaced Repetition**: SM-2 algorithm for optimal learning
- ✅ **Offline Support**: Works completely offline as a PWA
- ✅ **Mobile-First**: Optimized for mobile devices
- ✅ **Dark Theme**: Easy on the eyes
- ✅ **Keyboard Shortcuts**: Space to reveal, 1-4 to rate
- ✅ **Local Storage**: All data stays on your device using IndexedDB
- 🚧 **Import/Export**: .apkg support (coming soon)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Database**: Dexie.js (IndexedDB wrapper)
- **PWA**: vite-plugin-pwa with Workbox
- **Dev Environment**: Nix flake

## 🚀 Quick Deploy

**Deploy to GitHub Pages automatically:**

1. Push this repo to GitHub
2. Go to Settings → Pages → Source: "GitHub Actions"
3. Your app will be live at `https://username.github.io/repo-name/`

See [GITHUB_PAGES.md](GITHUB_PAGES.md) for detailed instructions.

**Or deploy to other platforms:**

See [DEPLOY.md](DEPLOY.md) for Netlify, Vercel, and more options.

## Getting Started

### Using Nix (Recommended)

If you have Nix with flakes enabled:

```bash
# Enter development environment
nix develop

# Install dependencies
npm install

# Start development server
npm run dev
```

### Without Nix

Requirements:
- Node.js 20+
- npm

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Usage

### Creating a Deck

1. Click "New Deck" on the home screen
2. Enter a name and optional description
3. Click "Create"

### Adding Cards

1. Click "Edit" on a deck
2. Click "Add Card"
3. Enter the question (front) and answer (back)
4. Click "Add Card"

### Studying

1. Click "Study Now" on a deck with due cards
2. Read the question and click "Show Answer" (or press Space)
3. Rate how well you knew the answer:
   - **Again (1)**: Didn't remember - card will appear again soon
   - **Hard (2)**: Barely remembered - interval increased slightly
   - **Good (3)**: Remembered well - standard interval increase
   - **Easy (4)**: Very easy - larger interval increase

### Keyboard Shortcuts

- `Space`: Show answer
- `1`: Rate "Again"
- `2`: Rate "Hard"
- `3`: Rate "Good"
- `4`: Rate "Easy"

## Project Structure

```
anki-pwa/
├── src/
│   ├── components/          # React components
│   │   ├── DeckList.tsx    # List of all decks
│   │   ├── DeckEditor.tsx  # Edit deck and cards
│   │   └── CardReview.tsx  # Study interface
│   ├── lib/
│   │   ├── db/             # IndexedDB operations
│   │   │   └── index.ts
│   │   └── anki/           # Anki-specific logic
│   │       ├── sm2.ts      # SM-2 algorithm
│   │       └── parser.ts   # .apkg parser (WIP)
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── flake.nix              # Nix development environment
├── vite.config.ts         # Vite configuration
└── package.json
```

## How It Works

### Spaced Repetition (SM-2 Algorithm)

The app uses the SuperMemo 2 (SM-2) algorithm, the same one used by Anki:

1. **New cards** start with an ease factor of 2.5
2. **Rating affects scheduling**:
   - Again: Reset progress, review in 1 minute
   - Hard: Reduce ease factor slightly, shorter interval
   - Good: Standard interval increase based on ease factor
   - Easy: Increase ease factor, longer interval
3. **Intervals grow exponentially** as you successfully recall cards
4. **Forgotten cards** (rated "Again") reset but maintain some progress

### Data Storage

All data is stored locally in IndexedDB:

- **Decks**: Metadata and settings for each deck
- **Cards**: Flashcard content and SM-2 parameters
- **Reviews**: History of all reviews for statistics
- **Sessions**: Study session data
- **Settings**: App preferences

No server required - everything runs in your browser!

## Future Enhancements

### High Priority
- [ ] Complete .apkg import/export functionality
- [ ] Image and audio support in cards
- [ ] Statistics dashboard with graphs
- [ ] Daily study streaks and goals
- [ ] Search and filter cards

### Medium Priority
- [ ] Cloze deletion card type
- [ ] Tags for cards and decks
- [ ] Multiple card templates
- [ ] Deck sharing (export/import JSON)
- [ ] Light theme option

### Low Priority
- [ ] Cloud sync (optional)
- [ ] Browser extension integration
- [ ] Advanced statistics
- [ ] Custom study modes
- [ ] Import from other formats (CSV, JSON)

## Development Notes

### IndexedDB Schema

```typescript
// Version 1
decks: 'id, name, created, modified'
cards: 'id, deckId, dueDate, state, created, modified'
sessions: 'id, deckId, startTime, endTime'
reviews: '++id, cardId, timestamp'
settings: 'id'
```

### SM-2 Card States

- **new**: Card never studied
- **learning**: Card failed recently, in short-interval relearning
- **review**: Card graduated, using standard SM-2 intervals
- **relearning**: Previously learned card was forgotten

### Adding Media Support

When implementing media support:

1. Store media files as blobs in IndexedDB
2. Use object URLs for display: `URL.createObjectURL(blob)`
3. Update Card type to include `frontMedia` and `backMedia` arrays
4. Add media picker UI in DeckEditor
5. Handle media in .apkg import/export

### Implementing .apkg Import

To fully implement .apkg import:

1. Install `sql.js` for SQLite parsing
2. Extract collection.anki2 from ZIP
3. Query tables: `notes`, `cards`, `col`
4. Parse field separators (Anki uses `\x1f`)
5. Extract media files and store in IndexedDB
6. Map Anki note types to our card format

## Contributing

Contributions welcome! Some areas that need work:

- Complete .apkg import/export
- Add tests (Vitest + Testing Library)
- Improve mobile UX
- Add more statistics
- Performance optimizations

## License

MIT

## Acknowledgments

- Anki - for the excellent SRS algorithm
- SuperMemo - for pioneering spaced repetition
- Dexie.js - for making IndexedDB pleasant to use
