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
const plasticColor = new THREE.Color('#222222'); // Dark gray plastic

const F2LCubie: React.FC<F2LCubieProps> = ({ liveState, onClick, selected, solved }) => {
  const groupRef = useRef<THREE.Group>(null);
  const stickerMaterials = useRef<Record<string, THREE.MeshBasicMaterial>>({});

  const { definition, currentPosition, currentOrientation } = liveState;

  // Memoize sticker geometries to avoid recreation
  const stickerGeometry = useMemo(() => new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE), []);

  // Update materials based on solved/selected state
  useEffect(() => {
    definition.stickers.forEach(sticker => {
      const targetColor = solved ? CUBE_COLOR_MAP.black : CUBE_COLOR_MAP[sticker.color];
      if (stickerMaterials.current[sticker.face]) {
        stickerMaterials.current[sticker.face].color.set(targetColor);
        // Adjust opacity/transparency for selection visual cue
        stickerMaterials.current[sticker.face].opacity = selected ? 0.85 : 1.0;
        stickerMaterials.current[sticker.face].transparent = selected; 
      }
    });
  }, [solved, selected, definition.stickers]); // Depend on solved/selected state

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

  // Create materials only once, memoized by face
  useMemo(() => {
    definition.stickers.forEach(sticker => {
      const color = solved ? CUBE_COLOR_MAP.black : CUBE_COLOR_MAP[sticker.color];
      stickerMaterials.current[sticker.face] = new THREE.MeshBasicMaterial({
         color: color, 
         side: THREE.DoubleSide, // Render both sides just in case
         transparent: selected, 
         opacity: selected ? 0.85 : 1.0
      });
    });
  }, [definition.stickers]); // Only recreate if definition changes (shouldn't happen often)

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Plastic Core - slightly smaller */}
      <mesh>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshStandardMaterial color={plasticColor} roughness={0.6} metalness={0.2} />
      </mesh>
      
      {/* Stickers */}
      {definition.stickers.map((sticker) => {
        // Calculate sticker position and orientation relative to the cubie center
        const stickerPos = sticker.normal.clone().multiplyScalar(STICKER_OFFSET);
        const stickerQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), sticker.normal); // Align plane Z to sticker normal
        
        return (
          <mesh
            key={sticker.face}
            geometry={stickerGeometry}
            material={stickerMaterials.current[sticker.face]} // Use existing material
            position={stickerPos}
            quaternion={stickerQuat}
          />
        );
      })}
    </group>
  );
};

export default F2LCubie; 