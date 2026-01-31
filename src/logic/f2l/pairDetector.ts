import { RubiksCubeState } from './scramble';
import { COLOR_PAIRS, CubeColor } from '../cubeConstants';
import { isPieceSolved } from './cubeStateUtil';

// Define the structure of a corner piece
export interface Corner {
  id: string; // e.g., "UFL", "DBR"
  colors: string[]; // e.g., ["white", "green", "red"]
  position: string; // Current position in the cube
}

// Define the structure of an edge piece
export interface Edge {
  id: string; // e.g., "UF", "DR"
  colors: string[]; // e.g., ["white", "red"]
  position: string; // Current position in the cube
}

// Define a pair of corner and edge pieces
export interface Pair {
  corner: Corner;
  edge: Edge;
  isSolved: boolean;
}

function getPieceColors(state: RubiksCubeState, pieceId: string): CubeColor[] {
  const piece = state[pieceId];
  if (!piece) return [];
  // sticker colors are absolute and stable
  const colors = piece.definition.stickers.map(s => s.color) as CubeColor[];
  // dedupe
  return Array.from(new Set(colors));
}

function isCorner(state: RubiksCubeState, pieceId: string): boolean {
  const piece = state[pieceId];
  return piece?.definition.type === 'corner';
}

function isEdge(state: RubiksCubeState, pieceId: string): boolean {
  const piece = state[pieceId];
  return piece?.definition.type === 'edge';
}

function isF2LCorner(state: RubiksCubeState, cornerId: string, bottomColor: CubeColor): boolean {
  if (!isCorner(state, cornerId)) return false;
  const colors = getPieceColors(state, cornerId);
  return colors.includes(bottomColor);
}

function isF2LEdge(state: RubiksCubeState, edgeId: string, bottomColor: CubeColor): boolean {
  if (!isEdge(state, edgeId)) return false;
  const topColor = COLOR_PAIRS[bottomColor];
  const colors = getPieceColors(state, edgeId);
  // Middle-layer edges relative to bottom/top are those that include neither bottom nor top.
  return !colors.includes(bottomColor) && !colors.includes(topColor) && colors.length === 2;
}

/**
 * Get the list of valid F2L pairs for a given bottom color.
 */
export function getUnsolvedPairs(state: RubiksCubeState, bottomColor: CubeColor = 'yellow'): Pair[] {
  const topColor = COLOR_PAIRS[bottomColor];

  const corners = Object.keys(state).filter(id => isF2LCorner(state, id, bottomColor));
  const edges = Object.keys(state).filter(id => isF2LEdge(state, id, bottomColor));

  // For each eligible edge, find the unique corner that contains both edge colors + bottomColor
  const pairs: Pair[] = [];
  for (const edgeId of edges) {
    const eColors = getPieceColors(state, edgeId);
    const matchingCorners = corners.filter(cornerId => {
      const cColors = getPieceColors(state, cornerId);
      return cColors.includes(bottomColor) && eColors.every(c => cColors.includes(c));
    });

    if (matchingCorners.length === 1) {
      const cornerId = matchingCorners[0];
      pairs.push({
        corner: { id: cornerId, colors: getPieceColors(state, cornerId), position: cornerId },
        edge: { id: edgeId, colors: eColors, position: edgeId },
        isSolved: false,
      });
    }
  }

  // If something goes weird, return empty rather than lying
  // (UI doesn't depend on this today; it’s mostly for tests/debug).
  if (pairs.length !== 4) {
    // eslint-disable-next-line no-console
    console.warn('[pairDetector] expected 4 F2L pairs but got', pairs.length, { bottomColor, topColor });
  }

  return pairs;
}

/**
 * Check if a corner and edge form a valid F2L pair for the given bottom color.
 * 
 * @param edgeId - The definition ID of the edge piece
 * @param cornerId - The definition ID of the corner piece
 * @param _state - The cube state (reserved for future position-based validation)
 * @param bottomColor - The color on the bottom face (determines which corners are F2L corners)
 * @returns true if the edge and corner form a valid F2L pair
 */
export function isValidPair(
  edgeId: string, 
  cornerId: string, 
  state: RubiksCubeState,
  bottomColor: CubeColor = 'yellow'
): boolean {
  if (!isF2LEdge(state, edgeId, bottomColor)) return false;
  if (!isF2LCorner(state, cornerId, bottomColor)) return false;

  const edgeColors = getPieceColors(state, edgeId);
  const cornerColors = getPieceColors(state, cornerId);
  return edgeColors.every(c => cornerColors.includes(c));
} 

/**
 * Counts fully solved F2L pairs (both the corner + its matching edge are in their solved
 * positions & orientations for the current bottom color).
 */
export function countSolvedF2LPairs(state: RubiksCubeState, bottomColor: CubeColor = 'yellow'): number {
  // Identify the four target pairs by color-composition (bottomColor + edge colors).
  const pairs = getUnsolvedPairs(state, bottomColor);
  let solved = 0;

  for (const pair of pairs) {
    const edge = state[pair.edge.id];
    const corner = state[pair.corner.id];
    if (!edge || !corner) continue;

    if (isPieceSolved(edge) && isPieceSolved(corner)) {
      solved++;
    }
  }

  return solved;
}