import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDeck, updateDeck, getCardsForDeck, createCard, deleteCard, updateCard } from '../lib/db';
import type { Card } from '../types';

interface DeckEditorProps {
  deckId: string;
  onBack: () => void;
}

export function DeckEditor({ deckId, onBack }: DeckEditorProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [editDeckName, setEditDeckName] = useState('');
  const [editDeckDesc, setEditDeckDesc] = useState('');
  const [isEditingDeck, setIsEditingDeck] = useState(false);

  const deck = useLiveQuery(() => getDeck(deckId), [deckId]);
  const cards = useLiveQuery(() => getCardsForDeck(deckId), [deckId]);

  // Initialize edit form when deck loads
  useState(() => {
    if (deck && !editDeckName) {
      setEditDeckName(deck.name);
      setEditDeckDesc(deck.description || '');
    }
  });

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardFront.trim() || !newCardBack.trim()) return;

    await createCard(deckId, newCardFront, newCardBack);
    setNewCardFront('');
    setNewCardBack('');
    setIsAddingCard(false);
  };

  const handleUpdateCard = async (cardId: string, front: string, back: string) => {
    await updateCard(cardId, { front, back });
    setEditingCardId(null);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      await deleteCard(cardId);
    }
  };

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeckName.trim()) return;

    await updateDeck(deckId, {
      name: editDeckName,
      description: editDeckDesc || undefined
    });
    setIsEditingDeck(false);
  };

  if (!deck || !cards) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <button className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button 
          className="btn-secondary"
          onClick={() => setIsEditingDeck(!isEditingDeck)}
        >
          {isEditingDeck ? 'Cancel' : 'Edit Deck'}
        </button>
      </div>

      {/* Deck info */}
      {isEditingDeck ? (
        <div className="card mb-lg fade-in">
          <form onSubmit={handleUpdateDeck}>
            <h3>Edit Deck</h3>
            <div className="flex-col gap-md">
              <div>
                <label htmlFor="edit-deck-name" className="text-secondary text-sm">Deck Name</label>
                <input
                  id="edit-deck-name"
                  type="text"
                  value={editDeckName}
                  onChange={(e) => setEditDeckName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-deck-desc" className="text-secondary text-sm">Description</label>
                <textarea
                  id="edit-deck-desc"
                  value={editDeckDesc}
                  onChange={(e) => setEditDeckDesc(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div className="flex gap-md">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsEditingDeck(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-lg">
          <h1>{deck.name}</h1>
          {deck.description && (
            <p className="text-secondary">{deck.description}</p>
          )}
          <div className="flex gap-md text-sm text-secondary mt-sm">
            <span>Total: {deck.totalCards}</span>
            <span>New: {deck.newCards}</span>
            <span>Review: {deck.reviewCards}</span>
          </div>
        </div>
      )}

      {/* Add card button */}
      <div className="mb-lg">
        <button 
          className="btn-primary"
          onClick={() => setIsAddingCard(true)}
        >
          + Add Card
        </button>
      </div>

      {/* Add card form */}
      {isAddingCard && (
        <div className="card mb-lg fade-in">
          <form onSubmit={handleAddCard}>
            <h3>New Card</h3>
            <div className="flex-col gap-md">
              <div>
                <label htmlFor="card-front" className="text-secondary text-sm">Front (Question)</label>
                <textarea
                  id="card-front"
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  placeholder="Enter the question or prompt"
                  autoFocus
                  required
                  style={{ minHeight: '100px' }}
                />
              </div>
              <div>
                <label htmlFor="card-back" className="text-secondary text-sm">Back (Answer)</label>
                <textarea
                  id="card-back"
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  placeholder="Enter the answer"
                  required
                  style={{ minHeight: '100px' }}
                />
              </div>
              <div className="flex gap-md">
                <button type="submit" className="btn-primary">Add Card</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddingCard(false);
                    setNewCardFront('');
                    setNewCardBack('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Cards list */}
      <div>
        <h2 className="mb-md">Cards ({cards.length})</h2>
        {cards.length === 0 ? (
          <div className="card text-center">
            <p className="text-secondary">No cards yet. Add your first card to get started!</p>
          </div>
        ) : (
          <div className="flex-col gap-md">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                isEditing={editingCardId === card.id}
                onEdit={() => setEditingCardId(card.id)}
                onCancelEdit={() => setEditingCardId(null)}
                onSave={(front, back) => handleUpdateCard(card.id, front, back)}
                onDelete={() => handleDeleteCard(card.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CardItemProps {
  card: Card;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (front: string, back: string) => void;
  onDelete: () => void;
}

function CardItem({ card, isEditing, onEdit, onCancelEdit, onSave, onDelete }: CardItemProps) {
  const [editFront, setEditFront] = useState(card.front);
  const [editBack, setEditBack] = useState(card.back);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFront.trim() || !editBack.trim()) return;
    onSave(editFront, editBack);
  };

  if (isEditing) {
    return (
      <div className="card fade-in">
        <form onSubmit={handleSave}>
          <div className="flex-col gap-md">
            <div>
              <label className="text-secondary text-sm">Front</label>
              <textarea
                value={editFront}
                onChange={(e) => setEditFront(e.target.value)}
                required
                style={{ minHeight: '80px' }}
              />
            </div>
            <div>
              <label className="text-secondary text-sm">Back</label>
              <textarea
                value={editBack}
                onChange={(e) => setEditBack(e.target.value)}
                required
                style={{ minHeight: '80px' }}
              />
            </div>
            <div className="flex gap-md">
              <button type="submit" className="btn-primary">Save</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setEditFront(card.front);
                  setEditBack(card.back);
                  onCancelEdit();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div style={{ flex: 1 }}>
          <div className="mb-md">
            <div className="text-secondary text-sm mb-xs">Front</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{card.front}</div>
          </div>
          <div>
            <div className="text-secondary text-sm mb-xs">Back</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{card.back}</div>
          </div>
          <div className="flex gap-md text-sm text-secondary mt-md">
            <span>State: {card.state}</span>
            <span>Interval: {card.interval}d</span>
            <span>Ease: {card.easeFactor.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-sm">
          <button className="btn-secondary" onClick={onEdit}>
            Edit
          </button>
          <button className="btn-ghost" onClick={onDelete} title="Delete card">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
