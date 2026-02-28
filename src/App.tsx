import { useState, useEffect } from 'react';
import { initializeDatabase } from './lib/db';
import { DeckList } from './components/DeckList';
import { DeckEditor } from './components/DeckEditor';
import { CardReview } from './components/CardReview';

type View = 
  | { type: 'list' }
  | { type: 'editor'; deckId: string }
  | { type: 'review'; deckId: string };

function App() {
  const [initialized, setInitialized] = useState(false);
  const [view, setView] = useState<View>({ type: 'list' });

  useEffect(() => {
    initializeDatabase().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '100vh' }}>
        <div className="flex-col items-center gap-md">
          <div className="spinner"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 'var(--spacing-xl)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: 'var(--spacing-md) 0',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <div className="container">
          <div className="flex items-center justify-between">
            <h2 
              style={{ 
                margin: 0, 
                cursor: view.type !== 'list' ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)'
              }}
              onClick={() => view.type !== 'list' && setView({ type: 'list' })}
            >
              🎴 Anki PWA
            </h2>
            {view.type === 'list' && (
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-sm"
              >
                About
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {view.type === 'list' && (
          <DeckList
            onSelectDeck={(deckId) => setView({ type: 'review', deckId })}
            onEditDeck={(deckId) => setView({ type: 'editor', deckId })}
          />
        )}
        {view.type === 'editor' && (
          <DeckEditor
            deckId={view.deckId}
            onBack={() => setView({ type: 'list' })}
          />
        )}
        {view.type === 'review' && (
          <CardReview
            deckId={view.deckId}
            onExit={() => setView({ type: 'list' })}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: 'var(--spacing-xl) 0',
        marginTop: 'var(--spacing-xl)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <p className="text-secondary text-sm">
          Made with ❤️ using React, Vite & IndexedDB
        </p>
      </footer>
    </div>
  );
}

export default App;
