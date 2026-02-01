import { useState, useEffect, useRef } from 'react';

export interface F2LStats {
  totalScrambles: number;
  totalPairsFound: number;
  misses: number;
  times: number[];
  bestTime: number;
  bestStreak: number;
  currentStreak: number;
}

const STORAGE_KEY = 'f2l-pair-ninja-v1';

const DEFAULT_F2L_STATS: F2LStats = {
  totalScrambles: 0,
  totalPairsFound: 0,
  misses: 0,
  times: [],
  bestTime: 0,
  bestStreak: 0,
  currentStreak: 0,
};

// Helper to merge saved data with defaults (handles schema migrations)
function mergeWithDefaults(saved: Partial<F2LStats>): F2LStats {
  return {
    totalScrambles: saved.totalScrambles ?? DEFAULT_F2L_STATS.totalScrambles,
    totalPairsFound: saved.totalPairsFound ?? DEFAULT_F2L_STATS.totalPairsFound,
    misses: saved.misses ?? DEFAULT_F2L_STATS.misses,
    times: Array.isArray(saved.times) ? saved.times : DEFAULT_F2L_STATS.times,
    bestTime: saved.bestTime ?? DEFAULT_F2L_STATS.bestTime,
    bestStreak: saved.bestStreak ?? DEFAULT_F2L_STATS.bestStreak,
    currentStreak: saved.currentStreak ?? DEFAULT_F2L_STATS.currentStreak,
  };
}

// Load initial state from localStorage (runs once, synchronously)
function getInitialStats(): F2LStats {
    try {
      const savedStats = localStorage.getItem(STORAGE_KEY);
      if (savedStats) {
      const parsed = JSON.parse(savedStats);
      return mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.error('Failed to load F2L stats:', error);
    }
  return DEFAULT_F2L_STATS;
}

export function useF2LStore() {
  const [stats, setStats] = useState<F2LStats>(getInitialStats);
  const isInitialized = useRef(false);

  // Save to localStorage whenever stats change (skip first render to avoid overwriting)
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save F2L stats:', error);
    }
  }, [stats]);

  // Record completion of a scramble
  const recordScrambleComplete = (time: number, missCount: number) => {
    setStats(prevStats => {
      const newTimes = [...prevStats.times, time].slice(-50); // Store last 50 times
      const newBestTime = prevStats.bestTime === 0 
        ? time 
        : Math.min(prevStats.bestTime, time);
      
      // Update streak
      const isZeroMiss = missCount === 0;
      const newCurrentStreak = isZeroMiss ? prevStats.currentStreak + 1 : 0;
      const newBestStreak = Math.max(prevStats.bestStreak, newCurrentStreak);
      
      return {
        totalScrambles: prevStats.totalScrambles + 1,
        totalPairsFound: prevStats.totalPairsFound + 4, // Always 4 pairs in F2L
        misses: prevStats.misses + missCount,
        times: newTimes,
        bestTime: newBestTime,
        bestStreak: newBestStreak,
        currentStreak: newCurrentStreak,
      };
    });
  };

  // Reset stats
  const resetStats = () => {
    setStats(DEFAULT_F2L_STATS);
  };

  return {
    stats,
    recordScrambleComplete,
    resetStats,
  };
}

export default useF2LStore; 