# Quick Start Guide

Get your Anki PWA up and running in 5 minutes!

## Prerequisites

- **Nix** with flakes enabled (recommended), OR
- **Node.js 20+** and npm

## Setup (3 steps)

### 1. Enter Development Environment

With Nix:
```bash
nix develop
```

Without Nix:
```bash
# Make sure you have Node.js 20+ installed
node --version  # Should be v20.x or higher
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React & React DOM
- Vite (build tool)
- Dexie (IndexedDB wrapper)
- TypeScript
- PWA plugins
- And more...

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

## First Time Usage

### Create Your First Deck

1. Click **"+ New Deck"**
2. Enter a name (e.g., "Spanish Vocabulary")
3. Add a description (optional)
4. Click **"Create"**

### Add Some Cards

1. Click **"Edit"** on your new deck
2. Click **"+ Add Card"**
3. Enter the question in **Front** (e.g., "Hello")
4. Enter the answer in **Back** (e.g., "Hola")
5. Click **"Add Card"**
6. Repeat to add more cards

### Start Studying

1. Go back to the deck list (click "← Back")
2. Click **"Study Now"** on your deck
3. Read the question
4. Click **"Show Answer"** (or press Space)
5. Rate yourself:
   - Press **1** or click **"Again"** - didn't remember
   - Press **2** or click **"Hard"** - barely remembered
   - Press **3** or click **"Good"** - remembered well
   - Press **4** or click **"Easy"** - very easy

That's it! The app will automatically schedule your cards using spaced repetition.

## Keyboard Shortcuts

- **Space** - Show answer
- **1** - Rate "Again"
- **2** - Rate "Hard"
- **3** - Rate "Good"
- **4** - Rate "Easy"

## Install as PWA

### On Desktop (Chrome/Edge)

1. Click the install icon in the address bar
2. Click "Install"
3. The app will open in its own window

### On Mobile (iOS Safari)

1. Tap the Share button
2. Tap "Add to Home Screen"
3. Tap "Add"

### On Mobile (Android Chrome)

1. Tap the three dots menu
2. Tap "Add to Home Screen"
3. Tap "Add"

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

Preview the production build:

```bash
npm run preview
```

## Troubleshooting

### "Module not found" error

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 already in use

```bash
npm run dev -- --port 3000
```

### Clear all data and start fresh

Open browser console and run:

```javascript
indexedDB.deleteDatabase('AnkiPWA');
localStorage.clear();
location.reload();
```

## What's Next?

- Read [README.md](README.md) for full feature list
- Read [DEVELOPMENT.md](DEVELOPMENT.md) for developer guide
- Check [CHECKLIST.md](CHECKLIST.md) for what's implemented
- See [scripts/generate-icons.md](scripts/generate-icons.md) for PWA icons

## Tips for Effective Learning

1. **Review daily** - Consistency is key for spaced repetition
2. **Start small** - 20 new cards per day is a good pace
3. **Be honest** - Rate cards accurately for best results
4. **Keep cards simple** - One concept per card
5. **Use context** - Add examples or mnemonics in answers

## Need Help?

- Check the README for detailed documentation
- See DEVELOPMENT.md for technical details
- Review the code - it's well-commented!

Happy learning! 🎴
