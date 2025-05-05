import React from 'react';
import { CubeColor, TargetRelation } from '../logic/cubeConstants';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'; // Use icons for arrow directions

interface CubeProps {
  frontFaceColor: CubeColor;
  rightFaceColor: CubeColor;
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

const Cube: React.FC<CubeProps> = ({ frontFaceColor, rightFaceColor, targetRelation, showArrow }) => {
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
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-25deg) rotateY(45deg)' }} // Isometric view angle
      >
        {/* Front Face (Colored) */}
        <div
          className={`${faceBaseClasses} ${colorClasses[frontFaceColor]}`}
          style={{ transform: `translateZ(${halfSize}px)` }}
        ></div>

        {/* Right Face (Colored) */}
        <div
          className={`${faceBaseClasses} ${colorClasses[rightFaceColor]}`}
          style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
        ></div>

        {/* Top Face (Wireframe) */}
        <div
          className={`${faceBaseClasses}`}
          style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
        ></div>
        
        {/* Left Face (Wireframe) */}
        <div
          className={`${faceBaseClasses}`}
          style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
        ></div>

        {/* Back Face (Wireframe) */}
        <div
          className={`${faceBaseClasses}`}
          style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
        ></div>

        {/* Bottom Face (Wireframe) */}
        <div
          className={`${faceBaseClasses}`}
          style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
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