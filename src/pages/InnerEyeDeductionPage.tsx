import React, { useCallback, useRef, useState } from 'react';
import { Settings, Play, RotateCcw, Eye, HelpCircle } from 'lucide-react';
import { AppStorage } from '../hooks/useLocalStorage';
import { useSound } from '../hooks/useSound';
import useInnerEyeStore, { DifficultyLevel } from '../state/innerEyeStore';
import InnerEyeCube, { InnerEyeCubeHandle } from '../components/innerEye/InnerEyeCube';
import InnerEyeColorSelector from '../components/innerEye/InnerEyeColorSelector';
import {
  generateInnerEyeRound,
  InnerEyeRound,
  checkAnswer,
} from '../logic/innerEye/generateInnerEyeRound';
import { CubeColor } from '../logic/cubeConstants';

interface InnerEyeDeductionPageProps {
  appData: AppStorage;
  setAppData: (value: AppStorage | ((val: AppStorage) => AppStorage)) => void;
}

type GamePhase = 'ready' | 'playing' | 'feedback';

const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  1: 'Cross + 3 F2L pairs (easiest)',
  2: 'Cross + 2 F2L pairs',
  3: 'Cross + 1 F2L pair',
  4: 'Cross only (hardest)',
};

const InnerEyeDeductionPage: React.FC<InnerEyeDeductionPageProps> = ({ appData }) => {
  const { recordAttempt, sessionStats } = useInnerEyeStore();
  const playSuccessSound = useSound('ding', appData.settings.muted);
  const playErrorSound = useSound('bzzt', appData.settings.muted);

  // Settings
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [showSettings, setShowSettings] = useState(false);

  // Game state
  const [round, setRound] = useState<InnerEyeRound | null>(null);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  
  // Answer state
  const [selectedColors, setSelectedColors] = useState<CubeColor[]>([]);
  
  // Feedback state
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [correctColors, setCorrectColors] = useState<CubeColor[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [isRevealing, setIsRevealing] = useState<boolean>(false);

  // Cube ref for camera control
  const cubeRef = useRef<InnerEyeCubeHandle>(null);

  // Get bottom color from app settings
  const bottomColor: CubeColor = appData.settings.bottomColor === 'random' 
    ? 'yellow' 
    : appData.settings.bottomColor;

  // Start a new round
  const startRound = useCallback(() => {
    // Clear previous state
    setSelectedColors([]);
    setIsCorrect(false);
    setCorrectColors([]);
    setExplanation('');
    setIsRevealing(false);

    // Generate new round
    const newRound = generateInnerEyeRound(bottomColor, difficulty);
    setRound(newRound);
    setPhase('playing');
    setRoundStartTime(Date.now());

    // Reset camera to default position
    if (cubeRef.current) {
      cubeRef.current.resetCamera();
    }
  }, [bottomColor, difficulty]);

  // Handle color toggle in selection
  const handleColorToggle = useCallback((color: CubeColor) => {
    if (phase !== 'playing') return;

    setSelectedColors(prev => {
      if (prev.includes(color)) {
        // Remove color
        return prev.filter(c => c !== color);
      } else {
        // Add color
        return [...prev, color];
      }
    });
  }, [phase]);

  // Clear selection
  const handleClear = useCallback(() => {
    setSelectedColors([]);
  }, []);

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (!round || phase !== 'playing') return;

    const responseTime = Date.now() - roundStartTime;
    const result = checkAnswer(round, selectedColors);

    // Record the attempt
    recordAttempt(result.isCorrect, difficulty, round.hiddenPieceType, responseTime);

    // Update state
    setIsCorrect(result.isCorrect);
    setCorrectColors(result.correctColors);
    setExplanation(result.explanation || '');
    setIsRevealing(true);
    setPhase('feedback');

    // Play sound
    if (result.isCorrect) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  }, [round, phase, roundStartTime, selectedColors, recordAttempt, difficulty, playSuccessSound, playErrorSound]);

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
    // Reset to ready state when difficulty changes
    if (phase === 'playing') {
      setPhase('ready');
      setRound(null);
    }
  };

  // Get prompt text
  const getPromptText = (): string => {
    if (!round) return '';
    
    const pieceDesc = round.hiddenPieceType === 'edge' 
      ? 'edge piece (2 colors)' 
      : 'corner piece (3 colors)';
    
    return `What colors make up this ${pieceDesc}?`;
  };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-bold text-sky-400">Inner Eye Deduction</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-md text-slate-300 hover:bg-slate-700"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full bg-slate-800 rounded-md p-3 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Game Settings</h3>
          
          {/* Difficulty Selection */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Difficulty Level:</label>
            <div className="flex flex-col gap-1">
              {([1, 2, 3, 4] as DifficultyLevel[]).map(level => (
                <label key={level} className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === level}
                    onChange={() => handleDifficultyChange(level)}
                    className="text-sky-500 focus:ring-sky-500"
                  />
                  Level {level}: {DIFFICULTY_DESCRIPTIONS[level]}
                </label>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
            <p className="flex items-start gap-1">
              <HelpCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                Rotate the cube to observe all visible stickers. Use deduction to figure out 
                the hidden piece's colors based on which colors are already visible elsewhere.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Session Stats Bar */}
      <div className="w-full flex justify-between text-xs text-slate-400 bg-slate-800/50 rounded px-3 py-1">
        <span>Session: {sessionStats.correctTotal}/{sessionStats.attemptsTotal}</span>
        <span>Streak: {sessionStats.currentStreakCorrect}</span>
        <span>Level {difficulty}</span>
      </div>

      {/* Cube Display */}
      <div className="w-full aspect-square bg-slate-950 rounded-lg overflow-hidden relative max-h-[350px]">
        {round ? (
          <InnerEyeCube
            ref={cubeRef}
            cubeState={round.state}
            hiddenPieceId={round.hiddenPieceId}
            isRevealing={isRevealing}
            isIncorrect={!isCorrect && phase === 'feedback'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 flex-col gap-2">
            <Eye size={48} className="text-slate-600" />
            <span>Press Start to begin</span>
          </div>
        )}
        
        {/* Rotation hint */}
        {phase === 'playing' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-800/80 px-3 py-1 rounded text-xs text-slate-400">
            Drag to rotate • Double-click to reset view
          </div>
        )}
      </div>

      {/* Prompt */}
      {phase === 'playing' && round && (
        <div className="w-full px-4 py-3 bg-slate-800 rounded-md">
          <div className="text-slate-200 font-semibold text-center flex items-center justify-center gap-2">
            <Eye size={20} className="text-sky-400" />
            {getPromptText()}
          </div>
          <div className="text-xs text-slate-400 mt-1 text-center">
            Hidden piece: {round.hiddenPieceId}
          </div>
        </div>
      )}

      {/* Controls based on phase */}
      {phase === 'ready' && (
        <button
          onClick={startRound}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-slate-900 rounded-md hover:bg-sky-400 font-semibold"
        >
          <Play size={20} />
          Start Round
        </button>
      )}

      {phase === 'playing' && round && (
        <InnerEyeColorSelector
          pieceType={round.hiddenPieceType}
          selectedColors={selectedColors}
          onColorToggle={handleColorToggle}
          onSubmit={handleSubmit}
          onClear={handleClear}
          disabled={false}
        />
      )}

      {/* Feedback */}
      {phase === 'feedback' && round && (
        <div className="w-full space-y-3">
          <InnerEyeColorSelector
            pieceType={round.hiddenPieceType}
            selectedColors={selectedColors}
            onColorToggle={() => {}}
            onSubmit={() => {}}
            onClear={() => {}}
            disabled={true}
            feedbackColors={correctColors}
            isCorrect={isCorrect}
          />

          {/* Explanation for incorrect answer */}
          {!isCorrect && explanation && (
            <div className="w-full px-4 py-2 bg-slate-800 rounded-md">
              <div className="text-sm text-slate-300">{explanation}</div>
            </div>
          )}
          
          <button
            onClick={startRound}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-slate-900 rounded-md hover:bg-sky-400 font-semibold"
          >
            <RotateCcw size={20} />
            Next Round
          </button>
        </div>
      )}
    </div>
  );
};

export default InnerEyeDeductionPage;
