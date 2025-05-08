import * as THREE from 'three';
import {
  CubieDefinition,
  applyUMove,
  applyUPrimeMove,
  applyU2Move,
} from './cubePiece';
import { CubeColor, COLOR_PAIRS } from '../cubeConstants'; // For default color scheme

// Represents the state of a single cubie in the cube
export interface LiveCubieState {
  definition: CubieDefinition; // Static definition of the piece
  currentPosition: THREE.Vector3;
  currentOrientation: THREE.Quaternion;
}

// Represents the state of the entire Rubik's Cube
export type RubiksCubeState = Record<string, LiveCubieState>; // Keyed by cubie ID

// --- Definitions for all 26 pieces (Solved State) ---
// Standard Color Scheme: U:White, F:Red, R:Blue, D:Yellow, L:Green, B:Orange

const CUBIE_DEFS: CubieDefinition[] = [
  // Centers
  { id: 'U', type: 'center', initialPosition: new THREE.Vector3(0, 1, 0), initialOrientation: new THREE.Quaternion(), stickers: [{ face: 'U', color: 'white', normal: new THREE.Vector3(0,1,0) }] },
  { id: 'D', type: 'center', initialPosition: new THREE.Vector3(0, -1, 0), initialOrientation: new THREE.Quaternion(), stickers: [{ face: 'D', color: 'yellow', normal: new THREE.Vector3(0,-1,0) }] },
  { id: 'F', type: 'center', initialPosition: new THREE.Vector3(0, 0, 1), initialOrientation: new THREE.Quaternion(), stickers: [{ face: 'F', color: 'red', normal: new THREE.Vector3(0,0,1) }] },
  { id: 'B', type: 'center', initialPosition: new THREE.Vector3(0, 0, -1), initialOrientation: new THREE.Quaternion(), stickers: [{ face: 'B', color: 'orange', normal: new THREE.Vector3(0,0,-1) }] },
  { id: 'L', type: 'center', initialPosition: new THREE.Vector3(-1, 0, 0), initialOrientation: new THREE.Quaternion(), stickers: [{ face: 'L', color: 'green', normal: new THREE.Vector3(-1,0,0) }] },
  { id: 'R', type: 'center', initialPosition: new THREE.Vector3(1, 0, 0), initialOrientation: new THREE.Quaternion(), stickers: [{ face: 'R', color: 'blue', normal: new THREE.Vector3(1,0,0) }] },
  
  // Edges (Normals point outwards from the sticker on the piece)
  { id: 'UF', type: 'edge', initialPosition: new THREE.Vector3(0, 1, 1), initialOrientation: new THREE.Quaternion(), stickers: [{face:'U',color:'white',normal:new THREE.Vector3(0,1,0)}, {face:'F',color:'red',normal:new THREE.Vector3(0,0,1)}]}, 
  { id: 'UR', type: 'edge', initialPosition: new THREE.Vector3(1, 1, 0), initialOrientation: new THREE.Quaternion(), stickers: [{face:'U',color:'white',normal:new THREE.Vector3(0,1,0)}, {face:'R',color:'blue',normal:new THREE.Vector3(1,0,0)}]}, 
  { id: 'UB', type: 'edge', initialPosition: new THREE.Vector3(0, 1, -1), initialOrientation: new THREE.Quaternion(), stickers: [{face:'U',color:'white',normal:new THREE.Vector3(0,1,0)}, {face:'B',color:'orange',normal:new THREE.Vector3(0,0,-1)}]}, 
  { id: 'UL', type: 'edge', initialPosition: new THREE.Vector3(-1, 1, 0), initialOrientation: new THREE.Quaternion(), stickers: [{face:'U',color:'white',normal:new THREE.Vector3(0,1,0)}, {face:'L',color:'green',normal:new THREE.Vector3(-1,0,0)}]}, 
  { id: 'DF', type: 'edge', initialPosition: new THREE.Vector3(0,-1, 1), initialOrientation: new THREE.Quaternion(), stickers: [{face:'D',color:'yellow',normal:new THREE.Vector3(0,-1,0)}, {face:'F',color:'red',normal:new THREE.Vector3(0,0,1)}]}, 
  { id: 'DR', type: 'edge', initialPosition: new THREE.Vector3(1,-1, 0), initialOrientation: new THREE.Quaternion(), stickers: [{face:'D',color:'yellow',normal:new THREE.Vector3(0,-1,0)}, {face:'R',color:'blue',normal:new THREE.Vector3(1,0,0)}]}, 
  { id: 'DB', type: 'edge', initialPosition: new THREE.Vector3(0,-1,-1), initialOrientation: new THREE.Quaternion(), stickers: [{face:'D',color:'yellow',normal:new THREE.Vector3(0,-1,0)}, {face:'B',color:'orange',normal:new THREE.Vector3(0,0,-1)}]}, 
  { id: 'DL', type: 'edge', initialPosition: new THREE.Vector3(-1,-1,0), initialOrientation: new THREE.Quaternion(), stickers: [{face:'D',color:'yellow',normal:new THREE.Vector3(0,-1,0)}, {face:'L',color:'green',normal:new THREE.Vector3(-1,0,0)}]}, 
  { id: 'FR', type: 'edge', initialPosition: new THREE.Vector3(1, 0, 1), initialOrientation: new THREE.Quaternion(), stickers: [{face:'F',color:'red',normal:new THREE.Vector3(0,0,1)}, {face:'R',color:'blue',normal:new THREE.Vector3(1,0,0)}]}, 
  { id: 'FL', type: 'edge', initialPosition: new THREE.Vector3(-1,0, 1), initialOrientation: new THREE.Quaternion(), stickers: [{face:'F',color:'red',normal:new THREE.Vector3(0,0,1)}, {face:'L',color:'green',normal:new THREE.Vector3(-1,0,0)}]}, 
  { id: 'BR', type: 'edge', initialPosition: new THREE.Vector3(1, 0,-1), initialOrientation: new THREE.Quaternion(), stickers: [{face:'B',color:'orange',normal:new THREE.Vector3(0,0,-1)}, {face:'R',color:'blue',normal:new THREE.Vector3(1,0,0)}]}, 
  { id: 'BL', type: 'edge', initialPosition: new THREE.Vector3(-1,0,-1), initialOrientation: new THREE.Quaternion(), stickers: [{face:'B',color:'orange',normal:new THREE.Vector3(0,0,-1)}, {face:'L',color:'green',normal:new THREE.Vector3(-1,0,0)}]}, 

  // Corners
  { id: 'UFR', type:'corner', initialPosition:new THREE.Vector3(1,1,1), initialOrientation:new THREE.Quaternion(), stickers: [{face:'U',color:'white',normal:new THREE.Vector3(0,1,0)}, {face:'F',color:'red',normal:new THREE.Vector3(0,0,1)}, {face:'R',color:'blue',normal:new THREE.Vector3(1,0,0)}]}, 
  { id: 'UFL', type:'corner', initialPosition:new THREE.Vector3(-1,1,1), initialOrientation:new THREE.Quaternion(), stickers: [{face:'U',color:'white',normal:new THREE.Vector3(0,1,0)}, {face:'F',color:'red',normal:new THREE.Vector3(0,0,1)}, {face:'L',color:'green',normal:new THREE.Vector3(-1,0,0)}]}, 
  { id: 'UBR', type:'corner', initialPosition:new THREE.Vector3(1,1,-1), initialOrientation:new THREE.Quaternion(), stickers: [{face:'U',color:'white',normal:new THREE.Vector3(0,1,0)}, {face:'B',color:'orange',normal:new THREE.Vector3(0,0,-1)}, {face:'R',color:'blue',normal:new THREE.Vector3(1,0,0)}]}, 
  { id: 'UBL', type:'corner', initialPosition:new THREE.Vector3(-1,1,-1), initialOrientation:new THREE.Quaternion(), stickers: [{face:'U',color:'white',normal:new THREE.Vector3(0,1,0)}, {face:'B',color:'orange',normal:new THREE.Vector3(0,0,-1)}, {face:'L',color:'green',normal:new THREE.Vector3(-1,0,0)}]}, 
  { id: 'DFR', type:'corner', initialPosition:new THREE.Vector3(1,-1,1), initialOrientation:new THREE.Quaternion(), stickers: [{face:'D',color:'yellow',normal:new THREE.Vector3(0,-1,0)}, {face:'F',color:'red',normal:new THREE.Vector3(0,0,1)}, {face:'R',color:'blue',normal:new THREE.Vector3(1,0,0)}]}, 
  { id: 'DFL', type:'corner', initialPosition:new THREE.Vector3(-1,-1,1), initialOrientation:new THREE.Quaternion(), stickers: [{face:'D',color:'yellow',normal:new THREE.Vector3(0,-1,0)}, {face:'F',color:'red',normal:new THREE.Vector3(0,0,1)}, {face:'L',color:'green',normal:new THREE.Vector3(-1,0,0)}]}, 
  { id: 'DBR', type:'corner', initialPosition:new THREE.Vector3(1,-1,-1), initialOrientation:new THREE.Quaternion(), stickers: [{face:'D',color:'yellow',normal:new THREE.Vector3(0,-1,0)}, {face:'B',color:'orange',normal:new THREE.Vector3(0,0,-1)}, {face:'R',color:'blue',normal:new THREE.Vector3(1,0,0)}]}, 
  { id: 'DBL', type:'corner', initialPosition:new THREE.Vector3(-1,-1,-1), initialOrientation:new THREE.Quaternion(), stickers: [{face:'D',color:'yellow',normal:new THREE.Vector3(0,-1,0)}, {face:'B',color:'orange',normal:new THREE.Vector3(0,0,-1)}, {face:'L',color:'green',normal:new THREE.Vector3(-1,0,0)}]}, 
];

/**
 * Creates the initial solved state of the Rubik's Cube.
 * @param bottomColor The color chosen for the bottom face (influences overall orientation).
 */
export function createInitialCubeState(bottomColor: CubeColor = 'yellow'): RubiksCubeState {
  const state: RubiksCubeState = {};
  
  // TODO: Adjust initial orientations and sticker colors based on bottomColor
  // For now, assumes standard Yellow bottom, White top.
  // This requires rotating the entire cube definition if bottomColor is not yellow.

  CUBIE_DEFS.forEach(def => {
    state[def.id] = {
      definition: def,
      currentPosition: def.initialPosition.clone(),
      currentOrientation: def.initialOrientation.clone(),
    };
  });
  return state;
}

/**
 * Applies a move (U, U', U2) to the cube state.
 * @param state The current cube state.
 * @param move The move to apply.
 * @returns The new cube state.
 */
export function applyCubeMove(state: RubiksCubeState, move: "U" | "U'" | "U2"): RubiksCubeState {
  // Create a new state object
  const newState: RubiksCubeState = {};

  // Iterate over the old state
  for (const id in state) {
    const oldLiveCubie = state[id];
    
    // Clone the properties for the new state
    const newLiveCubie: LiveCubieState = {
      definition: oldLiveCubie.definition, // Reference the original definition (it's static)
      currentPosition: oldLiveCubie.currentPosition.clone(), // Clone THREE objects properly
      currentOrientation: oldLiveCubie.currentOrientation.clone(),
    };

    // Check if this cubie is in the U layer and needs transformation
    if (newLiveCubie.currentPosition.y > 0.5) { 
      let result;
      if (move === 'U') {
        result = applyUMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation);
      } else if (move === "U'") {
        result = applyUPrimeMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation);
      } else { // U2
        result = applyU2Move(newLiveCubie.currentPosition, newLiveCubie.currentOrientation);
      }
      // Update the cloned cubie's state
      newLiveCubie.currentPosition = result.position;
      newLiveCubie.currentOrientation = result.orientation;
    }

    // Add the (potentially transformed) cloned cubie to the new state
    newState[id] = newLiveCubie;
  }

  return newState;
}

/**
 * Checks if the D-cross is solved.
 * A cubie is part of the D-cross if its definition ID is D, DL, DR, DF, DB
 * and its currentPosition and currentOrientation match its initialPosition/Orientation.
 */
export function isDCrossSolved(state: RubiksCubeState): boolean {
    const dCrossPieceIds = ['D', 'DL', 'DR', 'DF', 'DB'];
    for (const id of dCrossPieceIds) {
        const piece = state[id];
        if (!piece) return false; // Should not happen

        if (!piece.currentPosition.equals(piece.definition.initialPosition)) {
            return false;
        }
        // For orientations, a small epsilon might be needed for float comparisons
        if (!piece.currentOrientation.equals(piece.definition.initialOrientation)) {
            // Check if it's a 180-degree flip that might still be considered "oriented" for cross
            // This depends on how strict the definition of "oriented cross" is.
            // For simplicity here, we demand exact initial orientation.
            return false;
        }
    }
    return true;
} 