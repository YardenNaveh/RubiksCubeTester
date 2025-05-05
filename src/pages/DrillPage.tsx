import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppStorage } from '../hooks/useLocalStorage';
import { generateOrientationProblem, OrientationProblem, checkAnswer, Face } from '../logic/orientation';
import { CubeColor, FACE_TO_RELATION_MAP } from '../logic/cubeConstants';
import { useSound } from '../hooks/useSound';
import Cube from '../components/Cube';
import AnswerPad from '../components/AnswerPad';

interface DrillPageProps {
  appData: AppStorage;
  setAppData: (value: AppStorage | ((val: AppStorage) => AppStorage)) => void;
}

// Helper to get a user-friendly name for the face reference
const getFaceName = (face: Face): string => {
  return FACE_TO_RELATION_MAP[face] || face; // Use 'up', 'front', etc. or fallback to F, U...
};

const DrillPage: React.FC<DrillPageProps> = ({ appData, setAppData }) => {
  const { settings } = appData;
  const [currentProblem, setCurrentProblem] = useState<OrientationProblem | null>(null);
  const [showArrow, setShowArrow] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | null>(null);
  const [feedbackColor, setFeedbackColor] = useState<CubeColor | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const playSound = useSound('ding', settings.muted);
  const playErrorSound = useSound('bzzt', settings.muted);

  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to load the next problem, using the current bottomColor setting
  const loadNextProblem = useCallback(() => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);

    setFeedbackState(null);
    setFeedbackColor(null);
    setShowArrow(false);
    
    // Generate problem using the bottom color from settings
    const problem = generateOrientationProblem(settings.bottomColor);
    setCurrentProblem(problem);

    setTimeout(() => {
        setShowArrow(true);
        setStartTime(performance.now());
    }, 100);

  }, [settings.bottomColor]); // Reload problem if bottomColor changes

  // Load problem on mount and when bottomColor changes
  useEffect(() => {
    loadNextProblem();
    return () => {
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    }
  }, [loadNextProblem]); // Dependency includes bottomColor via loadNextProblem dependency

  // Handle color selection (logic remains largely the same)
  const handleSelectColor = (selectedColor: CubeColor) => {
      if (!currentProblem || feedbackState !== null) return; 
  
      const endTime = performance.now();
      const reactionTime = startTime ? Math.round(endTime - startTime) : 0;
      const isCorrect = checkAnswer(currentProblem, selectedColor);
      setFeedbackColor(selectedColor);
  
      if (isCorrect) {
        playSound();
        setFeedbackState('correct');
        setAppData(prev => {
          const newTimes = [...prev.stats.times, reactionTime].slice(-50);
          const newCurrentStreak = prev.stats.currentStreak + 1;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              total: prev.stats.total + 1,
              correct: prev.stats.correct + 1,
              currentStreak: newCurrentStreak,
              bestStreak: Math.max(prev.stats.bestStreak, newCurrentStreak),
              times: newTimes,
            }
          }
        });
        advanceTimeoutRef.current = setTimeout(loadNextProblem, 250);
      } else {
        playErrorSound();
        setFeedbackState('incorrect');
        setAppData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            total: prev.stats.total + 1,
            currentStreak: 0,
          }
        }));
        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedbackState(null);
          setFeedbackColor(null);
          setStartTime(performance.now());
        }, 300);
      }
    };

  if (!currentProblem) {
    return <div className="flex-grow flex items-center justify-center"><p>Loading...</p></div>;
  }

  // Determine which colors to pass to the Cube component based on the reference faces
  const viewFrontColor = currentProblem.ref1Face === 'F'
    ? currentProblem.ref1Color
    : currentProblem.ref2Face === 'F'
      ? currentProblem.ref2Color
      : currentProblem.ref1Color; // Fallback
  const viewRightColor = currentProblem.ref1Face === 'R'
    ? currentProblem.ref1Color
    : currentProblem.ref2Face === 'R'
      ? currentProblem.ref2Color
      : currentProblem.ref2Color; // Fallback

  return (
    <div className="flex flex-col items-center justify-between flex-grow space-y-6">
       <p className="text-center text-slate-300">
         {/* Use ref face names and colors */} 
         <span className="capitalize">{getFaceName(currentProblem.ref1Face)}</span>: <span className="font-bold capitalize text-slate-100">{currentProblem.ref1Color}</span>, 
         <span className="capitalize">{getFaceName(currentProblem.ref2Face)}</span>: <span className="font-bold capitalize text-slate-100">{currentProblem.ref2Color}</span>. 
         What color is <span className="font-bold text-slate-100">{currentProblem.targetRelation}</span>?
       </p>

      <Cube
        frontFaceColor={viewFrontColor}
        rightFaceColor={viewRightColor}
        targetRelation={currentProblem.targetRelation}
        showArrow={showArrow}
      />
      <AnswerPad
        onSelectColor={handleSelectColor}
        feedbackColor={feedbackColor}
        feedbackState={feedbackState}
      />
    </div>
  );
};

export default DrillPage; 