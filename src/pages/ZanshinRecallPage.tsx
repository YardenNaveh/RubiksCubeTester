import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Settings, Play, RotateCcw } from 'lucide-react';
import { AppStorage, ZanshinQuestionType } from '../hooks/useLocalStorage';
import { useSound } from '../hooks/useSound';
import useZanshinRecallStore from '../state/zanshinRecallStore';
import ZanshinRecallCube from '../components/zanshinRecall/ZanshinRecallCube';
import ColorSelector from '../components/zanshinRecall/ColorSelector';
import {
  generateZanshinRound,
  ZanshinRound,
  StickerId,
  checkPieceRecallAnswer,
  checkStickerSetRecallAnswer,
  checkSingleStickerRecallAnswer,
} from '../logic/zanshinRecall/generateZanshinRound';
import { CubeColor } from '../logic/cubeConstants';
import { DisplayMode } from '../components/zanshinRecall/ZanshinCubie';

interface ZanshinRecallPageProps {
  appData: AppStorage;
  setAppData: (value: AppStorage | ((val: AppStorage) => AppStorage)) => void;
}

type GamePhase = 'ready' | 'flash' | 'recall' | 'feedback';

const ZanshinRecallPage: React.FC<ZanshinRecallPageProps> = ({ appData, setAppData }) => {
  const { recordAttempt, sessionStats } = useZanshinRecallStore();
  const playSuccessSound = useSound('ding', appData.settings.muted);
  const playErrorSound = useSound('bzzt', appData.settings.muted);

  // Settings from persisted app storage
  const flashDurationMs = appData.settings.zanshinFlashDurationMs;
  const enabledTypes = appData.settings.zanshinEnabledTypes;
  const onlyVisibleStickers = appData.settings.zanshinOnlyVisibleStickers;

  const setFlashDurationMs = (value: number) => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, zanshinFlashDurationMs: value },
    }));
  };

  const setEnabledTypes = (value: ZanshinQuestionType[]) => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, zanshinEnabledTypes: value },
    }));
  };

  const setOnlyVisibleStickers = (value: boolean) => {
    setAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, zanshinOnlyVisibleStickers: value },
    }));
  };

  const [showSettings, setShowSettings] = useState(false);

  // Game state
  const [round, setRound] = useState<ZanshinRound | null>(null);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  
  // Selection state
  const [selectedStickerIds, setSelectedStickerIds] = useState<Set<StickerId>>(new Set());
  const [selectedCubieId, setSelectedCubieId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<CubeColor | null>(null);

  // Feedback state
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [highlightCorrect, setHighlightCorrect] = useState<Set<StickerId>>(new Set());
  const [highlightIncorrect, setHighlightIncorrect] = useState<Set<StickerId>>(new Set());

  // Timer ref for flash phase
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  // Start a new round
  const startRound = useCallback(() => {
    if (enabledTypes.length === 0) {
      alert('Please enable at least one question type in settings.');
      return;
    }

    // Clear previous state
    setSelectedStickerIds(new Set());
    setSelectedCubieId(null);
    setSelectedColor(null);
    setHighlightCorrect(new Set());
    setHighlightIncorrect(new Set());
    setFeedbackMessage('');

    // Generate new round
    const newRound = generateZanshinRound({
      enabledTypes: enabledTypes,
      flashDurationMs: flashDurationMs,
      onlyVisibleStickers: onlyVisibleStickers,
      bottomColor: appData.settings.bottomColor,
    });
    
    setRound(newRound);
    setPhase('flash');

    // Start flash timer
    flashTimerRef.current = setTimeout(() => {
      setPhase('recall');
      setRoundStartTime(Date.now());
    }, flashDurationMs);
  }, [enabledTypes, flashDurationMs, onlyVisibleStickers, appData.settings.bottomColor]);

  // Handle sticker click (for sticker set recall)
  const handleStickerClick = useCallback((stickerId: StickerId) => {
    if (phase !== 'recall' || !round || round.type !== 'stickerSetRecall') return;

    setSelectedStickerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stickerId)) {
        newSet.delete(stickerId);
      } else {
        newSet.add(stickerId);
      }
      return newSet;
    });
  }, [phase, round]);

  // Handle cubie click (for piece recall)
  const handleCubieClick = useCallback((cubieId: string, _type: 'edge' | 'corner' | 'center') => {
    if (phase !== 'recall' || !round || round.type !== 'pieceRecall') return;
    
    // For piece recall, clicking selects and immediately submits
    const responseTime = Date.now() - roundStartTime;
    const correct = checkPieceRecallAnswer(round, cubieId);
    
    recordAttempt(correct, 'pieceRecall', responseTime);
    
    if (correct) {
      playSuccessSound();
      setIsCorrect(true);
      setFeedbackMessage('Correct!');
    } else {
      playErrorSound();
      setIsCorrect(false);
      setFeedbackMessage(`Incorrect. The ${round.targetPieceDescription} was elsewhere.`);
    }
    
    setSelectedCubieId(cubieId);
    setPhase('feedback');
  }, [phase, round, roundStartTime, recordAttempt, playSuccessSound, playErrorSound]);

  // Handle color selection (for single sticker recall)
  const handleColorSelect = useCallback((color: CubeColor) => {
    if (phase !== 'recall' || !round || round.type !== 'singleStickerRecall') return;

    const responseTime = Date.now() - roundStartTime;
    const correct = checkSingleStickerRecallAnswer(round, color);
    
    recordAttempt(correct, 'singleStickerRecall', responseTime);
    setSelectedColor(color);
    
    if (correct) {
      playSuccessSound();
      setIsCorrect(true);
      setFeedbackMessage('Correct!');
    } else {
      playErrorSound();
      setIsCorrect(false);
      setFeedbackMessage(`Incorrect. The sticker was ${round.hiddenStickerColor}.`);
    }
    
    setPhase('feedback');
  }, [phase, round, roundStartTime, recordAttempt, playSuccessSound, playErrorSound]);

  // Handle submit for sticker set recall
  const handleStickerSetSubmit = useCallback(() => {
    if (phase !== 'recall' || !round || round.type !== 'stickerSetRecall') return;

    const responseTime = Date.now() - roundStartTime;
    const result = checkStickerSetRecallAnswer(round, selectedStickerIds);
    
    recordAttempt(result.isCorrect, 'stickerSetRecall', responseTime);
    
    // Calculate highlights
    const correctHighlights = new Set<StickerId>();
    const incorrectHighlights = new Set<StickerId>();
    
    // Correct = selected AND in target
    for (const id of selectedStickerIds) {
      if (round.targetStickerIds.has(id)) {
        correctHighlights.add(id);
      } else {
        incorrectHighlights.add(id); // Extra selections
      }
    }
    
    // Missed = in target but not selected
    for (const id of round.targetStickerIds) {
      if (!selectedStickerIds.has(id)) {
        incorrectHighlights.add(id); // Missed
      }
    }
    
    setHighlightCorrect(correctHighlights);
    setHighlightIncorrect(incorrectHighlights);
    
    if (result.isCorrect) {
      playSuccessSound();
      setIsCorrect(true);
      setFeedbackMessage('Correct!');
    } else {
      playErrorSound();
      setIsCorrect(false);
      let msg = 'Incorrect.';
      if (result.missed > 0) msg += ` Missed ${result.missed} sticker${result.missed > 1 ? 's' : ''}.`;
      if (result.extra > 0) msg += ` ${result.extra} extra selection${result.extra > 1 ? 's' : ''}.`;
      setFeedbackMessage(msg);
    }
    
    setPhase('feedback');
  }, [phase, round, selectedStickerIds, roundStartTime, recordAttempt, playSuccessSound, playErrorSound]);

  // Get display mode based on phase and round type
  const getDisplayMode = (): DisplayMode => {
    if (phase === 'flash') return 'normal';
    if (phase === 'ready') return 'normal';
    
    if (round?.type === 'singleStickerRecall' && (phase === 'recall' || phase === 'feedback')) {
      return 'singleHidden';
    }
    
    // For piece recall and sticker set recall, hide all stickers during recall
    if (phase === 'recall' && round?.type !== 'singleStickerRecall') {
      return 'allHidden';
    }
    
    // Feedback shows normal colors (so user can see the answer)
    return 'normal';
  };

  // Get hidden sticker IDs for single sticker recall
  const getHiddenStickerIds = (): Set<StickerId> => {
    if (round?.type === 'singleStickerRecall' && (phase === 'recall' || (phase === 'feedback' && !isCorrect))) {
      return new Set([round.hiddenStickerId]);
    }
    return new Set();
  };

  // Get selection mode based on round type
  const getSelectionMode = (): 'sticker' | 'cubie' | 'none' => {
    if (phase !== 'recall') return 'none';
    if (!round) return 'none';
    
    if (round.type === 'pieceRecall') return 'cubie';
    if (round.type === 'stickerSetRecall') return 'sticker';
    return 'none'; // Single sticker uses color buttons, not cube clicks
  };

  // Get prompt text for the current round
  const getPromptText = (): string => {
    if (!round) return '';
    
    switch (round.type) {
      case 'pieceRecall':
        return `Where is the ${round.targetPieceDescription}?`;
      case 'stickerSetRecall':
        return `Click all the ${round.targetColor} stickers.`;
      case 'singleStickerRecall':
        return 'What color was this sticker?';
    }
  };

  // Toggle a question type
  const toggleQuestionType = (type: ZanshinQuestionType) => {
    const enabled = enabledTypes.includes(type);
    if (enabled) {
      // Don't allow disabling if it's the last one
      if (enabledTypes.length === 1) return;
      setEnabledTypes(enabledTypes.filter(t => t !== type));
    } else {
      setEnabledTypes([...enabledTypes, type]);
    }
  };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-bold text-sky-400">Zanshin Recall</h1>
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
          
          {/* Flash Duration */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">Flash Duration: {(flashDurationMs / 1000).toFixed(1)}s</label>
            <input
              type="range"
              min="700"
              max="10000"
              step="100"
              value={flashDurationMs}
              onChange={(e) => setFlashDurationMs(Number(e.target.value))}
              className="w-32 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Question Types */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Question Types:</label>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={enabledTypes.includes('pieceRecall')}
                  onChange={() => toggleQuestionType('pieceRecall')}
                  className="rounded text-sky-500 focus:ring-sky-500"
                />
                Piece Recall
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={enabledTypes.includes('stickerSetRecall')}
                  onChange={() => toggleQuestionType('stickerSetRecall')}
                  className="rounded text-sky-500 focus:ring-sky-500"
                />
                Sticker Set Recall
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={enabledTypes.includes('singleStickerRecall')}
                  onChange={() => toggleQuestionType('singleStickerRecall')}
                  className="rounded text-sky-500 focus:ring-sky-500"
                />
                Single Sticker Color Recall
              </label>
            </div>
          </div>

          {/* Only Visible Stickers */}
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={onlyVisibleStickers}
              onChange={(e) => setOnlyVisibleStickers(e.target.checked)}
              className="rounded text-sky-500 focus:ring-sky-500"
            />
            Only choose from visible stickers
          </label>
        </div>
      )}

      {/* Session Stats Bar */}
      <div className="w-full flex justify-between text-xs text-slate-400 bg-slate-800/50 rounded px-3 py-1">
        <span>Session: {sessionStats.correctTotal}/{sessionStats.attemptsTotal}</span>
        <span>Streak: {sessionStats.currentStreakCorrect}</span>
      </div>

      {/* Cube Display */}
      <div className="w-4/5 max-h-[300px] aspect-square bg-slate-950 rounded-lg overflow-hidden relative">
        {round ? (
          <ZanshinRecallCube
            cubeState={round.state}
            displayMode={getDisplayMode()}
            hiddenStickerIds={getHiddenStickerIds()}
            selectedStickerIds={selectedStickerIds}
            selectedCubieId={selectedCubieId}
            onStickerClick={handleStickerClick}
            onCubieClick={handleCubieClick}
            selectionMode={getSelectionMode()}
            highlightCorrect={highlightCorrect}
            highlightIncorrect={highlightIncorrect}
            enableRotation={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            Press Start to begin
          </div>
        )}
        
        {/* Flash phase overlay */}
        {phase === 'flash' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-800/80 px-3 py-1 rounded text-sm text-sky-400">
            Memorize...
          </div>
        )}
      </div>

      {/* Prompt */}
      {phase === 'recall' && round && (
        <div className="w-full px-4 py-3 bg-slate-800 rounded-md">
          <div className="text-slate-200 font-semibold text-center">{getPromptText()}</div>
          {round.type === 'stickerSetRecall' && (
            <div className="text-xs text-slate-400 mt-1 text-center">
              {selectedStickerIds.size} sticker{selectedStickerIds.size !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}

      {/* Controls based on phase and round type */}
      {phase === 'ready' && (
        <button
          onClick={startRound}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-slate-900 rounded-md hover:bg-sky-400 font-semibold"
        >
          <Play size={20} />
          Start Round
        </button>
      )}

      {phase === 'recall' && round?.type === 'singleStickerRecall' && (
        <ColorSelector
          onColorSelect={handleColorSelect}
          disabled={false}
        />
      )}

      {phase === 'recall' && round?.type === 'stickerSetRecall' && (
        <button
          onClick={handleStickerSetSubmit}
          className="w-full px-4 py-3 bg-sky-500 text-slate-900 rounded-md hover:bg-sky-400 font-semibold"
        >
          Submit Selection
        </button>
      )}

      {phase === 'recall' && round?.type === 'pieceRecall' && (
        <div className="text-sm text-slate-400 text-center">
          Click on the cube to select the piece
        </div>
      )}

      {/* Feedback */}
      {phase === 'feedback' && (
        <div className="w-full space-y-3">
          <div className={`w-full px-4 py-3 rounded-md ${isCorrect ? 'bg-emerald-900/40' : 'bg-red-900/40'}`}>
            <div className="font-semibold text-center">
              {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
            </div>
            <div className="text-sm text-slate-200 mt-1 text-center">{feedbackMessage}</div>
          </div>
          
          {/* Show correct answer for single sticker recall */}
          {round?.type === 'singleStickerRecall' && !isCorrect && (
            <ColorSelector
              onColorSelect={() => {}}
              disabled={true}
              highlightedColor={round.hiddenStickerColor}
              selectedColor={selectedColor}
            />
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

export default ZanshinRecallPage;
