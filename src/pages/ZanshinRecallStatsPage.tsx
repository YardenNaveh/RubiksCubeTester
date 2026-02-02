import React, { useState } from 'react';
import useZanshinRecallStore, { getAccuracy, getAvgResponseTime, TypeStats } from '../state/zanshinRecallStore';

const formatTime = (ms: number) => ms === 0 ? '-' : `${(ms / 1000).toFixed(2)}s`;

interface TypeStatsCardProps {
  title: string;
  stats: TypeStats;
}

const TypeStatsCard: React.FC<TypeStatsCardProps> = ({ title, stats }) => {
  const accuracy = getAccuracy(stats.correct, stats.attempts);
  const avgTime = getAvgResponseTime(stats.totalTimeMs, stats.attempts);

  return (
    <div className="bg-slate-800 rounded-md p-3">
      <h3 className="text-sm font-semibold text-sky-400 mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-400">Attempts:</span>
          <span className="ml-2 text-slate-200">{stats.attempts}</span>
        </div>
        <div>
          <span className="text-slate-400">Correct:</span>
          <span className="ml-2 text-slate-200">{stats.correct}</span>
        </div>
        <div>
          <span className="text-slate-400">Accuracy:</span>
          <span className="ml-2 text-slate-200">{accuracy.toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400">Avg Time:</span>
          <span className="ml-2 text-slate-200">{formatTime(avgTime)}</span>
        </div>
        <div>
          <span className="text-slate-400">Current Streak:</span>
          <span className="ml-2 text-slate-200">{stats.currentStreak}</span>
        </div>
        <div>
          <span className="text-slate-400">Best Streak:</span>
          <span className="ml-2 text-slate-200">{stats.bestStreak}</span>
        </div>
      </div>
    </div>
  );
};

const ZanshinRecallStatsPage: React.FC = () => {
  const { stats, sessionStats, resetSession, resetStats } = useZanshinRecallStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSessionResetConfirm, setShowSessionResetConfirm] = useState(false);

  const overallAccuracy = getAccuracy(stats.correctTotal, stats.attemptsTotal);
  const overallAvgTime = getAvgResponseTime(stats.totalResponseTimeMs, stats.attemptsTotal);
  
  const sessionAccuracy = getAccuracy(sessionStats.correctTotal, sessionStats.attemptsTotal);

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h1 className="text-xl font-bold text-sky-400">Zanshin Recall Stats</h1>

      {/* Overall Stats */}
      <div className="w-full">
        <h2 className="text-md font-semibold text-slate-300 mb-2">Overall Statistics</h2>
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="p-3 bg-slate-800 rounded-md">
            <h3 className="text-xs text-slate-400">Total Attempts</h3>
            <p className="text-lg font-bold text-slate-200">{stats.attemptsTotal}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-md">
            <h3 className="text-xs text-slate-400">Total Correct</h3>
            <p className="text-lg font-bold text-slate-200">{stats.correctTotal}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-md">
            <h3 className="text-xs text-slate-400">Accuracy</h3>
            <p className="text-lg font-bold text-slate-200">{overallAccuracy.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-md">
            <h3 className="text-xs text-slate-400">Avg Response</h3>
            <p className="text-lg font-bold text-slate-200">{formatTime(overallAvgTime)}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-md">
            <h3 className="text-xs text-slate-400">Current Streak</h3>
            <p className="text-lg font-bold text-slate-200">{stats.currentStreakCorrect}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-md">
            <h3 className="text-xs text-slate-400">Best Streak</h3>
            <p className="text-lg font-bold text-slate-200">{stats.bestStreakCorrect}</p>
          </div>
        </div>
      </div>

      {/* Per-Type Stats */}
      <div className="w-full space-y-3">
        <h2 className="text-md font-semibold text-slate-300">By Question Type</h2>
        <TypeStatsCard title="Piece Recall" stats={stats.pieceRecall} />
        <TypeStatsCard title="Sticker Set Recall" stats={stats.stickerSetRecall} />
        <TypeStatsCard title="Single Sticker Recall" stats={stats.singleStickerRecall} />
      </div>

      {/* Session Stats */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-md font-semibold text-slate-300">Current Session</h2>
          <button
            onClick={() => setShowSessionResetConfirm(true)}
            className="text-xs px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded"
            disabled={sessionStats.attemptsTotal === 0}
          >
            Reset Session
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-slate-800 rounded-md">
            <p className="text-xs text-slate-400">Attempts</p>
            <p className="text-sm font-bold text-slate-200">{sessionStats.attemptsTotal}</p>
          </div>
          <div className="p-2 bg-slate-800 rounded-md">
            <p className="text-xs text-slate-400">Correct</p>
            <p className="text-sm font-bold text-slate-200">{sessionStats.correctTotal}</p>
          </div>
          <div className="p-2 bg-slate-800 rounded-md">
            <p className="text-xs text-slate-400">Accuracy</p>
            <p className="text-sm font-bold text-slate-200">{sessionAccuracy.toFixed(0)}%</p>
          </div>
          <div className="p-2 bg-slate-800 rounded-md">
            <p className="text-xs text-slate-400">Streak</p>
            <p className="text-sm font-bold text-slate-200">{sessionStats.currentStreakCorrect}</p>
          </div>
        </div>
      </div>

      {/* Reset All Button */}
      <div className="flex justify-end w-full">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 text-white bg-red-700 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={stats.attemptsTotal === 0}
        >
          Reset All Data
        </button>
      </div>

      {/* Reset All Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-4/5 max-w-md">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Confirm Reset</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to reset all Zanshin Recall stats?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => { resetStats(); setShowResetConfirm(false); }}
                className="px-4 py-2 text-white bg-red-700 rounded-md hover:bg-red-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Reset Confirmation Modal */}
      {showSessionResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-4/5 max-w-md">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Reset Session?</h2>
            <p className="text-slate-300 mb-6">
              Start a new session? Your overall stats will be preserved.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowSessionResetConfirm(false)}
                className="px-4 py-2 text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => { resetSession(); setShowSessionResetConfirm(false); }}
                className="px-4 py-2 text-white bg-sky-600 rounded-md hover:bg-sky-500"
              >
                New Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZanshinRecallStatsPage;
