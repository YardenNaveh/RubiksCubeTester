import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CubeColor, COLORS, COLOR_PAIRS } from '../logic/cubeConstants';
import EdgeKataCube from '../components/edgeKata/EdgeKataCube';
import { EdgeKataRound, generateEdgeKataRound } from '../logic/edgeKata/generateEdgeKataRound';
import { computeOrientationColors, isValidBottomFront } from '../logic/edgeKata/orientation';
import useEdgeKataStore from '../state/edgeKataStore';
import { isGoodEdge } from '../logic/edgeKata/isGoodEdge';
import { useSound } from '../hooks/useSound';

type ColorSetting = CubeColor | 'random';

const colorOptions: ColorSetting[] = ['random', ...COLORS];

const EdgeKataPage: React.FC<{ appMuted: boolean }> = ({ appMuted }) => {
  const { recordAttempt } = useEdgeKataStore();
  const playSuccessSound = useSound('ding', appMuted);
  const playErrorSound = useSound('bzzt', appMuted);

  const [bottomSetting, setBottomSetting] = useState<ColorSetting>('yellow');
  const [frontSetting, setFrontSetting] = useState<ColorSetting>('red');
  const [randomizeEachRound, setRandomizeEachRound] = useState(false);
  const [scrambleMoves, setScrambleMoves] = useState(22);

  const [round, setRound] = useState<EdgeKataRound | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedback, setFeedback] = useState<string>('');

  const currentOrientationText = useMemo(() => {
    if (!round) return '';
    return `Bottom: ${round.bottom}, Front: ${round.front}`;
  }, [round]);

  const startRound = useCallback(() => {
    const next = generateEdgeKataRound({
      bottom: bottomSetting,
      front: frontSetting,
      randomizeEachRound,
      scrambleMoves,
    });
    setRound(next);
    setAnswerState('idle');
    setFeedback('');
  }, [bottomSetting, frontSetting, randomizeEachRound, scrambleMoves]);

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

    setTimeout(() => startRound(), 650);
  };

  const isInvalidCombo = useMemo(() => {
    if (bottomSetting === 'random' || frontSetting === 'random') return false;
    return !isValidBottomFront(bottomSetting, frontSetting);
  }, [bottomSetting, frontSetting]);

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <h1 className="text-xl font-bold text-sky-400">Edge Kata</h1>

      <div className="w-full bg-slate-800 rounded-md p-3 space-y-2">
        <div className="text-sm text-slate-300 font-semibold">Orientation</div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Bottom (D)</label>
            <select
              value={bottomSetting}
              onChange={(e) => setBottomSetting(e.target.value as ColorSetting)}
              className="bg-slate-700 text-slate-100 text-sm rounded p-2 border border-slate-600 capitalize"
            >
              {colorOptions.map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Front (F)</label>
            <select
              value={frontSetting}
              onChange={(e) => setFrontSetting(e.target.value as ColorSetting)}
              className="bg-slate-700 text-slate-100 text-sm rounded p-2 border border-slate-600 capitalize"
            >
              {colorOptions.map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-300 flex items-center gap-2">
            <input
              type="checkbox"
              checked={randomizeEachRound}
              onChange={(e) => setRandomizeEachRound(e.target.checked)}
            />
            Randomize each round
          </label>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Scramble</label>
            <input
              type="number"
              min={0}
              max={60}
              value={scrambleMoves}
              onChange={(e) => setScrambleMoves(Math.max(0, Math.min(60, Number(e.target.value))))}
              className="w-20 bg-slate-700 text-slate-100 text-sm rounded p-1 border border-slate-600"
            />
          </div>
        </div>

        {isInvalidCombo && (
          <div className="text-xs text-red-300">
            Invalid orientation: Front cannot equal Bottom or be opposite (e.g. {bottomSetting} vs {bottomSetting !== 'random' ? COLOR_PAIRS[bottomSetting] : ''}).
          </div>
        )}

        <div className="text-xs text-slate-400">
          {round ? currentOrientationText : 'Loading...'}
        </div>
      </div>

      <div className="w-4/5 max-h-[300px] aspect-square bg-slate-950 rounded-lg overflow-hidden relative">
        {round && <EdgeKataCube cubeState={round.state} highlightedEdgeId={round.highlightedEdgeId} />}
      </div>

      <div className="w-full px-4 py-3 bg-slate-800 rounded-md">
        <div className="text-slate-200 font-semibold">Good edge or bad edge?</div>
        <div className="text-xs text-slate-400 mt-1">Answer based only on orientation category, not location.</div>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={() => handleAnswer(true)}
          disabled={!round || answerState !== 'idle'}
          className="flex-1 px-4 py-3 text-slate-900 bg-sky-400 rounded-md hover:bg-sky-300 disabled:opacity-50"
        >
          Good
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={!round || answerState !== 'idle'}
          className="flex-1 px-4 py-3 text-slate-100 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50"
        >
          Bad
        </button>
      </div>

      {answerState !== 'idle' && (
        <div className={`w-full px-4 py-3 rounded-md ${answerState === 'correct' ? 'bg-emerald-900/40' : 'bg-red-900/40'}`}>
          <div className="font-semibold">
            {answerState === 'correct' ? 'Correct' : 'Incorrect'}
          </div>
          <div className="text-sm text-slate-200 mt-1">{feedback}</div>
        </div>
      )}
    </div>
  );
};

export default EdgeKataPage;

