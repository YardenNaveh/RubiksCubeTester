import React from 'react';
import { CubeColor, COLORS } from '../logic/cubeConstants';

interface AnswerPadProps {
  onSelectColor: (color: CubeColor) => void;
  feedbackColor: CubeColor | null; // Color to flash for feedback
  feedbackState: 'correct' | 'incorrect' | null;
}

// Tailwind color mapping
const colorClasses: Record<CubeColor, { bg: string; text: string; ring: string }> = {
  white: { bg: 'bg-gray-100', text: 'text-black', ring: 'focus:ring-gray-400' },
  yellow: { bg: 'bg-yellow-400', text: 'text-black', ring: 'focus:ring-yellow-600' },
  blue: { bg: 'bg-blue-600', text: 'text-white', ring: 'focus:ring-blue-800' },
  green: { bg: 'bg-green-600', text: 'text-white', ring: 'focus:ring-green-800' },
  red: { bg: 'bg-red-600', text: 'text-white', ring: 'focus:ring-red-800' },
  orange: { bg: 'bg-orange-500', text: 'text-white', ring: 'focus:ring-orange-700' },
};

const feedbackClasses = {
    correct: 'bg-green-500 ring-4 ring-green-300',
    incorrect: 'bg-red-500 ring-4 ring-red-300',
};

const AnswerPad: React.FC<AnswerPadProps> = ({ onSelectColor, feedbackColor, feedbackState }) => {
  return (
    <div className="w-full grid grid-cols-3 gap-3 p-1">
      {COLORS.map((color) => {
        const { bg, text, ring } = colorClasses[color];
        const isFeedbackTarget = feedbackColor === color && feedbackState !== null;
        const currentFeedbackClass = isFeedbackTarget ? feedbackClasses[feedbackState!] : '';

        return (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className={`
              min-h-[64px] rounded-lg shadow-md 
              flex items-center justify-center 
              font-medium text-lg capitalize transition-all duration-150 ease-in-out 
              focus:outline-none focus:ring-2 ${ring} focus:ring-opacity-75 
              ${isFeedbackTarget ? currentFeedbackClass : `${bg} ${text} hover:opacity-90 active:scale-95`}
            `}
            style={{
                // Add a slight delay before reverting background if feedback is active
                transition: isFeedbackTarget ? 'background-color 0s linear, transform 0.1s ease-out' : 'background-color 0.15s ease-in-out, transform 0.1s ease-out',
            }}
          >
            {color}
          </button>
        );
      })}
    </div>
  );
};

export default AnswerPad; 