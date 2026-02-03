import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { LiveCubieState } from '../../logic/f2l/cubeStateUtil';
import { CUBE_COLOR_MAP } from '../f2l/cubeColorMap';

interface InnerEyeCubieProps {
  liveState: LiveCubieState;
  isHidden: boolean; // Whether this entire piece should be blacked out
  isRevealing: boolean; // Whether we're showing the answer (reveal animation)
  isIncorrect: boolean; // Whether this was incorrectly answered
}

const STICKER_OFFSET = 0.505;
const STICKER_SIZE = 0.88;
const STICKER_BORDER_SIZE = 0.98;
const BASE_PLASTIC_COLOR = '#222222';
const HIDDEN_COLOR = '#0a0a0a'; // Very dark for hidden pieces

const InnerEyeCubie: React.FC<InnerEyeCubieProps> = ({
  liveState,
  isHidden,
  isRevealing,
  isIncorrect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const stickerMaterials = useRef<Record<string, THREE.MeshStandardMaterial>>({});

  const { definition, currentPosition, currentOrientation } = liveState;

  // Memoize geometries
  const stickerGeometry = useMemo(() => new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE), []);
  const stickerBorderGeometry = useMemo(() => new THREE.PlaneGeometry(STICKER_BORDER_SIZE, STICKER_BORDER_SIZE), []);
  
  // Border materials for different states
  const revealBorderMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#22c55e', // Green for correct reveal
    side: THREE.DoubleSide 
  }), []);
  
  const incorrectBorderMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ef4444', // Red for incorrect
    side: THREE.DoubleSide 
  }), []);

  // Question mark geometry for hidden pieces
  const questionMarkGeometry = useMemo(() => new THREE.PlaneGeometry(0.5, 0.5), []);
  
  // Create a canvas texture for the question mark
  const questionMarkTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
  
  const questionMarkMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    map: questionMarkTexture,
    transparent: true,
    side: THREE.DoubleSide,
  }), [questionMarkTexture]);

  // Initialize materials
  definition.stickers.forEach(sticker => {
    const materialKey = `${definition.id}-${sticker.face}`;
    if (!stickerMaterials.current[materialKey]) {
      stickerMaterials.current[materialKey] = new THREE.MeshStandardMaterial({
        color: CUBE_COLOR_MAP[sticker.color],
        emissive: '#000000',
        roughness: 0.7,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
    }
  });

  // Update sticker colors based on hidden state
  useEffect(() => {
    definition.stickers.forEach(sticker => {
      const materialKey = `${definition.id}-${sticker.face}`;
      
      let targetColor: string;
      
      if (isHidden && !isRevealing) {
        // Piece is hidden - show black
        targetColor = HIDDEN_COLOR;
      } else {
        // Show actual color (normal or revealing)
        targetColor = CUBE_COLOR_MAP[sticker.color];
      }
      
      if (stickerMaterials.current[materialKey]) {
        stickerMaterials.current[materialKey].color.set(targetColor);
      }
    });
  }, [isHidden, isRevealing, definition.stickers, definition.id]);

  // Update position and orientation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition);
      groupRef.current.quaternion.copy(currentOrientation);
    }
  }, [currentPosition, currentOrientation]);

  // Determine if we should show border (during reveal or incorrect)
  const showBorder = isRevealing || isIncorrect;
  const borderMaterial = isIncorrect ? incorrectBorderMaterial : revealBorderMaterial;

  // Scale up slightly when revealing
  const scale = isRevealing ? 1.08 : 1;

  return (
    <group ref={groupRef} scale={scale}>
      {/* Plastic Core */}
      <mesh>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshStandardMaterial 
          color={isHidden && !isRevealing ? '#111111' : BASE_PLASTIC_COLOR} 
          roughness={0.6} 
          metalness={0.2} 
        />
      </mesh>

      {/* Stickers */}
      {definition.stickers.map((sticker) => {
        const materialKey = `${definition.id}-${sticker.face}`;
        
        const stickerPos = sticker.normal.clone().multiplyScalar(STICKER_OFFSET);
        const borderPos = sticker.normal.clone().multiplyScalar(STICKER_OFFSET - 0.001);
        const stickerQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1), 
          sticker.normal
        );

        // Position for question mark (slightly in front of sticker)
        const questionMarkPos = stickerPos.clone().add(sticker.normal.clone().multiplyScalar(0.003));

        return (
          <group key={materialKey}>
            {/* Border when revealing/incorrect */}
            {showBorder && (
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
            
            {/* Question mark on hidden stickers (when not revealing) */}
            {isHidden && !isRevealing && (
              <mesh
                geometry={questionMarkGeometry}
                material={questionMarkMaterial}
                position={questionMarkPos}
                quaternion={stickerQuat}
              />
            )}
          </group>
        );
      })}
    </group>
  );
};

export default InnerEyeCubie;
