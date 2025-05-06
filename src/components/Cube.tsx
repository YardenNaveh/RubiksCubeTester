import React from 'react';
import { CubeColor, TargetRelation } from '../logic/cubeConstants';
import type { Face } from '../logic/orientation';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'; // Use icons for arrow directions

interface CubeProps {
  ref1Face: Face;
  ref1Color: CubeColor;
  ref2Face: Face;
  ref2Color: CubeColor;
  targetRelation: TargetRelation;
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

// Map relation to arrow component and rotation
const arrowMap: Record<TargetRelation, { Icon: React.ElementType, rotation: string, position?: string }> = {
  up: { Icon: ArrowUp, rotation: 'rotate-0' },
  down: { Icon: ArrowDown, rotation: 'rotate-0' },
  left: { Icon: ArrowLeft, rotation: 'rotate-0' }, 
  right: { Icon: ArrowRight, rotation: 'rotate-0' }, 
  // Front/Back arrows are less intuitive in this projection, but keep placeholders
  front: { Icon: ArrowRight, rotation: '-rotate-45' },
  back: { Icon: ArrowLeft, rotation: 'rotate-[135deg]' }, 
};

const Cube: React.FC<CubeProps> = ({ ref1Face, ref1Color, ref2Face, ref2Color, targetRelation, showArrow }) => {
  const cubeSize = 180; // Base size in px
  const perspective = 1000; // CSS perspective value
  const halfSize = cubeSize / 2;
  const faceBaseClasses = "absolute w-full h-full border border-black/50"; // Base classes for all faces

  const ArrowComponent = arrowMap[targetRelation]?.Icon;
  const arrowRotation = arrowMap[targetRelation]?.rotation || 'rotate-0';

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
          style={{ transform: `translateZ(${halfSize}px)` }}
        ></div>

        {/* Right Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'R' ? colorClasses[ref1Color] : ref2Face === 'R' ? colorClasses[ref2Color] : ''}`}
          style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
        ></div>

        {/* Top Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'U' ? colorClasses[ref1Color] : ref2Face === 'U' ? colorClasses[ref2Color] : ''}`}
          style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
        ></div>
        
        {/* Left Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'L' ? colorClasses[ref1Color] : ref2Face === 'L' ? colorClasses[ref2Color] : ''}`}
          style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
        ></div>

        {/* Back Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'B' ? colorClasses[ref1Color] : ref2Face === 'B' ? colorClasses[ref2Color] : ''}`}
          style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
        ></div>

        {/* Bottom Face */}
        <div
          className={`${faceBaseClasses} ${ref1Face === 'D' ? colorClasses[ref1Color] : ref2Face === 'D' ? colorClasses[ref2Color] : ''}`}
          style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
        ></div>
      </div>

      {/* Arrow Overlay */}
      {ArrowComponent && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out ${showArrow ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'translateZ(1px)' }} // Bring arrow slightly in front of faces
        >
          <div className={`transform ${arrowRotation}`}> 
            <ArrowComponent size={cubeSize * 0.4} className="text-black opacity-75 drop-shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cube; 