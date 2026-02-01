import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { LiveCubieState } from '../../logic/f2l/cubeStateUtil';
import { CUBE_COLOR_MAP } from './cubeColorMap'; // Use shared color map

interface F2LCubieProps {
  liveState: LiveCubieState;
  onClick: (id: string, type: 'edge' | 'corner' | 'center') => void;
  selected: boolean;
  solved: boolean;
}

const STICKER_OFFSET = 0.505; // Slightly offset from cubie center
const STICKER_SIZE = 0.88;     // Slightly smaller than cubie face
const STICKER_BORDER_SIZE = 0.98; // Larger for border effect
const BASE_PLASTIC_COLOR = '#222222';
const SELECTED_PLASTIC_COLOR = '#111111'; // Black for highlight
const SELECTED_BORDER_COLOR = '#555555'; // Dark gray border for highlighted stickers

// 3x3 grid of dot positions on sticker
const DOT_GRID_POSITIONS = [
  [-0.25, -0.25], [0, -0.25], [0.25, -0.25],
  [-0.25, 0],     [0, 0],     [0.25, 0],
  [-0.25, 0.25],  [0, 0.25],  [0.25, 0.25],
];

const F2LCubie: React.FC<F2LCubieProps> = ({ liveState, onClick, selected, solved }) => {
  const groupRef = useRef<THREE.Group>(null);
  // Store materials directly in ref, keyed by face sticker ID (e.g. UFR-U, UFR-F)
  const stickerMaterials = useRef<Record<string, THREE.MeshStandardMaterial>>({}); 

  const { definition, currentPosition, currentOrientation } = liveState;

  // Memoize sticker geometries to avoid recreation
  const stickerGeometry = useMemo(() => new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE), []);
  const stickerBorderGeometry = useMemo(() => new THREE.PlaneGeometry(STICKER_BORDER_SIZE, STICKER_BORDER_SIZE), []);
  const borderMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: SELECTED_BORDER_COLOR, 
    side: THREE.DoubleSide 
  }), []);
  
  // Small circle geometry for dots
  const dotGeometry = useMemo(() => new THREE.CircleGeometry(0.04, 8), []);
  const dotMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#000000',
    side: THREE.DoubleSide,
  }), []);

  // Ensure materials are created synchronously before first render of stickers
  definition.stickers.forEach(sticker => {
    const materialKey = `${definition.id}-${sticker.face}`;
    if (!stickerMaterials.current[materialKey]) {
      stickerMaterials.current[materialKey] = new THREE.MeshStandardMaterial({
        // Initial color will be set by useEffect, but create the material object now
        color: CUBE_COLOR_MAP[sticker.color], // Set initial color directly
        emissive: '#000000',
        roughness: 0.7,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
    }
  });

  // Update sticker colors based on the 'solved' state
  useEffect(() => {
    definition.stickers.forEach(sticker => {
      const materialKey = `${definition.id}-${sticker.face}`;
      const targetColor = solved ? CUBE_COLOR_MAP.black : CUBE_COLOR_MAP[sticker.color];
      // Material should already exist due to synchronous creation above
      if (stickerMaterials.current[materialKey]) {
        stickerMaterials.current[materialKey].color.set(targetColor);
      }
    });
  }, [solved, definition.stickers, definition.id]); // definition.id and definition.stickers for safety if piece changes

  // Update group position and orientation when liveState changes
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition);
      groupRef.current.quaternion.copy(currentOrientation);
    }
  }, [currentPosition, currentOrientation]);

  const handleClick = (event: any) => { // Use any for event type, R3F event might be complex
    event.stopPropagation(); 
    if (!solved) {
      onClick(definition.id, definition.type);
    }
  };

  const plasticColor = selected ? SELECTED_PLASTIC_COLOR : BASE_PLASTIC_COLOR;

  return (
    <group ref={groupRef} onClick={handleClick} scale={selected ? 1.15 : 1}>
      {/* Plastic Core - slightly smaller */}
      <mesh>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshStandardMaterial color={plasticColor} roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Stickers */}
      {definition.stickers.map((sticker) => {
        const materialKey = `${definition.id}-${sticker.face}`;
        // Calculate sticker position and orientation relative to the cubie center
        const stickerPos = sticker.normal.clone().multiplyScalar(STICKER_OFFSET);
        const borderPos = sticker.normal.clone().multiplyScalar(STICKER_OFFSET - 0.001);
        const stickerQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), sticker.normal);
        
        // Calculate local axes for positioning dots on the sticker plane
        const localX = new THREE.Vector3(1, 0, 0).applyQuaternion(stickerQuat);
        const localY = new THREE.Vector3(0, 1, 0).applyQuaternion(stickerQuat);
        
        return (
          <group key={materialKey}>
            {/* Cyan border behind sticker when selected */}
            {selected && (
              <mesh
                geometry={stickerBorderGeometry}
                material={borderMaterial}
                position={borderPos}
                quaternion={stickerQuat}
              />
            )}
            {/* Main sticker */}
            <mesh
              geometry={stickerGeometry}
              material={stickerMaterials.current[materialKey]} 
              position={stickerPos}
              quaternion={stickerQuat}
            />
            {/* Dot grid on sticker when selected */}
            {selected && DOT_GRID_POSITIONS.map(([dx, dy], i) => {
              const dotPos = stickerPos.clone()
                .add(sticker.normal.clone().multiplyScalar(0.002))
                .add(localX.clone().multiplyScalar(dx))
                .add(localY.clone().multiplyScalar(dy));
              
              return (
                <mesh
                  key={`dot-${i}`}
                  geometry={dotGeometry}
                  material={dotMaterial}
                  position={dotPos}
                  quaternion={stickerQuat}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

export default F2LCubie; 