import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RubiksCubeState } from '../../logic/f2l/cubeStateUtil';
import F2LCubie from '../f2l/F2LCubie';

interface EdgeKataCubeProps {
  cubeState: RubiksCubeState;
  highlightedEdgeId: string | null;
}

const EdgeKataCube: React.FC<EdgeKataCubeProps> = ({ cubeState, highlightedEdgeId }) => {
  const controlsRef = useRef<any>();

  const resetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  // Reset camera on new scramble
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.reset();
  }, [cubeState]);

  return (
    <Canvas camera={{ position: [3.5, 3.5, 3.5], fov: 50 }} onDoubleClick={resetCamera} shadows>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <OrbitControls ref={controlsRef} enableZoom minDistance={4} maxDistance={12} enablePan={false} />

      {Object.values(cubeState).map(liveCubieState => (
        <F2LCubie
          key={liveCubieState.definition.id}
          liveState={liveCubieState}
          onClick={() => { /* no-op in this mode */ }}
          selected={highlightedEdgeId === liveCubieState.definition.id}
          solved={false}
        />
      ))}
    </Canvas>
  );
};

export default EdgeKataCube;

