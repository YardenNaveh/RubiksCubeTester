import { AllMoves, applyCubeMove, createInitialCubeStateWithFront, LiveCubieState, RubiksCubeState } from '../f2l/cubeStateUtil';
import { ADJACENT_FACES, CubeColor } from '../cubeConstants';
import { computeOrientationColors, isValidBottomFront, randomValidBottomFront } from './orientation';
import { isGoodEdge } from './isGoodEdge';

/**
 * Given a fixed bottom color, returns a random valid front color.
 * Valid front colors are those adjacent to the bottom (not the same or opposite).
 */
function randomValidFrontForBottom(bottom: CubeColor): CubeColor {
  const validFronts = ADJACENT_FACES[bottom];
  return validFronts[Math.floor(Math.random() * validFronts.length)];
}

const ALL_MOVES: AllMoves[] = [
  'U', "U'", 'U2',
  'R', "R'", 'R2',
  'L', "L'", 'L2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
];

function randomMoveAvoidingRepeat(prevBase: string | null): AllMoves {
  while (true) {
    const move = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];
    const base = move.replace(/['2]/g, '');
    if (base !== prevBase) return move;
  }
}

/**
 * Check if both stickers of an edge are visible from the default camera position [3.5, 3.5, 3.5].
 * A sticker is visible if its world-space normal faces toward positive X, Y, or Z
 * (i.e., facing the U, F, or R side of the cube from the camera's perspective).
 */
function isEdgeVisibleFromDefaultCamera(edge: LiveCubieState): boolean {
  const { definition, currentOrientation } = edge;
  
  for (const sticker of definition.stickers) {
    // Transform local normal to world space using current orientation
    const worldNormal = sticker.normal.clone().applyQuaternion(currentOrientation);
    
    // A sticker is visible if its normal points toward the camera (positive x, y, or z)
    // We need it to point strongly enough toward a visible face
    const isVisible = worldNormal.x > 0.5 || worldNormal.y > 0.5 || worldNormal.z > 0.5;
    
    if (!isVisible) {
      return false; // One sticker not visible means the edge isn't fully visible
    }
  }
  
  return true;
}

export interface EdgeKataRoundSettings {
  bottom: CubeColor | 'random';
  front: CubeColor | 'random';
  randomizeEachRound: boolean;
  scrambleMoves: number;
}

export interface EdgeKataRound {
  state: RubiksCubeState;
  highlightedEdgeId: string;
  isGood: boolean;
  explanation: string;
  bottom: CubeColor;
  front: CubeColor;
}

export function generateEdgeKataRound(settings: EdgeKataRoundSettings): EdgeKataRound {
  let bottom: CubeColor;
  let front: CubeColor;

  if (settings.randomizeEachRound || (settings.bottom === 'random' && settings.front === 'random')) {
    // Both random or forced randomization: pick any valid combination
    const rnd = randomValidBottomFront();
    bottom = rnd.bottom;
    front = rnd.front;
  } else if (settings.bottom === 'random') {
    // Bottom is random, front should also be random (UI enforces this)
    const rnd = randomValidBottomFront();
    bottom = rnd.bottom;
    front = rnd.front;
  } else if (settings.front === 'random') {
    // Bottom is fixed, only front is random - pick a valid front for this bottom
    bottom = settings.bottom;
    front = randomValidFrontForBottom(bottom);
  } else {
    // Both are specific colors
    bottom = settings.bottom;
    front = settings.front;
    if (!isValidBottomFront(bottom, front)) {
      // Invalid combination - fall back to random
      const rnd = randomValidBottomFront();
      bottom = rnd.bottom;
      front = rnd.front;
    }
  }

  const orientation = computeOrientationColors(bottom, front);

  // Start in the user-selected orientation
  let state = createInitialCubeStateWithFront(bottom, front);

  // Apply a scramble
  let prevBase: string | null = null;
  for (let i = 0; i < settings.scrambleMoves; i++) {
    const move = randomMoveAvoidingRepeat(prevBase);
    prevBase = move.replace(/['2]/g, '');
    state = applyCubeMove(state, move);
  }

  // Get all edges and filter to only those with both stickers visible from default camera
  const allEdgeIds = Object.keys(state).filter(id => state[id].definition.type === 'edge');
  const visibleEdgeIds = allEdgeIds.filter(id => isEdgeVisibleFromDefaultCamera(state[id]));
  
  // If no edges are visible (unlikely), fall back to all edges
  const candidateIds = visibleEdgeIds.length > 0 ? visibleEdgeIds : allEdgeIds;
  
  const highlightedEdgeId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
  const edge = state[highlightedEdgeId];

  const res = isGoodEdge(edge, orientation);

  return {
    state,
    highlightedEdgeId,
    isGood: res.isGood,
    explanation: res.explanation,
    bottom,
    front,
  };
}

