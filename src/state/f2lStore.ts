import { useState, useEffect } from 'react';

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

export function useF2LStore() {
  const [stats, setStats] = useState<F2LStats>(DEFAULT_F2L_STATS);

  // Load stats from localStorage on first render
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem(STORAGE_KEY);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Failed to load F2L stats:', error);
    }
  }, []);

  // Save to localStorage whenever stats change
  useEffect(() => {
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