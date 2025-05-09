import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RubiksCubeState } from '../../logic/f2l/cubeStateUtil'; // Import the detailed state type
import { isValidPair } from '../../logic/f2l/pairDetector';
import { CubeColor } from '../../logic/cubeConstants';
import F2LCubie from './F2LCubie'; // Import the new cubie component

interface F2LCubeProps {
  onPairFound: () => void;
  onMiss: () => void;
  cubeState: RubiksCubeState; // Expect the detailed state
  bottomColor: CubeColor; // Added bottomColor prop
}

const F2LCube: React.FC<F2LCubeProps> = ({ 
  onPairFound, 
  onMiss,
  cubeState,
  bottomColor // Destructure bottomColor
}) => {
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [selectedPieceType, setSelectedPieceType] = useState<'edge' | 'corner' | null>(null);
  const [solvedPairs, setSolvedPairs] = useState<Set<string>>(new Set()); // Stores IDs of pieces in solved pairs
  const controlsRef = useRef<any>(); 

  // Handle cubie click, delegated from F2LCubie
  const handleCubieClick = (id: string, type: 'edge' | 'corner' | 'center') => {
    if (type === 'center') return; // Ignore center clicks

    if (selectedPieceId && selectedPieceType) {
      if (selectedPieceId === id) { // Clicked the same piece again
        setSelectedPieceId(null);
        setSelectedPieceType(null);
        return;
      }
      if (selectedPieceType === type) { // Clicked another piece of the same type
        setSelectedPieceId(id); // Select the new one
        // Type remains the same
        return;
      }
      
      // We have selected one edge and one corner
      const edgeId = selectedPieceType === 'edge' ? selectedPieceId : id;
      const cornerId = selectedPieceType === 'corner' ? selectedPieceId : id;

      // Note: isValidPair still uses the simplified ID check for now
      if (isValidPair(edgeId, cornerId, cubeState as any)) { // Pass state (might need type assertion)
        const newSolved = new Set(solvedPairs).add(edgeId).add(cornerId);
        setSolvedPairs(newSolved);
        setSelectedPieceId(null);
        setSelectedPieceType(null);
        onPairFound();
      } else {
        // TODO: Implement visual flash red feedback for the two selected pieces
        setSelectedPieceId(null);
        setSelectedPieceType(null);
        onMiss();
      }
    } else {
      // First selection
      setSelectedPieceId(id);
      setSelectedPieceType(type);
    }
  };

  // Reset camera on double click
  const resetCamera = () => {
    if (controlsRef.current) {
        controlsRef.current.reset();
    }
  }

  // Reset local state when the cubeState prop changes (new scramble)
  useEffect(() => {
    setSolvedPairs(new Set());
    setSelectedPieceId(null);
    setSelectedPieceType(null);
    // No need to reset camera here for every scramble, only for bottomColor change
  }, [cubeState]);

  // Reset camera when bottomColor changes to ensure initial view is correct
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [bottomColor]);

  return (
    <Canvas 
        camera={{ position: [3.5, 3.5, 3.5], fov: 50 }}
        onDoubleClick={resetCamera} 
        shadows 
    >
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 8, 5]} // Adjusted light position
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
       <directionalLight 
        position={[-5, -5, -5]} // Added backlight/fill light
        intensity={0.3} 
      />
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        minDistance={4} // Increased min distance slightly
        maxDistance={12}
        enablePan={false}
      />
      
      {/* Render all cubies based on the detailed cubeState */}
      {Object.values(cubeState).map((liveCubieState) => (
        <F2LCubie
          key={liveCubieState.definition.id}
          liveState={liveCubieState}
          onClick={handleCubieClick}
          selected={selectedPieceId === liveCubieState.definition.id}
          solved={solvedPairs.has(liveCubieState.definition.id)}
        />
      ))}
    </Canvas>
  );
};

export default F2LCube; 