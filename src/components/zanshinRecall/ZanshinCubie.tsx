import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { LiveCubieState } from '../../logic/f2l/cubeStateUtil';
import { CUBE_COLOR_MAP } from '../f2l/cubeColorMap';
import { StickerId } from '../../logic/zanshinRecall/generateZanshinRound';

export type DisplayMode = 
  | 'normal'           // Show all stickers with colors
  | 'allHidden'        // Hide all stickers (black)
  | 'singleHidden';    // Hide only specific sticker(s)

interface ZanshinCubieProps {
  liveState: LiveCubieState;
  displayMode: DisplayMode;
  hiddenStickerIds?: Set<StickerId>; // For singleHidden mode
  selectedStickerIds?: Set<StickerId>; // For multi-select sticker mode
  selectedCubieId?: string | null; // For piece selection mode
  onStickerClick?: (stickerId: StickerId) => void;
  onCubieClick?: (cubieId: string, type: 'edge' | 'corner' | 'center') => void;
  selectionMode: 'sticker' | 'cubie' | 'none';
  highlightCorrect?: Set<StickerId>; // Green highlight for correct stickers
  highlightIncorrect?: Set<StickerId>; // Red highlight for incorrect stickers
}

const STICKER_OFFSET = 0.505;
const STICKER_SIZE = 0.88;
const STICKER_BORDER_SIZE = 0.98;
const BASE_PLASTIC_COLOR = '#222222';
const SELECTED_PLASTIC_COLOR = '#111111';

const ZanshinCubie: React.FC<ZanshinCubieProps> = ({
  liveState,
  displayMode,
  hiddenStickerIds = new Set(),
  selectedStickerIds = new Set(),
  selectedCubieId = null,
  onStickerClick,
  onCubieClick,
  selectionMode,
  highlightCorrect = new Set(),
  highlightIncorrect = new Set(),
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const stickerMaterials = useRef<Record<string, THREE.MeshStandardMaterial>>({});

  const { definition, currentPosition, currentOrientation } = liveState;
  const isCubieSelected = selectedCubieId === definition.id;

  // Memoize geometries
  const stickerGeometry = useMemo(() => new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE), []);
  const stickerBorderGeometry = useMemo(() => new THREE.PlaneGeometry(STICKER_BORDER_SIZE, STICKER_BORDER_SIZE), []);
  
  // Different border colors for different states
  const selectedBorderMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#7e4dc1', // Purple for selected
    side: THREE.DoubleSide 
  }), []);
  
  const correctBorderMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#22c55e', // Green for correct
    side: THREE.DoubleSide 
  }), []);
  
  const incorrectBorderMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ef4444', // Red for incorrect
    side: THREE.DoubleSide 
  }), []);

  // X shape for selected
  const xBarGeometry = useMemo(() => new THREE.PlaneGeometry(0.35, 0.04), []);
  const xMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#000000',
    side: THREE.DoubleSide,
  }), []);

  // Checkmark materials for correct/incorrect
  const checkMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ffffff',
    side: THREE.DoubleSide,
  }), []);

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

  // Update sticker colors based on display mode and hidden stickers
  useEffect(() => {
    definition.stickers.forEach(sticker => {
      const materialKey = `${definition.id}-${sticker.face}`;
      const stickerId = `${definition.id}-${sticker.face}`;
      
      let targetColor: string;
      
      if (displayMode === 'allHidden') {
        targetColor = CUBE_COLOR_MAP.black;
      } else if (displayMode === 'singleHidden' && hiddenStickerIds.has(stickerId)) {
        targetColor = CUBE_COLOR_MAP.black;
      } else {
        targetColor = CUBE_COLOR_MAP[sticker.color];
      }
      
      if (stickerMaterials.current[materialKey]) {
        stickerMaterials.current[materialKey].color.set(targetColor);
      }
    });
  }, [displayMode, hiddenStickerIds, definition.stickers, definition.id]);

  // Update position and orientation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition);
      groupRef.current.quaternion.copy(currentOrientation);
    }
  }, [currentPosition, currentOrientation]);

  const handleClick = (event: THREE.Event & { stopPropagation?: () => void }, stickerId: StickerId) => {
    if (event.stopPropagation) event.stopPropagation();
    
    if (selectionMode === 'sticker' && onStickerClick) {
      onStickerClick(stickerId);
    } else if (selectionMode === 'cubie' && onCubieClick) {
      onCubieClick(definition.id, definition.type);
    }
  };

  const plasticColor = isCubieSelected ? SELECTED_PLASTIC_COLOR : BASE_PLASTIC_COLOR;
  const scale = isCubieSelected ? 1.15 : 1;

  return (
    <group ref={groupRef} scale={scale}>
      {/* Plastic Core */}
      <mesh>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshStandardMaterial color={plasticColor} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Stickers */}
      {definition.stickers.map((sticker) => {
        const materialKey = `${definition.id}-${sticker.face}`;
        const stickerId = `${definition.id}-${sticker.face}`;
        
        const stickerPos = sticker.normal.clone().multiplyScalar(STICKER_OFFSET);
        const borderPos = sticker.normal.clone().multiplyScalar(STICKER_OFFSET - 0.001);
        const stickerQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1), 
          sticker.normal
        );

        const isStickerSelected = selectedStickerIds.has(stickerId);
        const isCorrect = highlightCorrect.has(stickerId);
        const isIncorrect = highlightIncorrect.has(stickerId);
        const showBorder = isStickerSelected || isCorrect || isIncorrect;

        // Determine border material
        let borderMaterial = selectedBorderMaterial;
        if (isCorrect) borderMaterial = correctBorderMaterial;
        if (isIncorrect) borderMaterial = incorrectBorderMaterial;

        // X mark position
        const xPos = stickerPos.clone().add(sticker.normal.clone().multiplyScalar(0.002));
        
        // Rotated quaternions for X bars
        const bar1Quat = stickerQuat.clone().multiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 4)
        );
        const bar2Quat = stickerQuat.clone().multiply(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 4)
        );

        return (
          <group key={materialKey}>
            {/* Border when selected/highlighted */}
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
              onClick={(e) => handleClick(e, stickerId)}
            />
            
            {/* X mark when selected */}
            {isStickerSelected && !isCorrect && !isIncorrect && (
              <>
                <mesh
                  geometry={xBarGeometry}
                  material={xMaterial}
                  position={xPos}
                  quaternion={bar1Quat}
                />
                <mesh
                  geometry={xBarGeometry}
                  material={xMaterial}
                  position={xPos}
                  quaternion={bar2Quat}
                />
              </>
            )}

            {/* Checkmark for correct */}
            {isCorrect && (
              <>
                <mesh
                  geometry={xBarGeometry}
                  material={checkMaterial}
                  position={xPos}
                  quaternion={bar1Quat}
                />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default ZanshinCubie;
