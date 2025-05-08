import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useF2LStore from '../state/f2lStore';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const F2LStatsPage: React.FC = () => {
  const { stats, resetStats } = useF2LStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetStats = () => {
    resetStats();
    setShowResetConfirm(false);
  };

  // Format time as mm:ss
  const formatTime = (ms: number) => {
    if (!ms) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const chartData = {
    labels: stats.times.slice(-30).map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: 'Solve Time (seconds)',
        data: stats.times.slice(-30).map(time => time / 1000),
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderColor: 'rgb(56, 189, 248)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Last 30 Solve Times',
        color: '#e2e8f0',
      },
    },
  };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h1 className="text-xl font-bold text-sky-400">F2L Pair Ninja Stats</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-slate-800 rounded-md">
          <h2 className="text-sm text-slate-400">Total Scrambles</h2>
          <p className="text-xl font-bold text-slate-200">{stats.totalScrambles}</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-md">
          <h2 className="text-sm text-slate-400">Avg Time</h2>
          <p className="text-xl font-bold text-slate-200">
            {stats.times.length > 0 
              ? formatTime(stats.times.reduce((a, b) => a + b, 0) / stats.times.length) 
              : '00:00'}
          </p>
        </div>
        <div className="p-4 bg-slate-800 rounded-md">
          <h2 className="text-sm text-slate-400">Best Time</h2>
          <p className="text-xl font-bold text-slate-200">{formatTime(stats.bestTime)}</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-md">
          <h2 className="text-sm text-slate-400">Total Misses</h2>
          <p className="text-xl font-bold text-slate-200">{stats.misses}</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-md col-span-2">
          <h2 className="text-sm text-slate-400">Best Streak</h2>
          <p className="text-xl font-bold text-slate-200">{stats.bestStreak} scrambles</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 bg-slate-800 rounded-md p-4">
        {stats.times.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            No data yet. Complete some F2L practice sessions to see your stats.
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="flex justify-between w-full">
        <Link 
          to="/f2l"
          className="px-4 py-2 text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          Back
        </Link>
        <button 
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 text-white bg-red-700 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={stats.totalScrambles === 0}
        >
          Reset Data
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-4/5 max-w-md">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Confirm Reset</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to reset all F2L Pair Ninja stats data?
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
                onClick={handleResetStats}
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

export default F2LStatsPage; 