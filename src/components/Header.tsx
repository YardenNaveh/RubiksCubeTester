import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react'; // Using lucide-react for icons

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMuted, onToggleMute }) => {
  return (
    <header className="w-full bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <Link to="/" className="text-lg font-bold text-slate-700 hover:text-accent">
        Rubik's Orientation Trainer
      </Link>
      <button
        onClick={onToggleMute}
        className="p-2 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={20} className="text-slate-600" /> : <Volume2 size={20} className="text-slate-600" />}
      </button>
    </header>
  );
};

export default Header; 