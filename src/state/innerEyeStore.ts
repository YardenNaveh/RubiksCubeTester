import { useEffect, useRef, useState } from 'react';

export type DifficultyLevel = 1 | 2 | 3 | 4;
export type PieceType = 'edge' | 'corner';

export interface LevelStats {
  attempts: number;
  correct: number;
  currentStreak: number;
  bestStreak: number;
  totalTimeMs: number;
}

export interface InnerEyeStats {
  // Overall stats
  attemptsTotal: number;
  correctTotal: number;
  currentStreakCorrect: number;
  bestStreakCorrect: number;
  totalResponseTimeMs: number;
  
  // Per difficulty level stats
  level1: LevelStats;
  level2: LevelStats;
  level3: LevelStats;
  level4: LevelStats;
  
  // Per piece type stats
  edgeAttempts: number;
  edgeCorrect: number;
  cornerAttempts: number;
  cornerCorrect: number;
}

export interface SessionStats {
  attemptsTotal: number;
  correctTotal: number;
  currentStreakCorrect: number;
  bestStreakCorrect: number;
  totalResponseTimeMs: number;
  
  level1: LevelStats;
  level2: LevelStats;
  level3: LevelStats;
  level4: LevelStats;
  
  edgeAttempts: number;
  edgeCorrect: number;
  cornerAttempts: number;
  cornerCorrect: number;
}

const STORAGE_KEY = 'inner-eye-deduction-v1';

const DEFAULT_LEVEL_STATS: LevelStats = {
  attempts: 0,
  correct: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalTimeMs: 0,
};

const DEFAULT_STATS: InnerEyeStats = {
  attemptsTotal: 0,
  correctTotal: 0,
  currentStreakCorrect: 0,
  bestStreakCorrect: 0,
  totalResponseTimeMs: 0,
  level1: { ...DEFAULT_LEVEL_STATS },
  level2: { ...DEFAULT_LEVEL_STATS },
  level3: { ...DEFAULT_LEVEL_STATS },
  level4: { ...DEFAULT_LEVEL_STATS },
  edgeAttempts: 0,
  edgeCorrect: 0,
  cornerAttempts: 0,
  cornerCorrect: 0,
};

const DEFAULT_SESSION_STATS: SessionStats = {
  attemptsTotal: 0,
  correctTotal: 0,
  currentStreakCorrect: 0,
  bestStreakCorrect: 0,
  totalResponseTimeMs: 0,
  level1: { ...DEFAULT_LEVEL_STATS },
  level2: { ...DEFAULT_LEVEL_STATS },
  level3: { ...DEFAULT_LEVEL_STATS },
  level4: { ...DEFAULT_LEVEL_STATS },
  edgeAttempts: 0,
  edgeCorrect: 0,
  cornerAttempts: 0,
  cornerCorrect: 0,
};

function mergeLevelStats(saved: Partial<LevelStats> | undefined): LevelStats {
  return {
    attempts: saved?.attempts ?? 0,
    correct: saved?.correct ?? 0,
    currentStreak: saved?.currentStreak ?? 0,
    bestStreak: saved?.bestStreak ?? 0,
    totalTimeMs: saved?.totalTimeMs ?? 0,
  };
}

function mergeWithDefaults(saved: Partial<InnerEyeStats>): InnerEyeStats {
  return {
    attemptsTotal: saved.attemptsTotal ?? 0,
    correctTotal: saved.correctTotal ?? 0,
    currentStreakCorrect: saved.currentStreakCorrect ?? 0,
    bestStreakCorrect: saved.bestStreakCorrect ?? 0,
    totalResponseTimeMs: saved.totalResponseTimeMs ?? 0,
    level1: mergeLevelStats(saved.level1),
    level2: mergeLevelStats(saved.level2),
    level3: mergeLevelStats(saved.level3),
    level4: mergeLevelStats(saved.level4),
    edgeAttempts: saved.edgeAttempts ?? 0,
    edgeCorrect: saved.edgeCorrect ?? 0,
    cornerAttempts: saved.cornerAttempts ?? 0,
    cornerCorrect: saved.cornerCorrect ?? 0,
  };
}

function getInitialStats(): InnerEyeStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return mergeWithDefaults(JSON.parse(saved));
  } catch (e) {
    console.error('Failed to load Inner Eye Deduction stats:', e);
  }
  return { ...DEFAULT_STATS };
}

export function useInnerEyeStore() {
  const [stats, setStats] = useState<InnerEyeStats>(getInitialStats);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ ...DEFAULT_SESSION_STATS });
  const isInitialized = useRef(false);

  // Persist stats to localStorage
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save Inner Eye Deduction stats:', e);
    }
  }, [stats]);

  const recordAttempt = (
    isCorrect: boolean,
    level: DifficultyLevel,
    pieceType: PieceType,
    responseTimeMs: number
  ) => {
    const levelKey = `level${level}` as 'level1' | 'level2' | 'level3' | 'level4';
    
    // Update persistent stats
    setStats(prev => {
      const newLevelStats = { ...prev[levelKey] };
      newLevelStats.attempts += 1;
      newLevelStats.correct += isCorrect ? 1 : 0;
      newLevelStats.currentStreak = isCorrect ? newLevelStats.currentStreak + 1 : 0;
      newLevelStats.bestStreak = Math.max(newLevelStats.bestStreak, newLevelStats.currentStreak);
      newLevelStats.totalTimeMs += responseTimeMs;

      return {
        ...prev,
        attemptsTotal: prev.attemptsTotal + 1,
        correctTotal: prev.correctTotal + (isCorrect ? 1 : 0),
        currentStreakCorrect: isCorrect ? prev.currentStreakCorrect + 1 : 0,
        bestStreakCorrect: Math.max(prev.bestStreakCorrect, isCorrect ? prev.currentStreakCorrect + 1 : 0),
        totalResponseTimeMs: prev.totalResponseTimeMs + responseTimeMs,
        [levelKey]: newLevelStats,
        edgeAttempts: prev.edgeAttempts + (pieceType === 'edge' ? 1 : 0),
        edgeCorrect: prev.edgeCorrect + (pieceType === 'edge' && isCorrect ? 1 : 0),
        cornerAttempts: prev.cornerAttempts + (pieceType === 'corner' ? 1 : 0),
        cornerCorrect: prev.cornerCorrect + (pieceType === 'corner' && isCorrect ? 1 : 0),
      };
    });

    // Update session stats
    setSessionStats(prev => {
      const newLevelStats = { ...prev[levelKey] };
      newLevelStats.attempts += 1;
      newLevelStats.correct += isCorrect ? 1 : 0;
      newLevelStats.currentStreak = isCorrect ? newLevelStats.currentStreak + 1 : 0;
      newLevelStats.bestStreak = Math.max(newLevelStats.bestStreak, newLevelStats.currentStreak);
      newLevelStats.totalTimeMs += responseTimeMs;

      return {
        ...prev,
        attemptsTotal: prev.attemptsTotal + 1,
        correctTotal: prev.correctTotal + (isCorrect ? 1 : 0),
        currentStreakCorrect: isCorrect ? prev.currentStreakCorrect + 1 : 0,
        bestStreakCorrect: Math.max(prev.bestStreakCorrect, isCorrect ? prev.currentStreakCorrect + 1 : 0),
        totalResponseTimeMs: prev.totalResponseTimeMs + responseTimeMs,
        [levelKey]: newLevelStats,
        edgeAttempts: prev.edgeAttempts + (pieceType === 'edge' ? 1 : 0),
        edgeCorrect: prev.edgeCorrect + (pieceType === 'edge' && isCorrect ? 1 : 0),
        cornerAttempts: prev.cornerAttempts + (pieceType === 'corner' ? 1 : 0),
        cornerCorrect: prev.cornerCorrect + (pieceType === 'corner' && isCorrect ? 1 : 0),
      };
    });
  };

  const resetSession = () => {
    setSessionStats({ ...DEFAULT_SESSION_STATS });
  };

  const resetStats = () => {
    setStats({ ...DEFAULT_STATS });
    setSessionStats({ ...DEFAULT_SESSION_STATS });
  };

  return { stats, sessionStats, recordAttempt, resetSession, resetStats };
}

// Helper functions for calculating derived stats
export function getAccuracy(correct: number, attempts: number): number {
  return attempts === 0 ? 0 : (correct / attempts) * 100;
}

export function getAvgResponseTime(totalTimeMs: number, attempts: number): number {
  return attempts === 0 ? 0 : totalTimeMs / attempts;
}

export default useInnerEyeStore;
