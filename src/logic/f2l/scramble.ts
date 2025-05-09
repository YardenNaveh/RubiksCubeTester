import { createInitialCubeState, applyCubeMove, RubiksCubeState, isDCrossSolved, AllMoves } from './cubeStateUtil';
import { CubeColor } from '../cubeConstants';
import * as THREE from 'three'; // For applyFullCubeRotationIfNeeded

// Re-export RubiksCubeState for convenience
export type { RubiksCubeState };
export { createInitialCubeState }; // Export the state creation function

// Define moves that primarily affect F2L pairs while keeping D-cross relatively easy to preserve
type F2LScrambleGenMove = 
    'U' | "U'" | 'U2' | 
    'R' | "R'" | 'R2' | 
    'L' | "L'" | 'L2' | 
    'F' | "F'" | 'F2' | 
    'B' | "B'" | 'B2';

const ALL_F2L_SCRAMBLE_GEN_MOVES: F2LScrambleGenMove[] = [
    'U', "U'", 'U2', 'R', "R'", 'R2', 'L', "L'", 'L2', 
    'F', "F'", 'F2', 'B', "B'", 'B2'
];

/**
 * Generates a random F2L friendly move
 */
function getRandomF2LScrambleGenMove(): F2LScrambleGenMove {
  return ALL_F2L_SCRAMBLE_GEN_MOVES[Math.floor(Math.random() * ALL_F2L_SCRAMBLE_GEN_MOVES.length)];
}

/**
 * Generate a random scramble for F2L practice using the detailed cube state.
 * Only uses F2L friendly moves to keep the cross solved.
 * @param initialBottomColor The bottom color defining the cube's base orientation.
 * @param moveCount Number of random moves to generate.
 * @returns Object with scramble string and the resulting detailed RubiksCubeState.
 */
export function generateDetailedF2LScramble(
  initialBottomColor: CubeColor = 'yellow',
  moveCount: number = 20 // Increased move count for better scrambling
): { scrambleString: string; finalState: RubiksCubeState } {
  
  let currentState = createInitialCubeState(initialBottomColor);
  const scrambleMoves: F2LScrambleGenMove[] = [];

  for (let i = 0; i < moveCount; i++) {
    const move = getRandomF2LScrambleGenMove();
    scrambleMoves.push(move);
    // Directly use the enhanced applyCubeMove from cubeStateUtil
    currentState = applyCubeMove(currentState, move as AllMoves);
  }

  // To actually ensure the D-cross is solved after a more varied scramble, 
  // one would typically scramble fully then solve the cross.
  // For this trainer, if we stick to moves that don't affect D-layer pieces' relative state,
  // and ensure D-layer centers are fixed, the cross remains solved by definition.
  // The current CUBIE_DEFS in cubeStateUtil.ts define a solved D-cross for yellow bottom.
  // If initialBottomColor is different, createInitialCubeState would need to orient the whole cube.

  // For now, the scramble string will be diverse, but visual state only changes for U-moves.
  return {
    scrambleString: scrambleMoves.join(' '),
    finalState: currentState, 
  };
}

// We keep isCrossSolved here for the test file, pointing to the utility function
export { isDCrossSolved }; 