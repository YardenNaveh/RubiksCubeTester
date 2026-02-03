import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Target, Clock, Zap } from 'lucide-react';
import useInnerEyeStore, { getAccuracy, getAvgResponseTime, LevelStats } from '../state/innerEyeStore';

const StatCard: React.FC<{ 
  icon: React.ReactNode;
  label: string; 
  value: string | number;
  subtext?: string;
}> = ({ icon, label, value, subtext }) => (
  <div className="bg-slate-800 rounded-lg p-3">
    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
      {icon}
      {label}
    </div>
    <div className="text-xl font-bold text-slate-100">{value}</div>
    {subtext && <div className="text-xs text-slate-500">{subtext}</div>}
  </div>
);

const LevelStatsRow: React.FC<{
  level: number;
  stats: LevelStats;
  description: string;
}> = ({ level, stats, description }) => {
  const accuracy = getAccuracy(stats.correct, stats.attempts);
  const avgTime = getAvgResponseTime(stats.totalTimeMs, stats.attempts);
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-slate-200">Level {level}</div>
          <div className="text-xs text-slate-500">{description}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-sky-400">{accuracy.toFixed(1)}%</div>
          <div className="text-xs text-slate-500">accuracy</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="text-center">
          <div className="text-slate-300 font-semibold">{stats.attempts}</div>
          <div className="text-slate-500">attempts</div>
        </div>
        <div className="text-center">
          <div className="text-emerald-400 font-semibold">{stats.correct}</div>
          <div className="text-slate-500">correct</div>
        </div>
        <div className="text-center">
          <div className="text-amber-400 font-semibold">{stats.bestStreak}</div>
          <div className="text-slate-500">best streak</div>
        </div>
        <div className="text-center">
          <div className="text-slate-300 font-semibold">
            {stats.attempts > 0 ? `${(avgTime / 1000).toFixed(1)}s` : '-'}
          </div>
          <div className="text-slate-500">avg time</div>
        </div>
      </div>
    </div>
  );
};

const InnerEyeStatsPage: React.FC = () => {
  const { stats, resetStats } = useInnerEyeStore();
  
  const overallAccuracy = getAccuracy(stats.correctTotal, stats.attemptsTotal);
  const overallAvgTime = getAvgResponseTime(stats.totalResponseTimeMs, stats.attemptsTotal);
  const edgeAccuracy = getAccuracy(stats.edgeCorrect, stats.edgeAttempts);
  const cornerAccuracy = getAccuracy(stats.cornerCorrect, stats.cornerAttempts);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all Inner Eye Deduction stats? This cannot be undone.')) {
      resetStats();
    }
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/inner-eye" 
          className="flex items-center gap-1 text-slate-400 hover:text-sky-400 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Game
        </Link>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-500 hover:text-red-400 text-sm"
          title="Reset all stats"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <h1 className="text-xl font-bold text-sky-400">Inner Eye Deduction Stats</h1>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<Target size={14} />}
          label="Total Attempts"
          value={stats.attemptsTotal}
          subtext={`${stats.correctTotal} correct`}
        />
        <StatCard
          icon={<Trophy size={14} />}
          label="Accuracy"
          value={`${overallAccuracy.toFixed(1)}%`}
        />
        <StatCard
          icon={<Zap size={14} />}
          label="Best Streak"
          value={stats.bestStreakCorrect}
        />
        <StatCard
          icon={<Clock size={14} />}
          label="Avg Response"
          value={stats.attemptsTotal > 0 ? `${(overallAvgTime / 1000).toFixed(1)}s` : '-'}
        />
      </div>

      {/* Piece Type Stats */}
      <div className="bg-slate-800 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">By Piece Type</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-slate-700/50 rounded">
            <div className="text-xs text-slate-400 mb-1">Edges</div>
            <div className="text-lg font-bold text-sky-400">{edgeAccuracy.toFixed(1)}%</div>
            <div className="text-xs text-slate-500">
              {stats.edgeCorrect}/{stats.edgeAttempts}
            </div>
          </div>
          <div className="text-center p-2 bg-slate-700/50 rounded">
            <div className="text-xs text-slate-400 mb-1">Corners</div>
            <div className="text-lg font-bold text-amber-400">{cornerAccuracy.toFixed(1)}%</div>
            <div className="text-xs text-slate-500">
              {stats.cornerCorrect}/{stats.cornerAttempts}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Level Stats */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-300">By Difficulty Level</h3>
        
        <LevelStatsRow 
          level={1} 
          stats={stats.level1}
          description="Cross + 3 F2L pairs (easiest)"
        />
        <LevelStatsRow 
          level={2} 
          stats={stats.level2}
          description="Cross + 2 F2L pairs"
        />
        <LevelStatsRow 
          level={3} 
          stats={stats.level3}
          description="Cross + 1 F2L pair"
        />
        <LevelStatsRow 
          level={4} 
          stats={stats.level4}
          description="Cross only (hardest)"
        />
      </div>

      {/* Tips */}
      {stats.attemptsTotal === 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-sm">
            No stats yet! Play some rounds to see your progress.
          </p>
        </div>
      )}

      {stats.attemptsTotal > 0 && overallAccuracy < 50 && (
        <div className="bg-amber-900/30 rounded-lg p-3 text-sm">
          <p className="text-amber-200">
            <strong>Tip:</strong> Try starting with Level 1 (more solved pieces visible) to 
            build your deduction skills before tackling harder levels.
          </p>
        </div>
      )}
    </div>
  );
};

export default InnerEyeStatsPage;
