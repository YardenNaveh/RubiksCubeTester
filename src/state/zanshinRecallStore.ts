import { useEffect, useRef, useState } from 'react';

export type QuestionType = 'pieceRecall' | 'stickerSetRecall' | 'singleStickerRecall';

export interface TypeStats {
  attempts: number;
  correct: number;
  currentStreak: number;
  bestStreak: number;
  totalTimeMs: number; // For calculating avg response time
}

export interface ZanshinRecallStats {
  // Overall stats
  attemptsTotal: number;
  correctTotal: number;
  currentStreakCorrect: number;
  bestStreakCorrect: number;
  totalResponseTimeMs: number;
  
  // Per question type stats
  pieceRecall: TypeStats;
  stickerSetRecall: TypeStats;
  singleStickerRecall: TypeStats;
}

export interface SessionStats {
  attemptsTotal: number;
  correctTotal: number;
  currentStreakCorrect: number;
  bestStreakCorrect: number;
  totalResponseTimeMs: number;
  
  pieceRecall: TypeStats;
  stickerSetRecall: TypeStats;
  singleStickerRecall: TypeStats;
}

const STORAGE_KEY = 'zanshin-recall-v1';

const DEFAULT_TYPE_STATS: TypeStats = {
  attempts: 0,
  correct: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalTimeMs: 0,
};

const DEFAULT_STATS: ZanshinRecallStats = {
  attemptsTotal: 0,
  correctTotal: 0,
  currentStreakCorrect: 0,
  bestStreakCorrect: 0,
  totalResponseTimeMs: 0,
  pieceRecall: { ...DEFAULT_TYPE_STATS },
  stickerSetRecall: { ...DEFAULT_TYPE_STATS },
  singleStickerRecall: { ...DEFAULT_TYPE_STATS },
};

const DEFAULT_SESSION_STATS: SessionStats = {
  attemptsTotal: 0,
  correctTotal: 0,
  currentStreakCorrect: 0,
  bestStreakCorrect: 0,
  totalResponseTimeMs: 0,
  pieceRecall: { ...DEFAULT_TYPE_STATS },
  stickerSetRecall: { ...DEFAULT_TYPE_STATS },
  singleStickerRecall: { ...DEFAULT_TYPE_STATS },
};

function mergeTypeStats(saved: Partial<TypeStats> | undefined): TypeStats {
  return {
    attempts: saved?.attempts ?? 0,
    correct: saved?.correct ?? 0,
    currentStreak: saved?.currentStreak ?? 0,
    bestStreak: saved?.bestStreak ?? 0,
    totalTimeMs: saved?.totalTimeMs ?? 0,
  };
}

function mergeWithDefaults(saved: Partial<ZanshinRecallStats>): ZanshinRecallStats {
  return {
    attemptsTotal: saved.attemptsTotal ?? 0,
    correctTotal: saved.correctTotal ?? 0,
    currentStreakCorrect: saved.currentStreakCorrect ?? 0,
    bestStreakCorrect: saved.bestStreakCorrect ?? 0,
    totalResponseTimeMs: saved.totalResponseTimeMs ?? 0,
    pieceRecall: mergeTypeStats(saved.pieceRecall),
    stickerSetRecall: mergeTypeStats(saved.stickerSetRecall),
    singleStickerRecall: mergeTypeStats(saved.singleStickerRecall),
  };
}

function getInitialStats(): ZanshinRecallStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return mergeWithDefaults(JSON.parse(saved));
  } catch (e) {
    console.error('Failed to load Zanshin Recall stats:', e);
  }
  return { ...DEFAULT_STATS };
}

export function useZanshinRecallStore() {
  const [stats, setStats] = useState<ZanshinRecallStats>(getInitialStats);
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
      console.error('Failed to save Zanshin Recall stats:', e);
    }
  }, [stats]);

  const recordAttempt = (isCorrect: boolean, questionType: QuestionType, responseTimeMs: number) => {
    // Update persistent stats
    setStats(prev => {
      const newTypeStats = { ...prev[questionType] };
      newTypeStats.attempts += 1;
      newTypeStats.correct += isCorrect ? 1 : 0;
      newTypeStats.currentStreak = isCorrect ? newTypeStats.currentStreak + 1 : 0;
      newTypeStats.bestStreak = Math.max(newTypeStats.bestStreak, newTypeStats.currentStreak);
      newTypeStats.totalTimeMs += responseTimeMs;

      return {
        ...prev,
        attemptsTotal: prev.attemptsTotal + 1,
        correctTotal: prev.correctTotal + (isCorrect ? 1 : 0),
        currentStreakCorrect: isCorrect ? prev.currentStreakCorrect + 1 : 0,
        bestStreakCorrect: Math.max(prev.bestStreakCorrect, isCorrect ? prev.currentStreakCorrect + 1 : 0),
        totalResponseTimeMs: prev.totalResponseTimeMs + responseTimeMs,
        [questionType]: newTypeStats,
      };
    });

    // Update session stats
    setSessionStats(prev => {
      const newTypeStats = { ...prev[questionType] };
      newTypeStats.attempts += 1;
      newTypeStats.correct += isCorrect ? 1 : 0;
      newTypeStats.currentStreak = isCorrect ? newTypeStats.currentStreak + 1 : 0;
      newTypeStats.bestStreak = Math.max(newTypeStats.bestStreak, newTypeStats.currentStreak);
      newTypeStats.totalTimeMs += responseTimeMs;

      return {
        ...prev,
        attemptsTotal: prev.attemptsTotal + 1,
        correctTotal: prev.correctTotal + (isCorrect ? 1 : 0),
        currentStreakCorrect: isCorrect ? prev.currentStreakCorrect + 1 : 0,
        bestStreakCorrect: Math.max(prev.bestStreakCorrect, isCorrect ? prev.currentStreakCorrect + 1 : 0),
        totalResponseTimeMs: prev.totalResponseTimeMs + responseTimeMs,
        [questionType]: newTypeStats,
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

export default useZanshinRecallStore;
