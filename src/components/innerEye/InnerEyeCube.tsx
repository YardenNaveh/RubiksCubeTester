import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RubiksCubeState } from '../../logic/f2l/cubeStateUtil';
import InnerEyeCubie from './InnerEyeCubie';

interface InnerEyeCubeProps {
  cubeState: RubiksCubeState;
  hiddenPieceId: string | null;
  isRevealing: boolean;
  isIncorrect: boolean;
}

export interface InnerEyeCubeHandle {
  resetCamera: () => void;
}

const InnerEyeCube = forwardRef<InnerEyeCubeHandle, InnerEyeCubeProps>(({
  cubeState,
  hiddenPieceId,
  isRevealing,
  isIncorrect,
}, ref) => {
  const controlsRef = useRef<any>();

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
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
      
      {/* Enable full rotation for observation */}
      <OrbitControls 
        ref={controlsRef} 
        enableZoom={true}
        enableRotate={true}
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        rotateSpeed={0.8}
        // Damping for smoother feel
        enableDamping={true}
        dampingFactor={0.1}
      />

      {Object.values(cubeState).map(liveCubieState => {
        const isHidden = liveCubieState.definition.id === hiddenPieceId;
        
        return (
          <InnerEyeCubie
            key={liveCubieState.definition.id}
            liveState={liveCubieState}
            isHidden={isHidden}
            isRevealing={isHidden && isRevealing}
            isIncorrect={isHidden && isIncorrect}
          />
        );
      })}
    </Canvas>
  );
});

InnerEyeCube.displayName = 'InnerEyeCube';

export default InnerEyeCube;
