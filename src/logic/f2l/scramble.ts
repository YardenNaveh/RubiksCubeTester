import { createInitialCubeState, applyCubeMove, RubiksCubeState, isDCrossSolved } from './cubeStateUtil';
import { CubeColor } from '../cubeConstants';

// Re-export RubiksCubeState for convenience
export type { RubiksCubeState };
export { createInitialCubeState }; // Export the state creation function

// Define valid moves for this scrambler
type F2LScrambleMove = 'U' | "U'" | 'U2';

/**
 * Generates a random U-layer move
 */
function getRandomULayerMove(): F2LScrambleMove {
  const moves: F2LScrambleMove[] = ['U', "U'", 'U2'];
  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex];
}

/**
 * Generate a random scramble for F2L practice using the detailed cube state.
 * Only uses U-layer moves to keep the cross solved.
 * @param initialBottomColor The bottom color defining the cube's base orientation.
 * @param moveCount Number of random moves to generate.
 * @returns Object with scramble string and the resulting detailed RubiksCubeState.
 */
export function generateDetailedF2LScramble(
  initialBottomColor: CubeColor = 'yellow',
  moveCount: number = 20
): { scrambleString: string; finalState: RubiksCubeState } {
  
  let currentState = createInitialCubeState(initialBottomColor);
  const scrambleMoves: F2LScrambleMove[] = [];

  // Apply random U-layer moves
  for (let i = 0; i < moveCount; i++) {
    const move = getRandomULayerMove();
    scrambleMoves.push(move);
    currentState = applyCubeMove(currentState, move);
  }

  return {
    scrambleString: scrambleMoves.join(' '),
    finalState: currentState, // Return the actual state after moves
  };
}

// We keep isCrossSolved here for the test file, pointing to the utility function
export { isDCrossSolved }; 