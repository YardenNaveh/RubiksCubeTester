import React from 'react';
import { AppStorage, DEFAULT_STATS } from '../hooks/useLocalStorage';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsPageProps {
  appData: AppStorage;
  setAppData: (value: AppStorage | ((val: AppStorage) => AppStorage)) => void;
  // resetStats is implicitly available via setAppData if needed, or pass explicitly
}

const StatsPage: React.FC<StatsPageProps> = ({ appData, setAppData }) => {
  const { stats } = appData;
  const accuracy = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : '0.0';
  const avgTime = stats.times.length > 0
    ? (stats.times.reduce((a, b) => a + b, 0) / stats.times.length).toFixed(0)
    : '0';

  const resetData = () => {
    if (window.confirm('Are you sure you want to reset all your stats?')) {
        setAppData(prev => ({
            ...prev,
            stats: { ...DEFAULT_STATS, times: [] }
        }));
    }
  };

  // Chart data (last 50 times)
  const last50Times = stats.times.slice(-50);
  const chartData = {
    labels: last50Times.map((_, index) => index + 1), // Simple labels 1 to 50
    datasets: [
      {
        label: 'Reaction Time (ms)',
        data: last50Times,
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // accent color with opacity
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container height
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time (ms)',
          color: '#cbd5e1' // slate-300
        },
        ticks: { color: '#94a3b8' }, // slate-400
        grid: { color: '#334155' }, // slate-700
      },
      x: {
        title: {
            display: true,
            text: 'Last Attempts',
            color: '#cbd5e1' // slate-300
        },
        ticks: { color: '#94a3b8' }, // slate-400
        grid: { color: '#334155' }, // slate-700
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Last 50 Reaction Times',
        color: '#e2e8f0' // slate-200
      },
    },
  };

  return (
    <div className="flex flex-col p-4 bg-slate-800 rounded-lg shadow-md space-y-4">
      <h1 className="text-2xl font-semibold text-center text-slate-100">Statistics</h1>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-sm text-slate-400">Total Answered</div>
          <div className="text-xl font-medium text-slate-100">{stats.total}</div>
        </div>
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-sm text-slate-400">Accuracy</div>
          <div className="text-xl font-medium text-slate-100">{accuracy}%</div>
        </div>
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-sm text-slate-400">Best Streak</div>
          <div className="text-xl font-medium text-slate-100">{stats.bestStreak}</div>
        </div>
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-sm text-slate-400">Average Time</div>
          <div className="text-xl font-medium text-slate-100">{avgTime} ms</div>
        </div>
      </div>

      <div className="h-64"> {/* Container for chart with fixed height */} 
        {last50Times.length > 0 ? (
          <Bar options={chartOptions} data={chartData} />
        ) : (
          <p className="text-center text-slate-400 pt-10">No timing data yet.</p>
        )}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={resetData}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
};

export default StatsPage; 