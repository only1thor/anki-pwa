import type { Card, ReviewRating } from '../../types';

/**
 * SM-2 Algorithm Implementation
 * Based on the SuperMemo 2 algorithm used by Anki
 * 
 * Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: number;
  state: Card['state'];
  lapses: number;
}

/**
 * Calculate the next review parameters based on the SM-2 algorithm
 * 
 * @param card - The card being reviewed
 * @param rating - User's rating of how well they knew the card
 * @returns Updated card parameters
 */
export function calculateSM2(card: Card, rating: ReviewRating): SM2Result {
  let { easeFactor, interval, repetitions, state, lapses } = card;
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Handle different ratings
  switch (rating) {
    case 'again':
      // Card failed - reset progress
      repetitions = 0;
      interval = 0;
      lapses += 1;
      
      // Move to learning/relearning state
      if (state === 'new') {
        state = 'learning';
      } else if (state === 'review') {
        state = 'relearning';
      }
      
      // Reduce ease factor (but not below 1.3)
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      
      // Due in 1 minute for relearning
      return {
        easeFactor,
        interval: 0,
        repetitions,
        dueDate: now + (1 * 60 * 1000), // 1 minute
        state,
        lapses
      };

    case 'hard':
      // Barely remembered
      if (state === 'new' || state === 'learning' || state === 'relearning') {
        // Still in learning phase
        repetitions = 0;
        interval = 0;
        state = state === 'new' ? 'learning' : state;
        
        // Due in 6 minutes
        return {
          easeFactor: Math.max(1.3, easeFactor - 0.15),
          interval,
          repetitions,
          dueDate: now + (6 * 60 * 1000), // 6 minutes
          state,
          lapses
        };
      } else {
        // In review phase - make interval harder
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        interval = Math.max(1, Math.floor(interval * 1.2));
        repetitions += 1;
        
        return {
          easeFactor,
          interval,
          repetitions,
          dueDate: now + (interval * DAY_MS),
          state: 'review',
          lapses
        };
      }

    case 'good':
      // Standard successful recall
      if (state === 'new' || state === 'learning' || state === 'relearning') {
        // Graduate from learning
        repetitions = 1;
        interval = 1; // 1 day
        state = 'review';
        
        return {
          easeFactor,
          interval,
          repetitions,
          dueDate: now + (1 * DAY_MS),
          state,
          lapses
        };
      } else {
        // Standard SM-2 calculation
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        
        repetitions += 1;
        
        return {
          easeFactor,
          interval,
          repetitions,
          dueDate: now + (interval * DAY_MS),
          state: 'review',
          lapses
        };
      }

    case 'easy':
      // Very easy recall - boost interval
      if (state === 'new' || state === 'learning' || state === 'relearning') {
        // Graduate and give bonus interval
        repetitions = 1;
        interval = 4; // 4 days instead of 1
        state = 'review';
        easeFactor = Math.min(2.5, easeFactor + 0.15);
        
        return {
          easeFactor,
          interval,
          repetitions,
          dueDate: now + (4 * DAY_MS),
          state,
          lapses
        };
      } else {
        // Boost ease factor and interval
        easeFactor = Math.min(2.5, easeFactor + 0.15);
        
        if (repetitions === 0) {
          interval = 4;
        } else if (repetitions === 1) {
          interval = 10;
        } else {
          interval = Math.round(interval * easeFactor * 1.3);
        }
        
        repetitions += 1;
        
        return {
          easeFactor,
          interval,
          repetitions,
          dueDate: now + (interval * DAY_MS),
          state: 'review',
          lapses
        };
      }
  }
}

/**
 * Get the suggested intervals for each rating option
 * Useful for showing the user what will happen with each choice
 */
export function getIntervalPreview(card: Card): Record<ReviewRating, string> {
  const results = {
    again: calculateSM2(card, 'again'),
    hard: calculateSM2(card, 'hard'),
    good: calculateSM2(card, 'good'),
    easy: calculateSM2(card, 'easy')
  };

  const formatInterval = (interval: number): string => {
    if (interval === 0) return '<1m';
    if (interval < 1) return `${Math.round(interval * 24 * 60)}m`;
    if (interval === 1) return '1d';
    if (interval < 30) return `${interval}d`;
    if (interval < 365) return `${Math.round(interval / 30)}mo`;
    return `${Math.round(interval / 365)}y`;
  };

  return {
    again: formatInterval(results.again.interval),
    hard: formatInterval(results.hard.interval),
    good: formatInterval(results.good.interval),
    easy: formatInterval(results.easy.interval)
  };
}

/**
 * Check if a card is due for review
 */
export function isCardDue(card: Card): boolean {
  return card.dueDate <= Date.now();
}

/**
 * Get cards that need review, prioritized by:
 * 1. Overdue cards (oldest first)
 * 2. Cards due today
 * 3. New cards (if within daily limit)
 */
export function prioritizeCards(cards: Card[], newCardLimit: number = 20): Card[] {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  
  // Separate cards into categories
  const overdue = cards.filter(c => c.dueDate < now && c.state !== 'new');
  const dueToday = cards.filter(c => c.dueDate <= now && c.dueDate >= now - DAY_MS && c.state !== 'new');
  const newCards = cards.filter(c => c.state === 'new').slice(0, newCardLimit);
  
  // Sort overdue by how overdue they are (oldest first)
  overdue.sort((a, b) => a.dueDate - b.dueDate);
  
  // Combine in priority order
  return [...overdue, ...dueToday, ...newCards];
}
