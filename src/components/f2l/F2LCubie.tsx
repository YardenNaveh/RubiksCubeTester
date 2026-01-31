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
const BASE_PLASTIC_COLOR = '#222222';
const SELECTED_PLASTIC_COLOR = '#444444';

const F2LCubie: React.FC<F2LCubieProps> = ({ liveState, onClick, selected, solved }) => {
  const groupRef = useRef<THREE.Group>(null);
  // Store materials directly in ref, keyed by face sticker ID (e.g. UFR-U, UFR-F)
  const stickerMaterials = useRef<Record<string, THREE.MeshStandardMaterial>>({}); 

  const { definition, currentPosition, currentOrientation } = liveState;

  // Memoize sticker geometries to avoid recreation
  const stickerGeometry = useMemo(() => new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE), []);

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
    <group ref={groupRef} onClick={handleClick} scale={selected ? 1.12 : 1}>
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
        const stickerQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), sticker.normal); // Align plane Z to sticker normal
        
        return (
          <mesh
            key={materialKey} // Use a more unique key
            geometry={stickerGeometry}
            material={stickerMaterials.current[materialKey]} 
            position={stickerPos}
            quaternion={stickerQuat}
          />
        );
      })}
    </group>
  );
};

export default F2LCubie; 