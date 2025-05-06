import React from 'react';
import { CubeColor, TargetRelation } from '../logic/cubeConstants';
import type { Face } from '../logic/orientation';

interface CubeProps {
  ref1Face: Face;
  ref1Color: CubeColor;
  ref2Face: Face;
  ref2Color: CubeColor;
  targetRelation: TargetRelation;
  targetFace: Face;
  showArrow: boolean; // Control arrow visibility
}

// Tailwind color mapping for the two visible faces
const colorClasses: Record<CubeColor, string> = {
  white: 'bg-gray-100',
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  orange: 'bg-orange-500',
};

// Base Tailwind classes for a face div
const faceBaseClasses = "absolute w-full h-full border border-black/50 flex items-center justify-center overflow-hidden"; // Added overflow-hidden

// Style for the target pattern overlay using background-image
// Using repeating diagonal lines. Adjust color/angle/size as needed.
const targetOverlayStyle = (/* faceColor: CubeColor */): React.CSSProperties => { // Comment out unused faceColor param
    // Use the requested color #7e4dc1 with transparency
    const patternColor = 'rgba(126, 77, 193, 0.5)'; // #7e4dc1 with 0.5 alpha
    return {
        backgroundImage: `repeating-linear-gradient(-45deg, ${patternColor}, ${patternColor} 4px, transparent 4px, transparent 10px)`,
        backgroundSize: '14px 14px' // Controls density
    };
};

const Cube: React.FC<CubeProps> = ({ ref1Face, ref1Color, ref2Face, ref2Color, /* targetRelation, */ targetFace, showArrow }) => { // Comment out unused targetRelation
  const cubeSize = 180; // Base size in px
  const perspective = 1000; // CSS perspective value
  const halfSize = cubeSize / 2;

  return (
    <div
      className="relative my-8" // Margin top/bottom
      style={{
        width: `${cubeSize}px`,
        height: `${cubeSize}px`,
        perspective: `${perspective}px`,
      }}
    >
      {/* Cube container for 3D transforms */}
      <div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-25deg) rotateY(45deg)' }} // Restore standard Isometric view angle
      >
        {/* Front Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'F' ? colorClasses[ref1Color] : ref2Face === 'F' ? colorClasses[ref2Color] : ''}`}
          style={{ 
            transform: `translateZ(${halfSize}px)`, 
            ...(targetFace === 'F' && showArrow ? targetOverlayStyle() : {}) 
          }}
        ></div>

        {/* Right Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'R' ? colorClasses[ref1Color] : ref2Face === 'R' ? colorClasses[ref2Color] : ''}`}
          style={{ 
            transform: `rotateY(90deg) translateZ(${halfSize}px)`, 
            ...(targetFace === 'R' && showArrow ? targetOverlayStyle() : {}) 
          }}
        ></div>

        {/* Top Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'U' ? colorClasses[ref1Color] : ref2Face === 'U' ? colorClasses[ref2Color] : ''}`}
          style={{ 
            transform: `rotateX(90deg) translateZ(${halfSize}px)`,
            ...(targetFace === 'U' && showArrow ? targetOverlayStyle() : {}) 
          }}
        ></div>
        
        {/* Left Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'L' ? colorClasses[ref1Color] : ref2Face === 'L' ? colorClasses[ref2Color] : ''}`}
          style={{ 
            transform: `rotateY(-90deg) translateZ(${halfSize}px)`, 
            ...(targetFace === 'L' && showArrow ? targetOverlayStyle() : {}) 
          }}
        ></div>

        {/* Back Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'B' ? colorClasses[ref1Color] : ref2Face === 'B' ? colorClasses[ref2Color] : ''}`}
          style={{ 
            transform: `rotateY(180deg) translateZ(${halfSize}px)`,
            ...(targetFace === 'B' && showArrow ? targetOverlayStyle() : {}) 
          }}
        ></div>

        {/* Bottom Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'D' ? colorClasses[ref1Color] : ref2Face === 'D' ? colorClasses[ref2Color] : ''}`}
          style={{ 
            transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
            ...(targetFace === 'D' && showArrow ? targetOverlayStyle() : {}) 
          }}
        ></div>
      </div>
    </div>
  );
};

export default Cube; 