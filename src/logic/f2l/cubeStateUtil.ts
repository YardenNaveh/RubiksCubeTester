import * as THREE from 'three';
import {
  CubieDefinition,
  applyUMove,
  applyUPrimeMove,
  applyU2Move,
  applyRMove,
  applyRPrimeMove,
  applyR2Move,
  applyLMove,
  applyLPrimeMove,
  applyL2Move,
  applyFMove,
  applyFPrimeMove,
  applyF2Move,
  applyBMove,
  applyBPrimeMove,
  applyB2Move,
  applyWCxMove,
  applyWCxPrimeMove,
  applyWCx2Move,
  applyWCyMove,
  applyWCyPrimeMove,
  applyWCy2Move,
  applyWCzMove,
  applyWCzPrimeMove,
  applyWCz2Move,
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
  
  // Default CUBIE_DEFS assume:
  // U: white (+Y), D: yellow (-Y)
  // F: red (+Z),   B: orange (-Z)
  // L: green (-X), R: blue (+X)

  let rotationFn: ((pos: THREE.Vector3, ori: THREE.Quaternion) => { position: THREE.Vector3; orientation: THREE.Quaternion }) | null = null;

  // Determine the whole-cube rotation needed to bring the selected bottomColor to the world -Y axis (D face)
  // The CUBIE_DEFS are defined with 'yellow' already on the D face (-Y).
  if (bottomColor === 'white') { // white is default U (+Y), needs to go to D (-Y)
    rotationFn = applyWCx2Move;    // Rotate 180 degrees around X-axis (Y -> -Y, Z -> -Z)
  } else if (bottomColor === 'red') { // red is default F (+Z), needs to go to D (-Y)
    rotationFn = applyWCxPrimeMove; // Rotate +90 degrees around X-axis (Z -> -Y)
  } else if (bottomColor === 'blue') { // blue is default R (+X), needs to go to D (-Y)
    rotationFn = applyWCzMove;      // Corrected: applyWCzMove is -PI/2 rotation, +X -> -Y
  } else if (bottomColor === 'orange') { // orange is default B (-Z), needs to go to D (-Y)
    rotationFn = applyWCxMove;      // Rotate -90 degrees around X-axis (-Z -> -Y)
  } else if (bottomColor === 'green') { // green is default L (-X), needs to go to D (-Y)
    rotationFn = applyWCzPrimeMove; // Corrected: applyWCzPrimeMove is +PI/2 rotation, -X -> -Y
  }
  // If bottomColor is 'yellow', no rotationFn is set, so no transformation applied.

  CUBIE_DEFS.forEach(def => {
    let currentPosition = def.initialPosition.clone();
    let currentOrientation = def.initialOrientation.clone();

    if (rotationFn) {
      const rotated = rotationFn(currentPosition, currentOrientation);
      currentPosition = rotated.position;
      currentOrientation = rotated.orientation;
    }
    
    // The sticker colors are absolute ('white', 'red', etc.) and are part of the definition.
    // They rotate with the piece. The 'face' property (U, D, F, etc.) in CubieSticker
    // still refers to the logical face of the piece in its *original* solved state definition,
    // not its *new* orientation after whole-cube rotation. This is important for identification.
    // For rendering, the `currentPosition` and `currentOrientation` of the cubie, combined with
    // the sticker's `normal` vector (in local cubie space), will determine its final world orientation.

    // We need to be careful: `def` is from CUBIE_DEFS and should remain pristine.
    // We create a *new* definition-like object for the live state if we were to change sticker colors/faces.
    // However, for now, we are only changing the initial pose of the cubies.
    // The `definition` field in `LiveCubieState` should arguably refer to the *original* CUBIE_DEFS item,
    // so that `isDCrossSolved` (which compares to `piece.definition.initialPosition`) still works
    // relative to the *selected bottom color's solved state*.

    // Let's adjust what `isDCrossSolved` compares against.
    // The `initialPosition` and `initialOrientation` stored in `LiveCubieState`'s `definition`
    // should be the *transformed* ones if a rotation was applied.

    const effectiveDefinition: CubieDefinition = {
      ...def,
      // Store the rotated position/orientation as the "initial" for this specific cube instance
      initialPosition: currentPosition.clone(), 
      initialOrientation: currentOrientation.clone(),
      // Stickers remain the same, their colors are fixed.
      // Their normals are also in local space, so they don't change with whole-cube rotation.
      stickers: def.stickers.map(s => ({ ...s, normal: s.normal.clone()})),
    };

    state[def.id] = {
      // definition: def, // Original definition, before whole-cube rotation
      definition: effectiveDefinition, // Definition as it appears in the solved state for THIS bottomColor
      currentPosition: currentPosition.clone(), // This is now the same as effectiveDefinition.initialPosition
      currentOrientation: currentOrientation.clone(), // Same as effectiveDefinition.initialOrientation
    };
  });
  return state;
}

export type AllMoves = 
  'U' | "U'" | 'U2' | 
  'R' | "R'" | 'R2' | 
  'L' | "L'" | 'L2' | 
  'F' | "F'" | 'F2' | 
  'B' | "B'" | 'B2'; // Extendable to D, M, E, S, x, y, z etc.

export function applyCubeMove(state: RubiksCubeState, move: AllMoves): RubiksCubeState {
  const newState: RubiksCubeState = {};

  for (const id in state) {
    const oldLiveCubie = state[id];
    const newLiveCubie: LiveCubieState = {
      definition: oldLiveCubie.definition,
      currentPosition: oldLiveCubie.currentPosition.clone(),
      currentOrientation: oldLiveCubie.currentOrientation.clone(),
    };

    let transformed = false;
    let result = { position: newLiveCubie.currentPosition, orientation: newLiveCubie.currentOrientation };

    // Determine which pieces are affected by the move and apply transformation
    // The condition for being in a layer needs to be precise (e.g., > 0.5 for U, < -0.5 for D based on positions)
    if ((move.startsWith('U') && newLiveCubie.currentPosition.y > 0.5) ||
        (move.startsWith('R') && newLiveCubie.currentPosition.x > 0.5) ||
        (move.startsWith('L') && newLiveCubie.currentPosition.x < -0.5) ||
        (move.startsWith('F') && newLiveCubie.currentPosition.z > 0.5) ||
        (move.startsWith('B') && newLiveCubie.currentPosition.z < -0.5)) {
      
      transformed = true;
      switch (move) {
        case 'U': result = applyUMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case "U'": result = applyUPrimeMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'U2': result = applyU2Move(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'R': result = applyRMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case "R'": result = applyRPrimeMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'R2': result = applyR2Move(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'L': result = applyLMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case "L'": result = applyLPrimeMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'L2': result = applyL2Move(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'F': result = applyFMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case "F'": result = applyFPrimeMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'F2': result = applyF2Move(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'B': result = applyBMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case "B'": result = applyBPrimeMove(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
        case 'B2': result = applyB2Move(newLiveCubie.currentPosition, newLiveCubie.currentOrientation); break;
      }
    }

    if (transformed) {
      newLiveCubie.currentPosition = result.position;
      newLiveCubie.currentOrientation = result.orientation;
    }
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

        // Now we compare current state to the initial state defined for the *current bottomColor orientation*
        if (!piece.currentPosition.equals(piece.definition.initialPosition)) {
            return false;
        }
        if (!piece.currentOrientation.equals(piece.definition.initialOrientation)) {
            return false;
        }
    }
    return true;
} 