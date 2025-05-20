import React from 'react';
import './CelebrationOverlay.css'; // We'll create this CSS file next

interface CelebrationOverlayProps {
  isActive: boolean;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ isActive }) => {
  if (!isActive) {
    return null;
  }

  // Generate a few "stars" or "particles"
  const particles = Array.from({ length: 15 }).map((_, index) => ({
    id: index,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 6 + 4}px`, // size between 4px and 10px
      height: `${Math.random() * 6 + 4}px`,
      backgroundColor: ['#FFD700', '#FF69B4', '#00FFFF', '#7FFF00', '#FFA500'][Math.floor(Math.random() * 5)],
      animationDelay: `${Math.random() * 0.5}s`,
      animationDuration: `${Math.random() * 0.5 + 0.8}s`, // duration between 0.8s and 1.3s
    }
  }));

  return (
    <div className="celebration-overlay">
      {particles.map(p => (
        <div key={p.id} className="particle" style={p.style}></div>
      ))}
      <div className="celebration-text">Nice!</div>
    </div>
  );
};

export default CelebrationOverlay; 