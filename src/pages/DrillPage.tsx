import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppStorage } from '../hooks/useLocalStorage';
import { generateOrientationProblem, OrientationProblem, checkAnswer } from '../logic/orientation';
import { CubeColor } from '../logic/cubeConstants';
import { useSound } from '../hooks/useSound';
import Cube from '../components/Cube';
import AnswerPad from '../components/AnswerPad';

interface DrillPageProps {
  appData: AppStorage;
  setAppData: (value: AppStorage | ((val: AppStorage) => AppStorage)) => void;
}

const DrillPage: React.FC<DrillPageProps> = ({ appData, setAppData }) => {
  const [currentProblem, setCurrentProblem] = useState<OrientationProblem | null>(null);
  const [showArrow, setShowArrow] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | null>(null);
  const [feedbackColor, setFeedbackColor] = useState<CubeColor | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const playSound = useSound('ding', appData.settings.muted);
  const playErrorSound = useSound('bzzt', appData.settings.muted);

  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to load the next problem
  const loadNextProblem = useCallback(() => {
    // Clear any pending timeouts
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);

    setFeedbackState(null);
    setFeedbackColor(null);
    setShowArrow(false); // Hide arrow initially
    const problem = generateOrientationProblem();
    setCurrentProblem(problem);

    // Show arrow after a short delay for animation
    setTimeout(() => {
        setShowArrow(true);
        setStartTime(performance.now()); // Start timer when arrow is shown
    }, 100); // Small delay before showing arrow

  }, []);

  // Load the first problem on mount
  useEffect(() => {
    loadNextProblem();
    // Clear timeouts on unmount
    return () => {
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    }
  }, [loadNextProblem]);

  // Handle color selection
  const handleSelectColor = (selectedColor: CubeColor) => {
    if (!currentProblem || feedbackState !== null) return; // Don't process if no problem or feedback is active

    const endTime = performance.now();
    const reactionTime = startTime ? Math.round(endTime - startTime) : 0;

    const isCorrect = checkAnswer(currentProblem, selectedColor);

    setFeedbackColor(selectedColor);

    if (isCorrect) {
      playSound();
      setFeedbackState('correct');

      // Update stats
      setAppData(prev => {
        const newTimes = [...prev.stats.times, reactionTime].slice(-50); // Keep last 50
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

      // Auto-advance after short delay
      advanceTimeoutRef.current = setTimeout(loadNextProblem, 250);

    } else {
      playErrorSound();
      setFeedbackState('incorrect');

      // Update stats (only total attempts, reset streak)
      setAppData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          total: prev.stats.total + 1,
          currentStreak: 0, // Reset streak
        }
      }));

      // Flash red and then reset feedback state
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackState(null);
        setFeedbackColor(null);
        // Restart timer as the attempt continues
        setStartTime(performance.now());
      }, 300);
    }
  };

  if (!currentProblem) {
    return <div className="flex-grow flex items-center justify-center"><p>Loading...</p></div>; // Loading state
  }

  return (
    <div className="flex flex-col items-center justify-between flex-grow space-y-6">
      {/* Instruction Text (Optional) */}
       <p className="text-center text-slate-600">
         Front: <span className="font-bold capitalize">{currentProblem.frontFaceColor}</span>, Right: <span className="font-bold capitalize">{currentProblem.rightFaceColor}</span>.
         What color is <span className="font-bold">{currentProblem.targetRelation}</span>?
       </p>

      <Cube
        frontFaceColor={currentProblem.frontFaceColor}
        rightFaceColor={currentProblem.rightFaceColor}
        upFaceColor={currentProblem.upFaceColor}
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