import Dexie, { Table } from 'dexie';
import type { Card, Deck, StudySession, AppSettings, ReviewResult } from '../../types';

export class AnkiDatabase extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;
  sessions!: Table<StudySession, string>;
  reviews!: Table<ReviewResult, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('AnkiPWA');

    this.version(1).stores({
      decks: 'id, name, created, modified',
      cards: 'id, deckId, dueDate, state, created, modified',
      sessions: 'id, deckId, startTime, endTime',
      reviews: '++id, cardId, timestamp',
      settings: 'id'
    });
  }
}

// Create singleton instance
export const db = new AnkiDatabase();

// Initialize default settings
export async function initializeDatabase() {
  const settingsCount = await db.settings.count();
  
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      theme: 'dark',
      dailyGoal: 20,
      notificationsEnabled: false,
      soundEnabled: false
    });
  }
}

// Deck operations
export async function createDeck(name: string, description?: string): Promise<Deck> {
  const deck: Deck = {
    id: crypto.randomUUID(),
    name,
    description,
    newCardsPerDay: 20,
    maxReviewsPerDay: 100,
    totalCards: 0,
    newCards: 0,
    learningCards: 0,
    reviewCards: 0,
    created: Date.now(),
    modified: Date.now()
  };

  await db.decks.add(deck);
  return deck;
}

export async function updateDeck(id: string, updates: Partial<Deck>): Promise<void> {
  await db.decks.update(id, { ...updates, modified: Date.now() });
}

export async function deleteDeck(id: string): Promise<void> {
  // Delete all cards in the deck first
  await db.cards.where('deckId').equals(id).delete();
  await db.decks.delete(id);
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  return await db.decks.get(id);
}

export async function getAllDecks(): Promise<Deck[]> {
  return await db.decks.toArray();
}

// Card operations
export async function createCard(
  deckId: string,
  front: string,
  back: string
): Promise<Card> {
  const card: Card = {
    id: crypto.randomUUID(),
    deckId,
    front,
    back,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: Date.now(), // Due immediately for new cards
    state: 'new',
    lapses: 0,
    created: Date.now(),
    modified: Date.now()
  };

  await db.cards.add(card);
  
  // Update deck statistics
  await updateDeckStats(deckId);
  
  return card;
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<void> {
  await db.cards.update(id, { ...updates, modified: Date.now() });
  
  // Update deck stats if card belongs to a deck
  const card = await db.cards.get(id);
  if (card) {
    await updateDeckStats(card.deckId);
  }
}

export async function deleteCard(id: string): Promise<void> {
  const card = await db.cards.get(id);
  await db.cards.delete(id);
  
  if (card) {
    await updateDeckStats(card.deckId);
  }
}

export async function getCard(id: string): Promise<Card | undefined> {
  return await db.cards.get(id);
}

export async function getCardsForDeck(deckId: string): Promise<Card[]> {
  return await db.cards.where('deckId').equals(deckId).toArray();
}

export async function getDueCards(deckId: string, limit?: number): Promise<Card[]> {
  const now = Date.now();
  let query = db.cards
    .where('deckId')
    .equals(deckId)
    .and(card => card.dueDate <= now)
    .sortBy('dueDate');

  const cards = await query;
  return limit ? cards.slice(0, limit) : cards;
}

export async function getNewCards(deckId: string, limit?: number): Promise<Card[]> {
  let query = db.cards
    .where('deckId')
    .equals(deckId)
    .and(card => card.state === 'new')
    .sortBy('created');

  const cards = await query;
  return limit ? cards.slice(0, limit) : cards;
}

// Helper function to update deck statistics
async function updateDeckStats(deckId: string): Promise<void> {
  const cards = await getCardsForDeck(deckId);
  
  const stats = {
    totalCards: cards.length,
    newCards: cards.filter(c => c.state === 'new').length,
    learningCards: cards.filter(c => c.state === 'learning' || c.state === 'relearning').length,
    reviewCards: cards.filter(c => c.state === 'review').length,
    modified: Date.now()
  };

  await db.decks.update(deckId, stats);
}

// Study session operations
export async function createStudySession(deckId: string): Promise<StudySession> {
  const session: StudySession = {
    id: crypto.randomUUID(),
    deckId,
    startTime: Date.now(),
    cardsReviewed: 0,
    ratings: {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0
    }
  };

  await db.sessions.add(session);
  return session;
}

export async function updateStudySession(
  id: string,
  updates: Partial<StudySession>
): Promise<void> {
  await db.sessions.update(id, updates);
}

export async function endStudySession(id: string): Promise<void> {
  await db.sessions.update(id, { endTime: Date.now() });
}

// Review operations
export async function recordReview(review: ReviewResult): Promise<void> {
  await db.reviews.add(review);
}

// Settings operations
export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('default');
  if (!settings) {
    throw new Error('Settings not initialized');
  }
  return settings;
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  await db.settings.update('default', updates);
}

// Bulk import (for .apkg import)
export async function bulkImportCards(deckId: string, cards: Omit<Card, 'id' | 'deckId' | 'created' | 'modified'>[]): Promise<void> {
  const cardsToAdd: Card[] = cards.map(card => ({
    ...card,
    id: crypto.randomUUID(),
    deckId,
    created: Date.now(),
    modified: Date.now()
  }));

  await db.cards.bulkAdd(cardsToAdd);
  await updateDeckStats(deckId);
}
