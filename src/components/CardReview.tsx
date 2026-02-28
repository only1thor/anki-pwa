import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getDeck, updateCard, recordReview, getDueCards, getNewCards } from '../lib/db';
import { calculateSM2, getIntervalPreview, prioritizeCards } from '../lib/anki/sm2';
import type { Card, ReviewRating } from '../types';

interface CardReviewProps {
  deckId: string;
  onExit: () => void;
}

export function CardReview({ deckId, onExit }: CardReviewProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [sessionStart] = useState(Date.now());

  const deck = useLiveQuery(() => getDeck(deckId), [deckId]);

  // Get all cards that need review
  const cards = useLiveQuery(async () => {
    if (!deck) return [];
    
    const dueCards = await getDueCards(deckId);
    const newCards = await getNewCards(deckId, deck.newCardsPerDay);
    
    // Combine and prioritize
    const allCards = [...dueCards, ...newCards];
    return prioritizeCards(allCards, deck.newCardsPerDay);
  }, [deck, deckId]);

  const currentCard = cards?.[currentCardIndex];
  const remainingCards = (cards?.length ?? 0) - currentCardIndex;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentCard) return;

      // Space to show answer
      if (e.code === 'Space' && !showAnswer) {
        e.preventDefault();
        setShowAnswer(true);
        return;
      }

      // Number keys for rating (only when answer is shown)
      if (showAnswer) {
        const ratingMap: Record<string, ReviewRating> = {
          '1': 'again',
          '2': 'hard',
          '3': 'good',
          '4': 'easy'
        };

        if (e.key in ratingMap) {
          e.preventDefault();
          handleRating(ratingMap[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCard, showAnswer]);

  const handleRating = useCallback(async (rating: ReviewRating) => {
    if (!currentCard) return;

    const reviewStart = sessionStart;
    const timeTaken = Date.now() - reviewStart;

    // Calculate new card parameters using SM-2
    const sm2Result = calculateSM2(currentCard, rating);

    // Update card in database
    await updateCard(currentCard.id, {
      ...sm2Result,
      lastReviewed: Date.now()
    });

    // Record the review
    await recordReview({
      cardId: currentCard.id,
      rating,
      timestamp: Date.now(),
      timeTaken
    });

    // Move to next card
    setReviewCount(prev => prev + 1);
    setShowAnswer(false);
    setCurrentCardIndex(prev => prev + 1);
  }, [currentCard, sessionStart]);

  if (!deck || !cards) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Session complete
  if (!currentCard || currentCardIndex >= cards.length) {
    return (
      <div className="container">
        <div className="card text-center fade-in">
          <h2>🎉 Session Complete!</h2>
          <p className="text-lg" style={{ marginTop: 'var(--spacing-lg)' }}>
            You reviewed <strong>{reviewCount}</strong> card{reviewCount !== 1 ? 's' : ''}
          </p>
          <p className="text-secondary">Great work! Come back tomorrow for more reviews.</p>
          <button 
            className="btn-primary mt-lg"
            onClick={onExit}
          >
            Back to Decks
          </button>
        </div>
      </div>
    );
  }

  const intervalPreview = getIntervalPreview(currentCard);

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <button className="btn-ghost" onClick={onExit}>
          ← Back
        </button>
        <div className="text-secondary text-sm">
          {remainingCards} remaining
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '2px',
        marginBottom: 'var(--spacing-xl)',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
          height: '100%',
          backgroundColor: 'var(--accent-primary)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Card */}
      <div className="card fade-in" style={{ 
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--spacing-xl)'
      }}>
        {/* Front */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="text-secondary text-sm mb-sm">Question</div>
          <div 
            className="text-xl"
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: currentCard.front }}
          />
        </div>

        {/* Back (shown after reveal) */}
        {showAnswer && (
          <div className="fade-in" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div 
              style={{
                borderTop: '2px solid var(--border-color)',
                paddingTop: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-lg)'
              }}
            >
              <div className="text-secondary text-sm mb-sm">Answer</div>
              <div 
                className="text-xl"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: currentCard.back }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-lg">
        {!showAnswer ? (
          <button 
            className="btn-primary"
            onClick={() => setShowAnswer(true)}
            style={{ width: '100%', padding: 'var(--spacing-lg)' }}
          >
            Show Answer (Space)
          </button>
        ) : (
          <div className="flex-col gap-sm">
            <div className="flex gap-sm">
              <RatingButton
                rating="again"
                label="Again"
                interval={intervalPreview.again}
                onClick={() => handleRating('again')}
                color="var(--btn-again)"
                hotkey="1"
              />
              <RatingButton
                rating="hard"
                label="Hard"
                interval={intervalPreview.hard}
                onClick={() => handleRating('hard')}
                color="var(--btn-hard)"
                hotkey="2"
              />
            </div>
            <div className="flex gap-sm">
              <RatingButton
                rating="good"
                label="Good"
                interval={intervalPreview.good}
                onClick={() => handleRating('good')}
                color="var(--btn-good)"
                hotkey="3"
              />
              <RatingButton
                rating="easy"
                label="Easy"
                interval={intervalPreview.easy}
                onClick={() => handleRating('easy')}
                color="var(--btn-easy)"
                hotkey="4"
              />
            </div>
          </div>
        )}
      </div>

      {/* Help text */}
      {showAnswer && (
        <div className="text-center text-secondary text-sm mt-md">
          Use number keys 1-4 or click to rate
        </div>
      )}
    </div>
  );
}

interface RatingButtonProps {
  rating: ReviewRating;
  label: string;
  interval: string;
  onClick: () => void;
  color: string;
  hotkey: string;
}

function RatingButton({ label, interval, onClick, color, hotkey }: RatingButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        backgroundColor: color,
        color: 'white',
        padding: 'var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)'
      }}
    >
      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
        {label} <span style={{ opacity: 0.7 }}>({hotkey})</span>
      </div>
      <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
        {interval}
      </div>
    </button>
  );
}
