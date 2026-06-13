import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review } from '../types';
import { MOCK_REVIEWS } from '../data/mock';
import { generateId } from '../utils/format';

interface RatingSummary {
  count: number;
  average: number;
}

interface ReviewsContextType {
  /** Reviews for a seller, newest first (user-written + seeded). */
  getReviews: (userId: string) => Review[];
  /** Blended rating + total count: the seller's historical baseline plus new reviews. */
  getSummary: (user: { id: string; rating: number; reviewCount: number }) => RatingSummary;
  addReview: (input: { userId: string; reviewerName: string; rating: number; comment: string }) => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);
const STORAGE_KEY = 'shitje.reviews';

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [added, setAdded] = useState<Review[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(v => {
        if (v) setAdded(JSON.parse(v));
      })
      .catch(() => {});
  }, []);

  const getReviews = useCallback(
    (userId: string) => {
      const mine = added.filter(r => r.userId === userId);
      const seeded = MOCK_REVIEWS.filter(r => r.userId === userId);
      return [...mine, ...seeded].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    [added]
  );

  const getSummary = useCallback(
    (user: { id: string; rating: number; reviewCount: number }): RatingSummary => {
      const mine = added.filter(r => r.userId === user.id);
      const count = user.reviewCount + mine.length;
      if (count === 0) return { count: 0, average: 0 };
      // Weighted blend of the historical rating with the freshly added ones.
      const sum = user.rating * user.reviewCount + mine.reduce((s, r) => s + r.rating, 0);
      return { count, average: Math.round((sum / count) * 10) / 10 };
    },
    [added]
  );

  const addReview = useCallback(
    (input: { userId: string; reviewerName: string; rating: number; comment: string }) => {
      const review: Review = {
        id: 'rev_' + generateId(),
        userId: input.userId,
        reviewerName: input.reviewerName,
        rating: input.rating,
        comment: input.comment.trim(),
        date: new Date().toISOString(),
      };
      setAdded(prev => {
        const next = [review, ...prev];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  return (
    <ReviewsContext.Provider value={{ getReviews, getSummary, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews(): ReviewsContextType {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
