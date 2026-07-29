import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChocolateReview, DraftReview, calculateTotalScore, getGrade } from '../types';
import { loadReviews, saveReviews, addReview, updateReview, deleteReview, duplicateReview, toggleFavorite } from '../utils/storage';

interface ChocolateContextType {
  reviews: ChocolateReview[];
  addNewReview: (draft: DraftReview) => void;
  editReview: (id: string, updates: Partial<ChocolateReview>) => void;
  removeReview: (id: string) => void;
  duplicateExisting: (id: string) => void;
  toggleFav: (id: string) => void;
  getReview: (id: string) => ChocolateReview | undefined;
  exportData: () => void;
  importData: (file: File) => Promise<number>;
  stats: {
    total: number;
    average: number;
    highest: number;
    favorites: number;
    byGrade: Record<string, number>;
    byOrigin: Record<string, number>;
  };
}

const ChocolateContext = createContext<ChocolateContextType | null>(null);

export function ChocolateProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<ChocolateReview[]>(() => loadReviews());

  useEffect(() => {
    saveReviews(reviews);
  }, [reviews]);

  const addNewReview = useCallback((draft: DraftReview) => {
    const totalScore = calculateTotalScore(draft.appearance, draft.aroma, draft.flavor, draft.aftertaste);
    const grade = getGrade(totalScore);
    const newReviews = addReview(reviews, { ...draft, totalScore, grade });
    setReviews(newReviews);
  }, [reviews]);

  const editReview = useCallback((id: string, updates: Partial<ChocolateReview>) => {
    if (updates.appearance || updates.aroma || updates.flavor || updates.aftertaste) {
      const current = reviews.find(r => r.id === id);
      if (current) {
        const appearance = updates.appearance || current.appearance;
        const aroma = updates.aroma || current.aroma;
        const flavor = updates.flavor || current.flavor;
        const aftertaste = updates.aftertaste || current.aftertaste;
        const totalScore = calculateTotalScore(appearance, aroma, flavor, aftertaste);
        const grade = getGrade(totalScore);
        updates = { ...updates, totalScore, grade };
      }
    }
    const newReviews = updateReview(reviews, id, updates);
    setReviews(newReviews);
  }, [reviews]);

  const removeReview = useCallback((id: string) => {
    const newReviews = deleteReview(reviews, id);
    setReviews(newReviews);
  }, [reviews]);

  const duplicateExisting = useCallback((id: string) => {
    const newReviews = duplicateReview(reviews, id);
    setReviews(newReviews);
  }, [reviews]);

  const toggleFav = useCallback((id: string) => {
    const newReviews = toggleFavorite(reviews, id);
    setReviews(newReviews);
  }, [reviews]);

  const getReview = useCallback((id: string) => {
    return reviews.find(r => r.id === id);
  }, [reviews]);

  const stats = React.useMemo(() => {
    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((s, r) => s + r.totalScore, 0) / total : 0;
    const highest = total > 0 ? Math.max(...reviews.map(r => r.totalScore)) : 0;
    const favorites = reviews.filter(r => r.isFavorite).length;

    const byGrade: Record<string, number> = {};
    reviews.forEach(r => {
      byGrade[r.grade] = (byGrade[r.grade] || 0) + 1;
    });

    const byOrigin: Record<string, number> = {};
    reviews.forEach(r => {
      if (r.origin) {
        byOrigin[r.origin] = (byOrigin[r.origin] || 0) + 1;
      }
    });

    return { total, average, highest, favorites, byGrade, byOrigin };
  }, [reviews]);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(reviews, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chocolate-journal-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reviews]);

  const importData = useCallback(async (file: File): Promise<number> => {
    const text = await file.text();
    const imported = JSON.parse(text) as ChocolateReview[];
    if (!Array.isArray(imported)) throw new Error('格式错误：不是有效的品鉴记录文件');
    const existingIds = new Set(reviews.map(r => r.id));
    const newItems = imported.filter(r => {
      if (!r || typeof r !== 'object') return false;
      if (!r.id || !r.name) return false;
      return !existingIds.has(r.id);
    });
    if (newItems.length === 0 && imported.length > 0) {
      if (imported.every(r => r.id && existingIds.has(r.id))) {
        throw new Error('所有记录均已存在（ID 重复）');
      }
      throw new Error('文件中没有有效的品鉴记录');
    }
    const merged = [...newItems, ...reviews];
    setReviews(merged);
    return newItems.length;
  }, [reviews]);

  return (
    <ChocolateContext.Provider value={{
      reviews, addNewReview, editReview, removeReview, duplicateExisting, toggleFav, getReview,
      exportData, importData, stats
    }}>
      {children}
    </ChocolateContext.Provider>
  );
}

export function useChocolate() {
  const ctx = useContext(ChocolateContext);
  if (!ctx) throw new Error('useChocolate must be used within ChocolateProvider');
  return ctx;
}
