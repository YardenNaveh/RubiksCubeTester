import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Volume2, VolumeX } from 'lucide-react'; // Using lucide-react for icons
import { COLORS } from '../logic/cubeConstants'; // Import COLORS
import { BottomColorSetting } from '../hooks/useLocalStorage'; // Import setting type
import HamburgerMenu from './HamburgerMenu'; // Import HamburgerMenu

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  currentBottomColor: BottomColorSetting; // Use setting type
  onBottomColorChange: (setting: BottomColorSetting) => void; // Use setting type
}

const Header: React.FC<HeaderProps> = ({ 
  isMuted, 
  onToggleMute,
  currentBottomColor,
  onBottomColorChange
 }) => {
  const bottomColorOptions: (BottomColorSetting | 'random')[] = ['random', 'white', 'yellow', 'blue', 'green', 'red', 'orange'];

  return (
    <header className="w-full bg-slate-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-10 gap-2">
      {/* Left side: Hamburger Menu */}
      <HamburgerMenu />

      <Link to="/" className="text-lg font-bold text-slate-100 hover:text-sky-400 flex-shrink-0">
        Rubik's Trainer
      </Link>
      
      <div className="flex items-center gap-2 flex-shrink">
        <div className="flex items-center gap-1">
           <label htmlFor="bottomColorSelect" className="text-xs text-slate-400">Bottom:</label>
           <select 
             id="bottomColorSelect"
             value={currentBottomColor} // Handles 'random' or specific color
             onChange={(e) => onBottomColorChange(e.target.value as BottomColorSetting)} // Cast to setting type
             className="bg-slate-700 text-slate-100 text-xs rounded p-1 border border-slate-600 focus:ring-sky-500 focus:border-sky-500 capitalize"
           >
             {bottomColorOptions.map(color => (
               <option key={color} value={color} className="capitalize">
                 {color === 'random' ? 'Random' : `${color.charAt(0).toUpperCase() + color.slice(1)}`}
               </option>
             ))}
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