import React from 'react';
import { CubeColor, TargetRelation } from '../logic/cubeConstants';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'; // Use icons for arrow directions

interface CubeProps {
  frontFaceColor: CubeColor;
  rightFaceColor: CubeColor;
  upFaceColor: CubeColor; // Needed to show the top face color correctly
  targetRelation: TargetRelation;
  showArrow: boolean; // Control arrow visibility for animation
}

// Tailwind color mapping (subset needed for cube faces)
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
  up: { Icon: ArrowUp, rotation: 'rotate-0', position: 'top-1/4' },
  down: { Icon: ArrowDown, rotation: 'rotate-0', position: 'bottom-1/4' }, // Might need adjustment based on cube perspective
  left: { Icon: ArrowLeft, rotation: 'rotate-0', position: 'left-1/4' },
  right: { Icon: ArrowRight, rotation: 'rotate-0', position: 'right-1/4' },
  front: { Icon: ArrowRight, rotation: '-rotate-45', position: 'top-[40%] left-[40%]' }, // Placeholder - pointing towards viewer
  back: { Icon: ArrowLeft, rotation: 'rotate-[135deg]', position: 'top-[15%] left-[15%]' }, // Placeholder - pointing away
};

const Cube: React.FC<CubeProps> = ({ frontFaceColor, rightFaceColor, upFaceColor, targetRelation, showArrow }) => {
  const cubeSize = 180; // Base size in px
  const perspective = 1000; // CSS perspective value

  const ArrowComponent = arrowMap[targetRelation]?.Icon;
  const arrowRotation = arrowMap[targetRelation]?.rotation || 'rotate-0';
  // Note: Arrow positioning for front/back is approximate and might need refinement.

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
        className="relative w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-25deg) rotateY(45deg)' }} // Isometric view angle
      >
        {/* Front Face */}
        <div
          className={`absolute w-full h-full border border-black/50 ${colorClasses[frontFaceColor]}`}
          style={{ transform: `translateZ(${cubeSize / 2}px)` }}
        ></div>

        {/* Right Face */}
        <div
          className={`absolute w-full h-full border border-black/50 ${colorClasses[rightFaceColor]}`}
          style={{
            transform: `rotateY(90deg) translateZ(${cubeSize / 2}px)`,
          }}
        ></div>

        {/* Top Face */}
        <div
          className={`absolute w-full h-full border border-black/50 ${colorClasses[upFaceColor]}`}
          style={{
            transform: `rotateX(-90deg) translateZ(${cubeSize / 2}px)`,
          }}
        ></div>

        {/* Note: Other faces (Left, Bottom, Back) are not strictly needed for the 2-face view */}
      </div>

      {/* Arrow Overlay - positioned relative to the outer container */}
      {ArrowComponent && (
        <div
          className={`
            absolute inset-0 flex items-center justify-center 
            transition-opacity duration-300 ease-in-out 
            ${showArrow ? 'opacity-100' : 'opacity-0'}
          `}
          // style={{ transform: `translateZ(${cubeSize * 0.7}px)` }} // Bring arrow slightly forward
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