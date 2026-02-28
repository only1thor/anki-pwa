# Development Guide

## Getting Started

### 1. Enter Development Environment

```bash
nix develop
```

This will set up Node.js 20, npm, and TypeScript automatically.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Architecture

### Data Flow

```
User Action
    ↓
React Component
    ↓
Database Operation (lib/db)
    ↓
IndexedDB (Dexie)
    ↓
useLiveQuery updates component
```

### Component Hierarchy

```
App
├── DeckList
│   └── DeckCard (for each deck)
├── DeckEditor
│   └── CardItem (for each card)
└── CardReview
    └── RatingButton (x4)
```

### Key Files

- **src/types/index.ts**: All TypeScript interfaces
- **src/lib/db/index.ts**: Database operations
- **src/lib/anki/sm2.ts**: Spaced repetition algorithm
- **src/lib/anki/parser.ts**: .apkg import/export (WIP)
- **src/components/**: React components
- **src/index.css**: Global styles and theme

## Database Schema

### Decks Table

```typescript
{
  id: string;              // UUID
  name: string;
  description?: string;
  newCardsPerDay: number;  // Default: 20
  maxReviewsPerDay: number; // Default: 100
  totalCards: number;      // Auto-calculated
  newCards: number;        // Auto-calculated
  learningCards: number;   // Auto-calculated
  reviewCards: number;     // Auto-calculated
  created: number;         // Timestamp
  modified: number;        // Timestamp
}
```

### Cards Table

```typescript
{
  id: string;              // UUID
  deckId: string;          // Foreign key
  front: string;           // Question/prompt
  back: string;            // Answer
  
  // SM-2 algorithm fields
  easeFactor: number;      // Default: 2.5
  interval: number;        // Days until next review
  repetitions: number;     // Successful repetitions
  dueDate: number;         // Timestamp when due
  lastReviewed?: number;   // Timestamp of last review
  
  // Card state
  state: 'new' | 'learning' | 'review' | 'relearning';
  lapses: number;          // Times forgotten
  
  // Metadata
  created: number;
  modified: number;
}
```

### Reviews Table

```typescript
{
  id: string;              // Auto-increment
  cardId: string;          // Foreign key
  rating: 'again' | 'hard' | 'good' | 'easy';
  timestamp: number;
  timeTaken: number;       // Milliseconds
}
```

## SM-2 Algorithm Details

### Card States

1. **new**: Never studied
2. **learning**: Failed recently, short intervals (minutes)
3. **review**: Graduated, using day-based intervals
4. **relearning**: Was in review, failed, now relearning

### Rating Effects

| Rating | Ease Factor Change | Interval Change | State Change |
|--------|-------------------|----------------|--------------|
| Again  | -0.2 (min 1.3)    | Reset to 0     | → learning/relearning |
| Hard   | -0.15 (min 1.3)   | × 1.2          | Stays same |
| Good   | No change         | × easeFactor   | learning → review |
| Easy   | +0.15 (max 2.5)   | × easeFactor × 1.3 | learning → review (4d) |

### Interval Progression

For cards rated "Good":
- First review: 1 day
- Second review: 6 days
- Third+ review: previous interval × easeFactor

## Adding New Features

### Adding a New Component

1. Create component file in `src/components/`
2. Import types from `src/types`
3. Use `useLiveQuery` for reactive database queries
4. Add to App.tsx routing if needed

Example:

```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function MyComponent() {
  const data = useLiveQuery(() => db.myTable.toArray(), []);
  
  if (!data) return <div className="spinner"></div>;
  
  return <div>{/* Your UI */}</div>;
}
```

### Adding a Database Operation

1. Add function to `src/lib/db/index.ts`
2. Use TypeScript types for parameters
3. Update related statistics if needed

Example:

```typescript
export async function myOperation(param: string): Promise<MyType> {
  const result = await db.myTable.add({ ... });
  await updateStats(); // If needed
  return result;
}
```

### Adding a New Card Field

1. Update `Card` interface in `src/types/index.ts`
2. Update database schema version in `src/lib/db/index.ts`
3. Add migration logic if needed
4. Update components to display/edit the field

### Modifying the SM-2 Algorithm

All SM-2 logic is in `src/lib/anki/sm2.ts`:

- `calculateSM2()`: Main algorithm implementation
- `getIntervalPreview()`: Shows next intervals for each rating
- `isCardDue()`: Checks if card needs review
- `prioritizeCards()`: Orders cards for study session

## Testing

### Manual Testing Checklist

- [ ] Create deck
- [ ] Add cards to deck
- [ ] Edit card content
- [ ] Delete card
- [ ] Study cards
- [ ] Test each rating (again, hard, good, easy)
- [ ] Verify intervals update correctly
- [ ] Test keyboard shortcuts
- [ ] Test mobile responsiveness
- [ ] Test offline mode
- [ ] Test PWA install

### Adding Automated Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Create test file: `src/lib/anki/sm2.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { calculateSM2 } from './sm2';

describe('SM-2 Algorithm', () => {
  it('should reset interval for "again" rating', () => {
    // Test implementation
  });
});
```

## Styling

### CSS Variables

All theme colors are in `src/index.css`:

```css
:root {
  --bg-primary: #0f0f0f;
  --text-primary: #e8e8e8;
  --accent-primary: #6366f1;
  /* etc */
}
```

### Utility Classes

Use existing utility classes for consistency:

- Layout: `flex`, `flex-col`, `items-center`, `justify-between`
- Spacing: `gap-md`, `mt-lg`, `mb-sm`
- Text: `text-secondary`, `text-sm`, `text-center`

### Adding New Styles

Prefer inline styles for component-specific styling:

```typescript
<div style={{ 
  backgroundColor: 'var(--bg-secondary)',
  padding: 'var(--spacing-lg)' 
}}>
```

## PWA Features

### Service Worker

The service worker is automatically generated by `vite-plugin-pwa`.

Configuration in `vite.config.ts`:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
  }
})
```

### Manifest

Edit PWA settings in `vite.config.ts` under `manifest`:

```typescript
manifest: {
  name: 'Anki PWA',
  short_name: 'AnkiPWA',
  theme_color: '#1a1a1a',
  icons: [...]
}
```

### Offline Support

All data is stored in IndexedDB, which works offline by default.
The service worker caches all app assets for offline use.

## Common Tasks

### Clearing Development Data

```javascript
// In browser console:
indexedDB.deleteDatabase('AnkiPWA');
localStorage.clear();
location.reload();
```

### Debugging IndexedDB

1. Open Chrome DevTools
2. Go to Application → Storage → IndexedDB
3. Expand AnkiPWA database
4. Inspect tables: decks, cards, reviews, etc.

### Inspecting Service Worker

1. Open Chrome DevTools
2. Go to Application → Service Workers
3. Check status and update service worker
4. Use "Offline" checkbox to test offline mode

## Performance Tips

### Optimizing Large Decks

- Use pagination for card lists
- Add virtual scrolling for 1000+ cards
- Index frequently queried fields in Dexie

### Reducing Bundle Size

```bash
npm run build -- --mode production
npx vite-bundle-visualizer
```

### Lazy Loading

Split large components:

```typescript
const Statistics = lazy(() => import('./components/Statistics'));

<Suspense fallback={<div className="spinner"></div>}>
  <Statistics />
</Suspense>
```

## Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

### Deploy to Netlify/Vercel

1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Done!

### Deploy to GitHub Pages

```bash
npm install -D gh-pages

# Add to package.json:
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

npm run deploy
```

## Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
npm run type-check
```

### Database schema errors

If you change the schema, increment version:

```typescript
// src/lib/db/index.ts
this.version(2).stores({ // Was version(1)
  // Updated schema
});
```

### Service worker not updating

1. Close all tabs with the app
2. Open DevTools → Application → Service Workers
3. Click "Unregister"
4. Reload page

## Next Steps

See README.md "Future Enhancements" section for ideas on what to build next!

Priority features to implement:
1. Complete .apkg import/export
2. Statistics dashboard
3. Image/audio support
4. Cloze deletions
5. Cloud sync (optional)
