# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Complete .apkg import functionality
- Statistics dashboard with graphs
- Image and audio support in cards
- Cloze deletion card type
- Search and filter functionality
- Export to .apkg format

## [0.1.0] - 2026-03-01

### Initial Release

#### Added
- **Core Features**
  - Multiple deck support
  - Card creation and editing
  - Study interface with spaced repetition
  - SM-2 algorithm implementation
  - Keyboard shortcuts (Space, 1-4)
  
- **Data Management**
  - IndexedDB integration with Dexie.js
  - Reactive queries with useLiveQuery
  - Deck CRUD operations
  - Card CRUD operations
  - Review history tracking
  - Study session tracking

- **User Interface**
  - DeckList component for browsing decks
  - DeckEditor component for managing cards
  - CardReview component for studying
  - Dark theme with CSS variables
  - Mobile-first responsive design
  - Loading states and animations

- **Progressive Web App**
  - Service worker for offline support
  - PWA manifest for installability
  - Asset caching with Workbox
  - Mobile and desktop icon support

- **Spaced Repetition**
  - Full SM-2 algorithm implementation
  - Four rating levels (again, hard, good, easy)
  - Card states (new, learning, review, relearning)
  - Interval calculation and scheduling
  - Card prioritization logic
  - Ease factor adjustments

- **Development Environment**
  - Nix flake for reproducible dev environment
  - Vite for fast development and building
  - TypeScript for type safety
  - React 18 with hooks
  - Comprehensive documentation

- **Documentation**
  - README with user guide
  - QUICKSTART for 5-minute setup
  - DEVELOPMENT guide for developers
  - CHECKLIST for tracking progress
  - PROJECT_STRUCTURE for architecture
  - SUMMARY with overview
  - Inline code comments

#### Technical Details
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.8
- Dexie 3.2.4
- Total source code: ~2,500 lines
- Total documentation: ~1,100 lines

#### Known Limitations
- .apkg import/export is stub implementation only
- No statistics dashboard yet
- No image or audio support in cards
- No cloud synchronization
- No light theme option
- No search or filter functionality

## Version Guidelines

### Major version (X.0.0)
- Breaking changes to data structure
- Major feature overhauls
- API breaking changes

### Minor version (0.X.0)
- New features
- Non-breaking enhancements
- New components

### Patch version (0.0.X)
- Bug fixes
- Documentation updates
- Minor improvements

## Future Versions (Planned)

### [0.2.0] - Statistics & Analytics
- [ ] Review calendar/heatmap
- [ ] Success rate graphs
- [ ] Study streak tracking
- [ ] Time spent per deck
- [ ] Cards due forecast

### [0.3.0] - Media Support
- [ ] Image upload and display
- [ ] Audio recording and playback
- [ ] Media storage in IndexedDB
- [ ] Media compression

### [0.4.0] - Import/Export
- [ ] Complete .apkg import
- [ ] .apkg export functionality
- [ ] CSV import/export
- [ ] JSON backup/restore

### [0.5.0] - Enhanced Features
- [ ] Cloze deletion cards
- [ ] Tags and filtering
- [ ] Search functionality
- [ ] Custom study modes

### [1.0.0] - Production Ready
- [ ] Comprehensive testing
- [ ] Performance optimizations
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Light theme
- [ ] User onboarding

### [2.0.0] - Cloud & Collaboration
- [ ] Optional cloud sync
- [ ] Multi-device support
- [ ] Shared decks
- [ ] Collaborative editing

---

For the full list of planned features, see [CHECKLIST.md](CHECKLIST.md).
