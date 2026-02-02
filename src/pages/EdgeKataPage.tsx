import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { ADJACENT_FACES, CubeColor, COLOR_PAIRS } from '../logic/cubeConstants';
import EdgeKataCube, { EdgeKataCubeHandle } from '../components/edgeKata/EdgeKataCube';
import { EdgeKataRound, generateEdgeKataRound } from '../logic/edgeKata/generateEdgeKataRound';
import { computeOrientationColors, isValidBottomFront } from '../logic/edgeKata/orientation';
import useEdgeKataStore from '../state/edgeKataStore';
import { isGoodEdge } from '../logic/edgeKata/isGoodEdge';
import { useSound } from '../hooks/useSound';
import { AppStorage, BottomColorSetting } from '../hooks/useLocalStorage';

type ColorSetting = CubeColor | 'random';

interface EdgeKataPageProps {
  appData: AppStorage;
  setAppData: (value: AppStorage | ((val: AppStorage) => AppStorage)) => void;
}

const EdgeKataPage: React.FC<EdgeKataPageProps> = ({ appData, setAppData }) => {
  const { recordAttempt } = useEdgeKataStore();
  const playSuccessSound = useSound('ding', appData.settings.muted);
  const playErrorSound = useSound('bzzt', appData.settings.muted);
  const cubeRef = useRef<EdgeKataCubeHandle>(null);

  // Bottom color comes from global header setting
  const bottomSetting: BottomColorSetting = appData.settings.bottomColor;
  
  // Front color and auto-continue are persisted in settings
  const frontSetting = appData.settings.edgeKataFrontColor;
  const autoContinue = appData.settings.edgeKataAutoContinue;

  const setFrontSetting = (value: ColorSetting) => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, edgeKataFrontColor: value },
    }));
  };

  const setAutoContinue = (value: boolean) => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, edgeKataAutoContinue: value },
    }));
  };

  const [round, setRound] = useState<EdgeKataRound | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedback, setFeedback] = useState<string>('');

  // Compute valid front color options based on bottom selection
  const frontColorOptions: ColorSetting[] = useMemo(() => {
    if (bottomSetting === 'random') {
      // If bottom is random, front must also be random
      return ['random'];
    }
    // Return 'random' plus the adjacent colors for this bottom
    return ['random', ...ADJACENT_FACES[bottomSetting]];
  }, [bottomSetting]);

  // When bottom changes, ensure front is still valid
  useEffect(() => {
    if (bottomSetting === 'random') {
      // Force front to random when bottom is random
      setFrontSetting('random');
    } else if (frontSetting !== 'random') {
      // Check if current front is still valid for the new bottom
      const validFronts = ADJACENT_FACES[bottomSetting];
      if (!validFronts.includes(frontSetting as CubeColor)) {
        // Current selection is no longer valid, reset to random
        setFrontSetting('random');
      }
    }
  }, [bottomSetting, frontSetting]);

  const currentOrientationText = useMemo(() => {
    if (!round) return '';
    return `Bottom: ${round.bottom}, Front: ${round.front}`;
  }, [round]);

  const startRound = useCallback(() => {
    const next = generateEdgeKataRound({
      bottom: bottomSetting,
      front: frontSetting,
      randomizeEachRound: false,
      scrambleMoves: 22,
    });
    setRound(next);
    setAnswerState('idle');
    setFeedback('');
  }, [bottomSetting, frontSetting]);

  useEffect(() => {
    startRound();
  }, [startRound]);

  const handleAnswer = (guessGood: boolean) => {
    if (!round || answerState !== 'idle') return;

    const orientation = computeOrientationColors(round.bottom, round.front);
    const res = isGoodEdge(round.state[round.highlightedEdgeId], orientation);
    const isCorrect = guessGood === res.isGood;

    recordAttempt(isCorrect, res.kind);
    if (isCorrect) playSuccessSound(); else playErrorSound();

    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    setFeedback(res.explanation);

    if (autoContinue) {
      setTimeout(() => startRound(), 650);
    }
  };

  const handleContinue = () => {
    startRound();
  };

  const handleOrientCube = () => {
    cubeRef.current?.resetCamera();
  };

  const isInvalidCombo = useMemo(() => {
    if (bottomSetting === 'random' || frontSetting === 'random') return false;
    return !isValidBottomFront(bottomSetting, frontSetting);
  }, [bottomSetting, frontSetting]);

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h1 className="text-xl font-bold text-sky-400">Edge Kata</h1>

      <div className="w-full bg-slate-800 rounded-md p-2 space-y-1">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Front:</label>
          <select
            value={frontSetting}
            onChange={(e) => setFrontSetting(e.target.value as ColorSetting)}
            disabled={bottomSetting === 'random'}
            className={`bg-slate-700 text-slate-100 text-xs rounded px-2 py-1 border border-slate-600 capitalize ${
              bottomSetting === 'random' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {frontColorOptions.map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
          <button
            onClick={handleOrientCube}
            className="p-1 text-slate-300 bg-slate-600 rounded hover:bg-slate-500"
            title="Reset to home position"
          >
            <Home size={16} />
          </button>
          <span className="text-xs text-slate-500 ml-auto">
            {round ? currentOrientationText : ''}
          </span>
        </div>

        {isInvalidCombo && (
          <div className="text-xs text-red-300">
            Invalid: Front ≠ Bottom or opposite ({bottomSetting} vs {bottomSetting !== 'random' ? COLOR_PAIRS[bottomSetting] : ''})
          </div>
        )}
      </div>

      <div className="w-4/5 max-h-[300px] aspect-square bg-slate-950 rounded-lg overflow-hidden relative">
        {round && <EdgeKataCube ref={cubeRef} cubeState={round.state} highlightedEdgeId={round.highlightedEdgeId} />}
      </div>

      <div className="w-full px-4 py-3 bg-slate-800 rounded-md">
        <div className="text-slate-200 font-semibold">Good edge or bad edge?</div>
        <div className="text-xs text-slate-400 mt-1">Answer based only on orientation category, not location.</div>
      </div>

      {answerState === 'idle' ? (
        <div className="w-full space-y-3">
          <div className="flex gap-3 w-full">
            <button
              onClick={() => handleAnswer(true)}
              disabled={!round}
              className="flex-1 px-4 py-3 text-slate-900 bg-sky-400 rounded-md hover:bg-sky-300 disabled:opacity-50"
            >
              Good
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={!round}
              className="flex-1 px-4 py-3 text-slate-100 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50"
            >
              Bad
            </button>
          </div>
          
          {/* Auto-continue toggle */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-400">Skip explanation & auto-advance</span>
            <button
              onClick={() => setAutoContinue(!autoContinue)}
              className={`relative w-10 h-5 rounded-full transition-colors ${autoContinue ? 'bg-sky-500' : 'bg-slate-600'}`}
            >
              <span 
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoContinue ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-3">
          <div className={`w-full px-4 py-3 rounded-md ${answerState === 'correct' ? 'bg-emerald-900/40' : 'bg-red-900/40'}`}>
            <div className="font-semibold">
              {answerState === 'correct' ? 'Correct ✓' : 'Incorrect ✗'}
            </div>
            <div className="text-sm text-slate-200 mt-1">{feedback}</div>
          </div>
          {!autoContinue && (
            <button
              onClick={handleContinue}
              className="w-full px-4 py-3 text-slate-900 bg-sky-400 rounded-md hover:bg-sky-300"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EdgeKataPage;

