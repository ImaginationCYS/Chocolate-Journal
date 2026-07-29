import { ChocolateReview } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'chocolate-journal-reviews';

export function loadReviews(): ChocolateReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChocolateReview[];
  } catch {
    return [];
  }
}

export function saveReviews(reviews: ChocolateReview[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function addReview(reviews: ChocolateReview[], review: Omit<ChocolateReview, 'id' | 'createdAt' | 'updatedAt'>): ChocolateReview[] {
  const now = new Date().toISOString();
  const newReview: ChocolateReview = {
    ...review,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newReview, ...reviews];
  saveReviews(updated);
  return updated;
}

export function updateReview(reviews: ChocolateReview[], id: string, updates: Partial<ChocolateReview>): ChocolateReview[] {
  const updated = reviews.map(r =>
    r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
  );
  saveReviews(updated);
  return updated;
}

export function deleteReview(reviews: ChocolateReview[], id: string): ChocolateReview[] {
  const updated = reviews.filter(r => r.id !== id);
  saveReviews(updated);
  return updated;
}

export function duplicateReview(reviews: ChocolateReview[], id: string): ChocolateReview[] {
  const original = reviews.find(r => r.id === id);
  if (!original) return reviews;
  const now = new Date().toISOString();
  const copy: ChocolateReview = {
    ...original,
    id: uuidv4(),
    name: `${original.name} (副本)`,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [copy, ...reviews];
  saveReviews(updated);
  return updated;
}

export function toggleFavorite(reviews: ChocolateReview[], id: string): ChocolateReview[] {
  const updated = reviews.map(r =>
    r.id === id ? { ...r, isFavorite: !r.isFavorite, updatedAt: new Date().toISOString() } : r
  );
  saveReviews(updated);
  return updated;
}
