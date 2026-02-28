import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, createDeck, deleteDeck, getDueCards } from '../lib/db';
import type { Deck } from '../types';

interface DeckListProps {
  onSelectDeck: (deckId: string) => void;
  onEditDeck: (deckId: string) => void;
}

export function DeckList({ onSelectDeck, onEditDeck }: DeckListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  // Live query - automatically updates when data changes
  const decks = useLiveQuery(() => db.decks.toArray(), []);

  // Get due card counts for each deck
  const deckStats = useLiveQuery(async () => {
    if (!decks) return {};
    
    const stats: Record<string, { due: number; new: number }> = {};
    
    for (const deck of decks) {
      const dueCards = await getDueCards(deck.id);
      const newCards = dueCards.filter(c => c.state === 'new');
      stats[deck.id] = {
        due: dueCards.length,
        new: newCards.length
      };
    }
    
    return stats;
  }, [decks]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    await createDeck(newDeckName, newDeckDescription || undefined);
    setNewDeckName('');
    setNewDeckDescription('');
    setIsCreating(false);
  };

  const handleDeleteDeck = async (deckId: string, deckName: string) => {
    if (confirm(`Are you sure you want to delete "${deckName}" and all its cards?`)) {
      await deleteDeck(deckId);
    }
  };

  if (!decks) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-xl">
        <h1>My Decks</h1>
        <button 
          className="btn-primary"
          onClick={() => setIsCreating(true)}
        >
          + New Deck
        </button>
      </div>

      {isCreating && (
        <div className="card mb-lg fade-in">
          <form onSubmit={handleCreateDeck}>
            <h3>Create New Deck</h3>
            <div className="flex-col gap-md">
              <div>
                <label htmlFor="deck-name" className="text-secondary text-sm">Deck Name</label>
                <input
                  id="deck-name"
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="e.g., Spanish Vocabulary"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="deck-description" className="text-secondary text-sm">Description (optional)</label>
                <textarea
                  id="deck-description"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="What is this deck about?"
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div className="flex gap-md">
                <button type="submit" className="btn-primary">Create</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setIsCreating(false);
                    setNewDeckName('');
                    setNewDeckDescription('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="card text-center fade-in">
          <h3>No decks yet</h3>
          <p className="text-secondary">Create your first deck to get started!</p>
        </div>
      ) : (
        <div className="flex-col gap-md">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              stats={deckStats?.[deck.id]}
              onStudy={() => onSelectDeck(deck.id)}
              onEdit={() => onEditDeck(deck.id)}
              onDelete={() => handleDeleteDeck(deck.id, deck.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DeckCardProps {
  deck: Deck;
  stats?: { due: number; new: number };
  onStudy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DeckCard({ deck, stats, onStudy, onEdit, onDelete }: DeckCardProps) {
  return (
    <div className="card fade-in">
      <div className="flex justify-between items-center">
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{deck.name}</h3>
          {deck.description && (
            <p className="text-secondary text-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
              {deck.description}
            </p>
          )}
          <div className="flex gap-md text-sm">
            <span className="text-secondary">
              Total: <strong className="text-primary">{deck.totalCards}</strong>
            </span>
            {stats && stats.due > 0 && (
              <span style={{ color: 'var(--accent-primary)' }}>
                Due: <strong>{stats.due}</strong>
              </span>
            )}
            {stats && stats.new > 0 && (
              <span style={{ color: 'var(--success)' }}>
                New: <strong>{stats.new}</strong>
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-sm">
          {stats && stats.due > 0 && (
            <button 
              className="btn-primary"
              onClick={onStudy}
            >
              Study Now
            </button>
          )}
          <button 
            className="btn-secondary"
            onClick={onEdit}
          >
            Edit
          </button>
          <button 
            className="btn-ghost"
            onClick={onDelete}
            title="Delete deck"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
