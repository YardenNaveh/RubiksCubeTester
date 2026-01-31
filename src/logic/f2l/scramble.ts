import { createInitialCubeState, applyCubeMove, RubiksCubeState, isDCrossSolved, AllMoves } from './cubeStateUtil';
import { CubeColor } from '../cubeConstants';
import { countSolvedF2LPairs } from './pairDetector';

// Re-export RubiksCubeState for convenience
export type { RubiksCubeState };
export { createInitialCubeState }; // Export the state creation function

type UVariation = 'U' | "U'" | 'U2';
type SetupMove = 'R' | "R'" | 'L' | "L'" | 'F' | "F'" | 'B' | "B'";

const U_VARIATIONS: UVariation[] = ['U', "U'", 'U2'];
const SETUP_MOVES: SetupMove[] = ['R', "R'", 'L', "L'", 'F', "F'", 'B', "B'"];

function getRandomUMove(): UVariation {
  return U_VARIATIONS[Math.floor(Math.random() * U_VARIATIONS.length)];
}

function getRandomSetupMove(): SetupMove {
  return SETUP_MOVES[Math.floor(Math.random() * SETUP_MOVES.length)];
}

function inverseMove(move: SetupMove): SetupMove {
  // For quarter turns only (we only use these as setup moves)
  return move.endsWith("'") ? (move.slice(0, -1) as SetupMove) : ((move + "'") as SetupMove);
}

/**
 * Simplifies consecutive moves by canceling/combining where possible.
 * e.g., U U -> U2, U U' -> (nothing), R R' -> (nothing)
 */
function simplifyMoves(moves: AllMoves[]): AllMoves[] {
  if (moves.length < 2) return moves;
  
  const result: AllMoves[] = [];
  
  for (const move of moves) {
    if (result.length === 0) {
      result.push(move);
      continue;
    }
    
    const lastMove = result[result.length - 1];
    const lastBase = lastMove.replace(/['2]/g, '');
    const currentBase = move.replace(/['2]/g, '');
    
    // Only combine moves on the same face
    if (lastBase !== currentBase) {
      result.push(move);
      continue;
    }
    
    // Calculate total rotation
    const getRotation = (m: string): number => {
      if (m.includes('2')) return 2;
      if (m.includes("'")) return 3; // -1 mod 4 = 3
      return 1;
    };
    
    const totalRotation = (getRotation(lastMove) + getRotation(move)) % 4;
    
    // Remove last move and add combined result
    result.pop();
    
    if (totalRotation === 0) {
      // Moves cancel out - don't add anything
    } else if (totalRotation === 1) {
      result.push(currentBase as AllMoves);
    } else if (totalRotation === 2) {
      result.push((currentBase + '2') as AllMoves);
    } else if (totalRotation === 3) {
      result.push((currentBase + "'") as AllMoves);
    }
  }
  
  return result;
}

/**
 * Generate a random scramble for F2L practice using the detailed cube state.
 * Uses cross-preserving conjugate patterns so it stays fast and works for all bottom colors.
 * @param initialBottomColor The bottom color defining the cube's base orientation.
 * @param moveCount Approximate number of moves to generate.
 * @returns Object with scramble string and the resulting detailed RubiksCubeState.
 */
export function generateDetailedF2LScramble(
  initialBottomColor: CubeColor = 'yellow',
  moveCount: number = 20
): { scrambleString: string; finalState: RubiksCubeState } {
  
  // Rejection-sampling: generate cross-solved scrambles until none of the 4 F2L pairs
  // are already fully solved (corner+edge both solved).
  const maxAttempts = 200;

  let best: { moves: AllMoves[]; state: RubiksCubeState; solvedPairs: number } | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let currentState = createInitialCubeState(initialBottomColor);
    const moves: AllMoves[] = [];

    while (moves.length < moveCount) {
      const setup = getRandomSetupMove();
      const inv = inverseMove(setup);

      // 1–3 U moves inside the conjugate
      const insideCount = 1 + Math.floor(Math.random() * 3);
      moves.push(setup);
      for (let i = 0; i < insideCount; i++) moves.push(getRandomUMove());
      moves.push(inv);

      // 50% chance to add an extra U between conjugates to increase variety
      if (Math.random() < 0.5 && moves.length < moveCount) moves.push(getRandomUMove());
    }

    const simplifiedMoves = simplifyMoves(moves).slice(0, Math.max(1, moveCount));

    for (const move of simplifiedMoves) {
      currentState = applyCubeMove(currentState, move);
    }

    // Safety: cross should remain solved
    if (!isDCrossSolved(currentState, initialBottomColor)) continue;

    const solvedPairs = countSolvedF2LPairs(currentState, initialBottomColor);
    if (!best || solvedPairs < best.solvedPairs) {
      best = { moves: simplifiedMoves, state: currentState, solvedPairs };
      // Early exit if perfect.
      if (solvedPairs === 0) {
        return { scrambleString: simplifiedMoves.join(' '), finalState: currentState };
      }
    }
  }

  // Fallback: return the best attempt we found.
  if (best) {
    return { scrambleString: best.moves.join(' '), finalState: best.state };
  }

  // Extreme fallback: do nothing
  const state = createInitialCubeState(initialBottomColor);
  return { scrambleString: '', finalState: state };
}

// We keep isCrossSolved here for the test file, pointing to the utility function
export { isDCrossSolved }; 