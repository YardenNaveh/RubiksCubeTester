import React, { useState } from 'react';
import useEdgeKataStore from '../state/edgeKataStore';

const pct = (num: number, den: number) => (den === 0 ? '0.0' : ((num / den) * 100).toFixed(1));

const EdgeKataStatsPage: React.FC = () => {
  const { stats, resetStats } = useEdgeKataStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h1 className="text-xl font-bold text-sky-400">Edge Kata Stats</h1>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-slate-800 rounded-md">
          <h2 className="text-sm text-slate-400">Total Attempts</h2>
          <p className="text-xl font-bold text-slate-200">{stats.totalAttempts}</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-md">
          <h2 className="text-sm text-slate-400">Accuracy</h2>
          <p className="text-xl font-bold text-slate-200">{pct(stats.correct, stats.totalAttempts)}%</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-md">
          <h2 className="text-sm text-slate-400">Current Streak</h2>
          <p className="text-xl font-bold text-slate-200">{stats.currentStreak}</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-md">
          <h2 className="text-sm text-slate-400">Best Streak</h2>
          <p className="text-xl font-bold text-slate-200">{stats.bestStreak}</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-md col-span-2">
          <h2 className="text-sm text-slate-400">Breakdown</h2>
          <div className="mt-2 text-slate-200 text-sm space-y-1">
            <div>U/D edges: {pct(stats.udCorrect, stats.udAttempts)}% ({stats.udCorrect}/{stats.udAttempts})</div>
            <div>Non-U/D edges: {pct(stats.fbCorrect, stats.fbAttempts)}% ({stats.fbCorrect}/{stats.fbAttempts})</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end w-full">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 text-white bg-red-700 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={stats.totalAttempts === 0}
        >
          Reset Data
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-4/5 max-w-md">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Confirm Reset</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to reset all Edge Kata stats data?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                Cancel
              </button>
              <button
                onClick={() => { resetStats(); setShowResetConfirm(false); }}
                className="px-4 py-2 text-white bg-red-700 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EdgeKataStatsPage;

