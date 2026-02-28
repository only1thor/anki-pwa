// Card types
export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  // Media support for future
  frontMedia?: MediaReference[];
  backMedia?: MediaReference[];
  // SM-2 algorithm fields
  easeFactor: number; // Default 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful repetitions
  dueDate: number; // Timestamp when card is due
  lastReviewed?: number; // Timestamp of last review
  // Card state
  state: 'new' | 'learning' | 'review' | 'relearning';
  lapses: number; // Number of times card was forgotten
  // Metadata
  created: number;
  modified: number;
}

export interface MediaReference {
  type: 'image' | 'audio';
  url: string;
  filename: string;
}

// Deck types
export interface Deck {
  id: string;
  name: string;
  description?: string;
  // Settings
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  // Statistics
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  // Metadata
  created: number;
  modified: number;
}

// Review result
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewResult {
  cardId: string;
  rating: ReviewRating;
  timestamp: number;
  timeTaken: number; // Milliseconds
}

// Study session
export interface StudySession {
  id: string;
  deckId: string;
  startTime: number;
  endTime?: number;
  cardsReviewed: number;
  ratings: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

// Statistics
export interface DeckStatistics {
  deckId: string;
  totalReviews: number;
  averageEaseFactor: number;
  retentionRate: number; // Percentage of cards answered correctly
  reviewsToday: number;
  newCardsToday: number;
  timeSpentToday: number; // Milliseconds
  streak: number; // Days studied consecutively
}

// App settings
export interface AppSettings {
  id: string;
  theme: 'dark' | 'light';
  dailyGoal: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}
