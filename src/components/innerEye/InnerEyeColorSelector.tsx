import React from 'react';
import { CubeColor, COLORS, COLOR_PAIRS } from '../../logic/cubeConstants';
import { CUBE_COLOR_MAP } from '../f2l/cubeColorMap';
import { PieceType } from '../../state/innerEyeStore';
import { X } from 'lucide-react';

interface InnerEyeColorSelectorProps {
  pieceType: PieceType;
  selectedColors: CubeColor[];
  onColorToggle: (color: CubeColor) => void;
  onSubmit: () => void;
  onClear: () => void;
  disabled: boolean;
  feedbackColors?: CubeColor[]; // Show correct colors during feedback
  isCorrect?: boolean;
}

/**
 * Check if adding a color would create an invalid combination
 * (colors that can't exist together on a piece)
 */
function wouldBeInvalid(currentColors: CubeColor[], newColor: CubeColor): boolean {
  for (const color of currentColors) {
    if (COLOR_PAIRS[color] === newColor) {
      return true; // Opposite colors can't be on the same piece
    }
  }
  return false;
}

const InnerEyeColorSelector: React.FC<InnerEyeColorSelectorProps> = ({
  pieceType,
  selectedColors,
  onColorToggle,
  onSubmit,
  onClear,
  disabled,
  feedbackColors,
  isCorrect,
}) => {
  const requiredColors = pieceType === 'edge' ? 2 : 3;
  const canSubmit = selectedColors.length === requiredColors;
  
  // During feedback, show the correct colors highlighted
  const showFeedback = feedbackColors && feedbackColors.length > 0;
  const feedbackSet = new Set(feedbackColors || []);

  return (
    <div className="w-full space-y-3">
      {/* Instruction */}
      <div className="text-center text-sm text-slate-400">
        Select {requiredColors} colors ({selectedColors.length}/{requiredColors})
      </div>

      {/* Color buttons grid */}
      <div className="grid grid-cols-3 gap-2">
        {COLORS.map(color => {
          const isSelected = selectedColors.includes(color);
          const isDisabled = disabled || 
            (!isSelected && selectedColors.length >= requiredColors) ||
            (!isSelected && wouldBeInvalid(selectedColors, color));
          const isInFeedback = feedbackSet.has(color);
          
          // Determine button style based on state
          let borderStyle = 'border-2 border-transparent';
          if (showFeedback) {
            if (isInFeedback && isSelected) {
              borderStyle = 'border-4 border-emerald-500'; // Correct selection
            } else if (isInFeedback && !isSelected) {
              borderStyle = 'border-4 border-yellow-500'; // Should have selected
            } else if (isSelected && !isInFeedback) {
              borderStyle = 'border-4 border-red-500'; // Wrong selection
            }
          } else if (isSelected) {
            borderStyle = 'border-4 border-sky-400';
          }

          return (
            <button
              key={color}
              onClick={() => !disabled && onColorToggle(color)}
              disabled={isDisabled}
              className={`
                relative h-14 rounded-lg font-semibold text-sm capitalize
                transition-all duration-150
                ${borderStyle}
                ${isDisabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected ? 'ring-2 ring-white/30' : ''}
              `}
              style={{
                backgroundColor: CUBE_COLOR_MAP[color],
                color: color === 'white' || color === 'yellow' ? '#1a1a1a' : '#ffffff',
              }}
            >
              {color}
              {isSelected && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {selectedColors.indexOf(color) + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Warning about invalid combinations */}
      {selectedColors.length > 0 && selectedColors.length < requiredColors && (
        <div className="text-xs text-slate-500 text-center">
          Opposite colors (e.g., white/yellow) cannot be on the same piece
        </div>
      )}

      {/* Selected colors display */}
      {selectedColors.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="text-sm text-slate-400">Selected:</span>
          <div className="flex gap-1">
            {selectedColors.map((color, idx) => (
              <div
                key={`${color}-${idx}`}
                className="w-8 h-8 rounded border-2 border-slate-600"
                style={{ backgroundColor: CUBE_COLOR_MAP[color] }}
                title={color}
              />
            ))}
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="ml-2 p-1 rounded hover:bg-slate-700 text-slate-400"
              title="Clear selection"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || disabled}
          className={`
            flex-1 py-3 rounded-lg font-semibold transition-all
            ${canSubmit && !disabled 
              ? 'bg-sky-500 text-slate-900 hover:bg-sky-400' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
          `}
        >
          {canSubmit ? 'Submit Answer' : `Select ${requiredColors - selectedColors.length} more`}
        </button>
      </div>

      {/* Feedback display */}
      {showFeedback && (
        <div className={`text-center py-2 px-3 rounded-lg ${isCorrect ? 'bg-emerald-900/40' : 'bg-red-900/40'}`}>
          <div className="font-semibold">
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </div>
          {!isCorrect && feedbackColors && (
            <div className="text-sm mt-1 text-slate-300">
              Correct colors: {feedbackColors.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InnerEyeColorSelector;
