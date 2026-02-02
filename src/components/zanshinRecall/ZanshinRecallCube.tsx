import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RubiksCubeState } from '../../logic/f2l/cubeStateUtil';
import ZanshinCubie, { DisplayMode } from './ZanshinCubie';
import { StickerId } from '../../logic/zanshinRecall/generateZanshinRound';

interface ZanshinRecallCubeProps {
  cubeState: RubiksCubeState;
  displayMode: DisplayMode;
  hiddenStickerIds?: Set<StickerId>;
  selectedStickerIds?: Set<StickerId>;
  selectedCubieId?: string | null;
  onStickerClick?: (stickerId: StickerId) => void;
  onCubieClick?: (cubieId: string, type: 'edge' | 'corner' | 'center') => void;
  selectionMode: 'sticker' | 'cubie' | 'none';
  highlightCorrect?: Set<StickerId>;
  highlightIncorrect?: Set<StickerId>;
  enableRotation?: boolean;
}

export interface ZanshinRecallCubeHandle {
  resetCamera: () => void;
}

const ZanshinRecallCube = forwardRef<ZanshinRecallCubeHandle, ZanshinRecallCubeProps>(({
  cubeState,
  displayMode,
  hiddenStickerIds = new Set(),
  selectedStickerIds = new Set(),
  selectedCubieId = null,
  onStickerClick,
  onCubieClick,
  selectionMode,
  highlightCorrect = new Set(),
  highlightIncorrect = new Set(),
  enableRotation = false,
}, ref) => {
  const controlsRef = useRef<any>();

  const resetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  useImperativeHandle(ref, () => ({
    resetCamera,
  }));

  return (
    <Canvas 
      camera={{ position: [3.5, 3.5, 3.5], fov: 50 }} 
      onDoubleClick={resetCamera}
      shadows
    >
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      
      <OrbitControls 
        ref={controlsRef} 
        enableZoom={false}
        enableRotate={enableRotation}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
      />

      {Object.values(cubeState).map(liveCubieState => (
        <ZanshinCubie
          key={liveCubieState.definition.id}
          liveState={liveCubieState}
          displayMode={displayMode}
          hiddenStickerIds={hiddenStickerIds}
          selectedStickerIds={selectedStickerIds}
          selectedCubieId={selectedCubieId}
          onStickerClick={onStickerClick}
          onCubieClick={onCubieClick}
          selectionMode={selectionMode}
          highlightCorrect={highlightCorrect}
          highlightIncorrect={highlightIncorrect}
        />
      ))}
    </Canvas>
  );
});

ZanshinRecallCube.displayName = 'ZanshinRecallCube';

export default ZanshinRecallCube;
