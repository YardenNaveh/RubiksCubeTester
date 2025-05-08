import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStorage } from '../hooks/useLocalStorage';
import { useSound } from '../hooks/useSound';
import F2LCube from '../components/f2l/F2LCube';
import useF2LStore from '../state/f2lStore';
import { RubiksCubeState, createInitialCubeState, generateDetailedF2LScramble } from '../logic/f2l/scramble';
import { CubeColor } from '../logic/cubeConstants';

const F2LPage: React.FC = () => {
  const [appData] = useAppStorage();
  const { recordScrambleComplete } = useF2LStore();
  
  const [pairsFound, setPairsFound] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [scrambleString, setScrambleString] = useState("");
  const [misses, setMisses] = useState(0);
  const [cubeState, setCubeState] = useState<RubiksCubeState>(createInitialCubeState(appData.settings.bottomColor as CubeColor));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const playSuccessSound = useSound('ding', appData.settings.muted);
  const playErrorSound = useSound('bzzt', appData.settings.muted);

  const bottomColor = appData.settings.bottomColor as CubeColor;

  const handleScramble = () => {
    const { scrambleString: newScramble, finalState } = generateDetailedF2LScramble(bottomColor, 20);
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
  };

  useEffect(() => {
    handleScramble();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [bottomColor]);

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

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h1 className="text-xl font-bold text-sky-400">F2L Pair Ninja</h1>

      <div className="w-4/5 max-h-[300px] aspect-square bg-slate-950 rounded-lg overflow-hidden">
        <F2LCube 
          onPairFound={handlePairFound} 
          onMiss={handleMiss} 
          cubeState={cubeState}
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
        {scrambleString || "Click Scramble to start"}
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