import React from 'react';
import { CubeColor, COLORS } from '../../logic/cubeConstants';
import { CUBE_COLOR_MAP } from '../f2l/cubeColorMap';

interface ColorSelectorProps {
  onColorSelect: (color: CubeColor) => void;
  disabled?: boolean;
  highlightedColor?: CubeColor | null; // For showing correct answer
  selectedColor?: CubeColor | null;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  onColorSelect,
  disabled = false,
  highlightedColor = null,
  selectedColor = null,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
      {COLORS.map((color) => {
        const isHighlighted = highlightedColor === color;
        const isSelected = selectedColor === color;
        const bgColor = CUBE_COLOR_MAP[color];
        
        // Determine text color based on background brightness
        const textColor = color === 'white' || color === 'yellow' ? 'text-slate-900' : 'text-white';
        
        // Ring styles for different states
        let ringStyle = '';
        if (isHighlighted) {
          ringStyle = 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-800';
        } else if (isSelected) {
          ringStyle = 'ring-4 ring-purple-400 ring-offset-2 ring-offset-slate-800';
        }
        
        return (
          <button
            key={color}
            onClick={() => !disabled && onColorSelect(color)}
            disabled={disabled}
            className={`
              py-3 px-4 rounded-lg font-semibold capitalize transition-all
              ${textColor}
              ${ringStyle}
              ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            `}
            style={{ backgroundColor: bgColor }}
          >
            {color}
          </button>
        );
      })}
    </div>
  );
};

export default ColorSelector;
