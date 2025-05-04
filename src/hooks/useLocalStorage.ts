import { useState, useEffect } from 'react';

// Define the structure for the data stored in localStorage
import { CubeColor, COLORS } from '../logic/cubeConstants';

export interface Settings {
  muted: boolean;
  bottomColor: CubeColor; // Now actively used
}
export interface DrillStats {
  total: number;
  correct: number;
  bestStreak: number;
  currentStreak: number;
  times: number[]; // ms, capped at last 50
}

export interface AppStorage {
  settings: Settings;
  stats: DrillStats;
}

const STORAGE_KEY = 'rubiks-trainer-v1';

const DEFAULT_SETTINGS: Settings = {
  muted: false,
  bottomColor: 'white', // Explicit default
};

const DEFAULT_STATS: DrillStats = {
  total: 0,
  correct: 0,
  bestStreak: 0,
  currentStreak: 0,
  times: [],
};

// Hook to manage state persistence in localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get stored value or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      const valueToStore = JSON.stringify(storedValue);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Define the setter function compatible with useState's setter
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error updating localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Specific hook for the app's combined settings and stats
export function useAppStorage(): [
  AppStorage,
  (value: AppStorage | ((val: AppStorage) => AppStorage)) => void,
  () => void
] {
  const initialAppData: AppStorage = {
    settings: { ...DEFAULT_SETTINGS },
    stats: { ...DEFAULT_STATS },
  };

  // Try to load existing data, merging defaults for potentially missing keys
  const [appData, setAppData] = useLocalStorage<AppStorage>(STORAGE_KEY, initialAppData);

  // Ensure data structure integrity on load (e.g., if new fields were added)
  useEffect(() => {
    let needsUpdate = false;
    const currentData = { ...appData }; // Clone to modify

    // Check settings
    if (!currentData.settings) {
      currentData.settings = { ...DEFAULT_SETTINGS };
      needsUpdate = true;
    } else {
      for (const key in DEFAULT_SETTINGS) {
        if (!(key in currentData.settings)) {
          (currentData.settings as any)[key] = (DEFAULT_SETTINGS as any)[key];
          needsUpdate = true;
        }
      }
    }

    // Check stats
    if (!currentData.stats) {
      currentData.stats = { ...DEFAULT_STATS };
      needsUpdate = true;
    } else {
      for (const key in DEFAULT_STATS) {
        if (!(key in currentData.stats)) {
          (currentData.stats as any)[key] = (DEFAULT_STATS as any)[key];
          needsUpdate = true;
        }
      }
      // Ensure times is always an array
      if (!Array.isArray(currentData.stats.times)) {
          currentData.stats.times = [];
          needsUpdate = true;
      }
    }

    if (needsUpdate) {
      setAppData(currentData);
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to specifically reset stats
  const resetStats = () => {
    setAppData(prev => ({
        ...prev,
        stats: { ...DEFAULT_STATS, times: [] } // Ensure times is reset too
    }));
  };

  // Return the combined state, setter, and the reset helper
  return [appData, setAppData, resetStats];
}

// Export default stats for potential use elsewhere (e.g., Stats page reset)
export { DEFAULT_SETTINGS, DEFAULT_STATS }; 