import { useEffect, useRef, useState } from 'react';

export interface EdgeKataStats {
  totalAttempts: number;
  correct: number;
  currentStreak: number;
  bestStreak: number;
  udAttempts: number;
  udCorrect: number;
  fbAttempts: number;
  fbCorrect: number;
}

const STORAGE_KEY = 'edge-kata-v1';

const DEFAULT_STATS: EdgeKataStats = {
  totalAttempts: 0,
  correct: 0,
  currentStreak: 0,
  bestStreak: 0,
  udAttempts: 0,
  udCorrect: 0,
  fbAttempts: 0,
  fbCorrect: 0,
};

function mergeWithDefaults(saved: Partial<EdgeKataStats>): EdgeKataStats {
  return {
    totalAttempts: saved.totalAttempts ?? DEFAULT_STATS.totalAttempts,
    correct: saved.correct ?? DEFAULT_STATS.correct,
    currentStreak: saved.currentStreak ?? DEFAULT_STATS.currentStreak,
    bestStreak: saved.bestStreak ?? DEFAULT_STATS.bestStreak,
    udAttempts: saved.udAttempts ?? DEFAULT_STATS.udAttempts,
    udCorrect: saved.udCorrect ?? DEFAULT_STATS.udCorrect,
    fbAttempts: saved.fbAttempts ?? DEFAULT_STATS.fbAttempts,
    fbCorrect: saved.fbCorrect ?? DEFAULT_STATS.fbCorrect,
  };
}

function getInitialStats(): EdgeKataStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return mergeWithDefaults(JSON.parse(saved));
  } catch (e) {
    console.error('Failed to load Edge Kata stats:', e);
  }
  return DEFAULT_STATS;
}

export function useEdgeKataStore() {
  const [stats, setStats] = useState<EdgeKataStats>(getInitialStats);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save Edge Kata stats:', e);
    }
  }, [stats]);

  const recordAttempt = (isCorrect: boolean, kind: 'UD' | 'FB') => {
    setStats(prev => {
      const totalAttempts = prev.totalAttempts + 1;
      const correct = prev.correct + (isCorrect ? 1 : 0);
      const currentStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, currentStreak);

      const udAttempts = prev.udAttempts + (kind === 'UD' ? 1 : 0);
      const udCorrect = prev.udCorrect + (kind === 'UD' && isCorrect ? 1 : 0);
      const fbAttempts = prev.fbAttempts + (kind === 'FB' ? 1 : 0);
      const fbCorrect = prev.fbCorrect + (kind === 'FB' && isCorrect ? 1 : 0);

      return { totalAttempts, correct, currentStreak, bestStreak, udAttempts, udCorrect, fbAttempts, fbCorrect };
    });
  };

  const resetStats = () => setStats(DEFAULT_STATS);

  return { stats, recordAttempt, resetStats };
}

export default useEdgeKataStore;

