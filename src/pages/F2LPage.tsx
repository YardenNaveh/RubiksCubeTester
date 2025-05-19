import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppStorage, BottomColorSetting } from '../hooks/useLocalStorage';
import { useSound } from '../hooks/useSound';
import F2LCube from '../components/f2l/F2LCube';
import useF2LStore from '../state/f2lStore';
import { RubiksCubeState, createInitialCubeState, generateDetailedF2LScramble } from '../logic/f2l/scramble';
import { CubeColor, COLORS } from '../logic/cubeConstants';

// Define props for F2LPage
interface F2LPageProps {
  appData: AppStorage;
}

const F2LPage: React.FC<F2LPageProps> = ({ appData }) => {
  const { recordScrambleComplete } = useF2LStore();
  
  const [pairsFound, setPairsFound] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [scrambleString, setScrambleString] = useState("");
  const [misses, setMisses] = useState(0);

  const initialBottomColorSetting = appData.settings.bottomColor;
  const [actualBottomColorForScramble, setActualBottomColorForScramble] = useState<CubeColor>(() => {
    return initialBottomColorSetting === 'random' ? COLORS[Math.floor(Math.random() * COLORS.length)] : initialBottomColorSetting;
  });

  const [cubeState, setCubeState] = useState<RubiksCubeState>(createInitialCubeState(actualBottomColorForScramble));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const playSuccessSound = useSound('ding', appData.settings.muted);
  const playErrorSound = useSound('bzzt', appData.settings.muted);

  // Temporarily commented out to reduce console noise during loop debugging
  // console.log('[F2LPage] Render cycle. Current bottomColorSetting from appData:', appData.settings.bottomColor);

  const getScrambleOrientationContext = useCallback((bColor: CubeColor): { up: CubeColor; front: CubeColor } => {
    switch (bColor) {
      case 'yellow': return { up: 'white', front: 'red' };
      case 'white': return { up: 'yellow', front: 'orange' };
      case 'red': return { up: 'orange', front: 'white' };
      case 'blue': return { up: 'green', front: 'red' };
      case 'orange': return { up: 'red', front: 'yellow' };
      case 'green': return { up: 'blue', front: 'red' };
      default: return { up: 'white', front: 'red' };
    }
  }, []);

  const handleScramble = useCallback(() => {
    const currentBottomSetting = appData.settings.bottomColor; // Read fresh from appData prop
    const colorForThisScramble = currentBottomSetting === 'random' 
      ? COLORS[Math.floor(Math.random() * COLORS.length)] 
      : currentBottomSetting;
    
    setActualBottomColorForScramble(colorForThisScramble);
    console.log(`[F2LPage] handleScramble: Setting actualBottomColorForScramble to ${colorForThisScramble} (derived from setting: ${currentBottomSetting})`);

    const { scrambleString: newScramble, finalState } = generateDetailedF2LScramble(colorForThisScramble, 20);
    setScrambleString(newScramble);
    setCubeState(finalState);
    setPairsFound(0);
    setMisses(0);
    setTimerRunning(false);
    setTime(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
  }, [appData.settings.bottomColor]); // Recreate handleScramble IF the setting from appData changes. This is correct.

  useEffect(() => {
    console.log(`[F2LPage] useEffect for bottomColorSetting: ${appData.settings.bottomColor}. Calling handleScramble.`);
    handleScramble();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  // This useEffect should run when appData.settings.bottomColor changes, OR when handleScramble (the function itself) changes.
  // Since handleScramble now correctly depends on appData.settings.bottomColor, this setup is what we want.
  }, [appData.settings.bottomColor, handleScramble]);

  const handlePairFound = () => {
    if (!timerRunning) {
      startTimer();
    }
    playSuccessSound();
    setPairsFound(prev => {
      const newCount = prev + 1;
      if (newCount === 4) {
        finishSession();
      }
      return newCount;
    });
  };

  const handleMiss = () => {
    if (!timerRunning) {
      startTimer();
    }
    playErrorSound();
    setMisses(prev => prev + 1);
  };

  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setTime(Date.now() - startTimeRef.current);
        }
      }, 100);
    }
  };

  const finishSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
    
    const finalTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    recordScrambleComplete(finalTime, misses);
    
    setTimeout(() => {
      alert("Nice! New scramble...");
      handleScramble();
    }, 1000);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const orientationContext = getScrambleOrientationContext(actualBottomColorForScramble);
  const scrambleDisplayString = scrambleString 
    ? `(Up: ${orientationContext.up}, Front: ${orientationContext.front}) ${scrambleString}` 
    : "Click Scramble to start";

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h1 className="text-xl font-bold text-sky-400">F2L Pair Ninja</h1>

      <div className="w-4/5 max-h-[300px] aspect-square bg-slate-950 rounded-lg overflow-hidden">
        <F2LCube 
          onPairFound={handlePairFound} 
          onMiss={handleMiss} 
          cubeState={cubeState}
          bottomColor={actualBottomColorForScramble}
        />
      </div>

      <div className="flex justify-between w-full px-4 py-2 bg-slate-800 rounded-md">
        <div className="text-slate-300">
          <span className="font-mono">{formatTime(time)}</span>
        </div>
        <div className="text-slate-300">
          Pairs: <span className="font-bold">{pairsFound} / 4</span>
        </div>
      </div>

      <div 
        className="w-full px-4 py-2 font-mono text-sm text-slate-300 bg-slate-800 rounded-md cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(scrambleString);
          alert("Scramble copied to clipboard!");
        }}
      >
        {scrambleDisplayString}
      </div>

      <div className="flex justify-between w-full">
        <button 
          onClick={handleScramble}
          className="px-4 py-2 text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          Scramble
        </button>
        <Link 
          to="/f2l/stats"
          className="px-4 py-2 text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          Stats
        </Link>
      </div>
    </div>
  );
};

export default F2LPage; 