import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react'; // Using lucide-react for icons
import { CubeColor } from '../logic/cubeConstants'; // Import CubeColor

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  currentBottomColor: CubeColor;
  onBottomColorChange: (color: CubeColor) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isMuted, 
  onToggleMute,
  currentBottomColor,
  onBottomColorChange
 }) => {
  return (
    <header className="w-full bg-slate-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-10 gap-2">
      <Link to="/" className="text-lg font-bold text-slate-100 hover:text-sky-400 flex-shrink-0">
        Rubik's Trainer
      </Link>
      
      <div className="flex items-center gap-2 flex-shrink">
        <div className="flex items-center gap-1">
           <label htmlFor="bottomColorSelect" className="text-xs text-slate-400">Bottom:</label>
           <select 
             id="bottomColorSelect"
             value={currentBottomColor}
             onChange={(e) => onBottomColorChange(e.target.value as CubeColor)}
             className="bg-slate-700 text-slate-100 text-xs rounded p-1 border border-slate-600 focus:ring-sky-500 focus:border-sky-500"
           >
             <option value="white">White</option>
             <option value="yellow">Yellow</option>
             <option value="red">Red</option>
             <option value="orange">Orange</option>
             <option value="blue">Blue</option>
             <option value="green">Green</option>
           </select>
        </div>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={18} className="text-slate-400" /> : <Volume2 size={18} className="text-slate-400" />}
        </button>
      </div>
    </header>
  );
};

export default Header; 