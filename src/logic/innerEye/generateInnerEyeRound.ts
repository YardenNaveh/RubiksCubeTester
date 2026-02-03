import { 
  AllMoves, 
  applyCubeMove, 
  createInitialCubeState, 
  RubiksCubeState,
  isPieceSolved 
} from '../f2l/cubeStateUtil';
import { CubeColor, COLORS, COLOR_PAIRS } from '../cubeConstants';
import { DifficultyLevel, PieceType } from '../../state/innerEyeStore';

export interface InnerEyeRound {
  state: RubiksCubeState;
  difficulty: DifficultyLevel;
  hiddenPieceId: string;
  hiddenPieceType: PieceType;
  hiddenPieceColors: CubeColor[]; // The correct colors the user must identify
  hiddenPieceDescription: string; // e.g., "edge" or "corner"
}

// Define which F2L pairs correspond to front and back slots
// Front slots: DFR (corner) + FR (edge), DFL (corner) + FL (edge)
// Back slots: DBR (corner) + BR (edge), DBL (corner) + BL (edge)
interface F2LSlot {
  cornerId: string;
  edgeId: string;
  isFront: boolean;
}

// U moves for cross-preserving scrambles
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
  return move.endsWith("'") ? (move.slice(0, -1) as SetupMove) : ((move + "'") as SetupMove);
}

/**
 * Get all edge IDs that form the cross for the bottom color
 */
function getCrossEdgeIds(bottomColor: CubeColor): string[] {
  // The cross edges are the 4 edges adjacent to the bottom center
  // For yellow bottom (default), these are DF, DR, DB, DL
  // The color mapping is:
  // Yellow(D) -> DF, DR, DB, DL
  // White(U) -> UF, UR, UB, UL
  // etc.
  
  // Since our cube state uses piece IDs based on solved position, we need to find
  // which edges contain the bottom color
  const crossEdges: Record<CubeColor, string[]> = {
    'yellow': ['DF', 'DR', 'DB', 'DL'],
    'white': ['UF', 'UR', 'UB', 'UL'],
    'red': ['UF', 'DF', 'FR', 'FL'],
    'orange': ['UB', 'DB', 'BR', 'BL'],
    'blue': ['UR', 'DR', 'FR', 'BR'],
    'green': ['UL', 'DL', 'FL', 'BL'],
  };
  return crossEdges[bottomColor] || crossEdges['yellow'];
}

/**
 * Get F2L slots configuration based on bottom color
 */
function getF2LSlotsForBottom(bottomColor: CubeColor): F2LSlot[] {
  // F2L slots are the 4 corner+edge pairs in the first two layers
  // For each bottom color, we need different slots
  
  const slotsMap: Record<CubeColor, F2LSlot[]> = {
    'yellow': [
      { cornerId: 'DFR', edgeId: 'FR', isFront: true },
      { cornerId: 'DFL', edgeId: 'FL', isFront: true },
      { cornerId: 'DBR', edgeId: 'BR', isFront: false },
      { cornerId: 'DBL', edgeId: 'BL', isFront: false },
    ],
    'white': [
      { cornerId: 'UFR', edgeId: 'FR', isFront: true },
      { cornerId: 'UFL', edgeId: 'FL', isFront: true },
      { cornerId: 'UBR', edgeId: 'BR', isFront: false },
      { cornerId: 'UBL', edgeId: 'BL', isFront: false },
    ],
    'red': [
      { cornerId: 'UFR', edgeId: 'UR', isFront: true },
      { cornerId: 'UFL', edgeId: 'UL', isFront: true },
      { cornerId: 'DFR', edgeId: 'DR', isFront: false },
      { cornerId: 'DFL', edgeId: 'DL', isFront: false },
    ],
    'orange': [
      { cornerId: 'UBR', edgeId: 'UR', isFront: true },
      { cornerId: 'UBL', edgeId: 'UL', isFront: true },
      { cornerId: 'DBR', edgeId: 'DR', isFront: false },
      { cornerId: 'DBL', edgeId: 'DL', isFront: false },
    ],
    'blue': [
      { cornerId: 'UFR', edgeId: 'UF', isFront: true },
      { cornerId: 'UBR', edgeId: 'UB', isFront: true },
      { cornerId: 'DFR', edgeId: 'DF', isFront: false },
      { cornerId: 'DBR', edgeId: 'DB', isFront: false },
    ],
    'green': [
      { cornerId: 'UFL', edgeId: 'UF', isFront: true },
      { cornerId: 'UBL', edgeId: 'UB', isFront: true },
      { cornerId: 'DFL', edgeId: 'DF', isFront: false },
      { cornerId: 'DBL', edgeId: 'DB', isFront: false },
    ],
  };
  
  return slotsMap[bottomColor] || slotsMap['yellow'];
}

/**
 * Check if a piece is in its solved position and orientation
 */
function isPieceInSolvedPosition(state: RubiksCubeState, pieceId: string): boolean {
  const piece = state[pieceId];
  if (!piece) return false;
  return isPieceSolved(piece);
}

/**
 * Simplifies consecutive moves by canceling/combining where possible.
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
    
    if (lastBase !== currentBase) {
      result.push(move);
      continue;
    }
    
    const getRotation = (m: string): number => {
      if (m.includes('2')) return 2;
      if (m.includes("'")) return 3;
      return 1;
    };
    
    const totalRotation = (getRotation(lastMove) + getRotation(move)) % 4;
    
    result.pop();
    
    if (totalRotation === 0) {
      // Moves cancel out
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
 * Generate a scrambled cube state with cross solved and specific F2L pairs solved
 * based on difficulty level.
 * 
 * Uses cross-preserving conjugate patterns (setup-U-unsetup) to scramble
 * while keeping the cross intact.
 * 
 * Difficulty levels:
 * - Level 1: cross + 3 F2L pairs (2 front, 1 back) - easiest
 * - Level 2: cross + 2 front F2L pairs
 * - Level 3: cross + 1 front F2L pair
 * - Level 4: only cross solved - hardest
 */
function generateCubeState(
  bottomColor: CubeColor,
  difficulty: DifficultyLevel,
  maxAttempts: number = 300
): RubiksCubeState {
  const f2lSlots = getF2LSlotsForBottom(bottomColor);
  
  // Determine how many pairs should be solved based on difficulty
  // For easier levels, we want more pairs solved
  // For harder levels, we want fewer pairs solved
  let minFrontPairs: number;
  let maxFrontPairs: number;
  let minBackPairs: number;
  let maxBackPairs: number;
  
  switch (difficulty) {
    case 1: // cross + 3 F2L (easiest)
      minFrontPairs = 2;
      maxFrontPairs = 2;
      minBackPairs = 1;
      maxBackPairs = 2;
      break;
    case 2: // cross + 2 F2L pairs
      minFrontPairs = 1;
      maxFrontPairs = 2;
      minBackPairs = 0;
      maxBackPairs = 1;
      break;
    case 3: // cross + 1 F2L pair
      minFrontPairs = 0;
      maxFrontPairs = 1;
      minBackPairs = 0;
      maxBackPairs = 1;
      break;
    case 4: // only cross (hardest)
    default:
      minFrontPairs = 0;
      maxFrontPairs = 0;
      minBackPairs = 0;
      maxBackPairs = 0;
      break;
  }
  
  // Track the best state found
  let bestState: RubiksCubeState | null = null;
  let bestScore = -1;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let state = createInitialCubeState(bottomColor);
    const moves: AllMoves[] = [];
    
    // Number of conjugates to apply (more for harder difficulties)
    const numConjugates = difficulty === 4 ? 8 + Math.floor(Math.random() * 6) :
                          difficulty === 3 ? 6 + Math.floor(Math.random() * 5) :
                          difficulty === 2 ? 4 + Math.floor(Math.random() * 4) :
                                             2 + Math.floor(Math.random() * 3);
    
    // Apply cross-preserving conjugates
    for (let i = 0; i < numConjugates; i++) {
      const setup = getRandomSetupMove();
      const inv = inverseMove(setup);
      
      // Apply: setup, U-moves, inverse
      moves.push(setup);
      const numUMoves = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numUMoves; j++) {
        moves.push(getRandomUMove());
      }
      moves.push(inv);
      
      // Sometimes add an extra U between conjugates
      if (Math.random() < 0.4) {
        moves.push(getRandomUMove());
      }
    }
    
    // Simplify and apply moves
    const simplifiedMoves = simplifyMoves(moves);
    for (const move of simplifiedMoves) {
      state = applyCubeMove(state, move);
    }
    
    // Count solved F2L pairs
    let solvedFrontPairs = 0;
    let solvedBackPairs = 0;
    
    for (const slot of f2lSlots) {
      const cornerSolved = isPieceInSolvedPosition(state, slot.cornerId);
      const edgeSolved = isPieceInSolvedPosition(state, slot.edgeId);
      
      if (cornerSolved && edgeSolved) {
        if (slot.isFront) {
          solvedFrontPairs++;
        } else {
          solvedBackPairs++;
        }
      }
    }
    
    // Check if this state matches our difficulty criteria
    const frontOk = solvedFrontPairs >= minFrontPairs && solvedFrontPairs <= maxFrontPairs;
    const backOk = solvedBackPairs >= minBackPairs && solvedBackPairs <= maxBackPairs;
    const totalPairs = solvedFrontPairs + solvedBackPairs;
    
    if (frontOk && backOk) {
      return state;
    }
    
    // Track best state as fallback
    // Score based on how close we are to target
    const targetTotal = (minFrontPairs + maxFrontPairs) / 2 + (minBackPairs + maxBackPairs) / 2;
    const score = -Math.abs(totalPairs - targetTotal);
    
    if (score > bestScore) {
      bestScore = score;
      bestState = state;
    }
  }
  
  // Return best state found, or solved cube as last resort
  if (bestState) {
    return bestState;
  }
  
  console.warn('Could not generate valid state for difficulty', difficulty);
  return createInitialCubeState(bottomColor);
}

/**
 * Get all valid pieces that can be hidden (F2L edges and corners only)
 * F2L pieces are those without a U color sticker
 * Excludes pieces that are part of the cross or solved F2L pairs
 */
function getHideablePieces(
  state: RubiksCubeState, 
  bottomColor: CubeColor
): { id: string; type: PieceType }[] {
  const crossEdges = new Set(getCrossEdgeIds(bottomColor));
  const f2lSlots = getF2LSlotsForBottom(bottomColor);
  
  // U color is opposite of bottom
  const uColor = COLOR_PAIRS[bottomColor];
  
  // Get solved F2L piece IDs
  const solvedF2LPieces = new Set<string>();
  for (const slot of f2lSlots) {
    const cornerSolved = isPieceInSolvedPosition(state, slot.cornerId);
    const edgeSolved = isPieceInSolvedPosition(state, slot.edgeId);
    
    if (cornerSolved && edgeSolved) {
      solvedF2LPieces.add(slot.cornerId);
      solvedF2LPieces.add(slot.edgeId);
    }
  }
  
  // Collect all hideable pieces (F2L pieces only - no U color)
  const hideablePieces: { id: string; type: PieceType }[] = [];
  
  for (const id in state) {
    const piece = state[id];
    if (!piece) continue;
    
    const { type, stickers } = piece.definition;
    
    // Skip centers
    if (type === 'center') continue;
    
    // Skip cross edges
    if (crossEdges.has(id)) continue;
    
    // Skip solved F2L pieces
    if (solvedF2LPieces.has(id)) continue;
    
    // Skip pieces with U color sticker (not F2L pieces)
    const hasUColor = stickers.some(s => s.color === uColor);
    if (hasUColor) continue;
    
    // Add to hideable list
    hideablePieces.push({
      id,
      type: type as PieceType,
    });
  }
  
  return hideablePieces;
}

/**
 * Get the colors of a piece from its definition
 */
function getPieceColors(state: RubiksCubeState, pieceId: string): CubeColor[] {
  const piece = state[pieceId];
  if (!piece) return [];
  return piece.definition.stickers.map(s => s.color);
}

/**
 * Generate a description for the hidden piece type
 */
function getPieceDescription(type: PieceType): string {
  return type === 'edge' ? 'edge piece (2 colors)' : 'corner piece (3 colors)';
}

/**
 * Generate a single round of the Inner Eye Deduction game
 */
export function generateInnerEyeRound(
  bottomColor: CubeColor,
  difficulty: DifficultyLevel
): InnerEyeRound {
  // Generate a valid cube state for this difficulty
  const state = generateCubeState(bottomColor, difficulty);
  
  // Get all pieces we can hide
  const hideablePieces = getHideablePieces(state, bottomColor);
  
  if (hideablePieces.length === 0) {
    // Fallback: shouldn't happen with proper state generation
    console.warn('No hideable pieces found');
    // Pick any non-center piece
    const allPieces = Object.values(state)
      .filter(p => p.definition.type !== 'center')
      .map(p => ({ id: p.definition.id, type: p.definition.type as PieceType }));
    
    const fallbackPiece = allPieces[Math.floor(Math.random() * allPieces.length)];
    return {
      state,
      difficulty,
      hiddenPieceId: fallbackPiece.id,
      hiddenPieceType: fallbackPiece.type,
      hiddenPieceColors: getPieceColors(state, fallbackPiece.id),
      hiddenPieceDescription: getPieceDescription(fallbackPiece.type),
    };
  }
  
  // Randomly select a piece to hide
  const selectedPiece = hideablePieces[Math.floor(Math.random() * hideablePieces.length)];
  
  return {
    state,
    difficulty,
    hiddenPieceId: selectedPiece.id,
    hiddenPieceType: selectedPiece.type,
    hiddenPieceColors: getPieceColors(state, selectedPiece.id),
    hiddenPieceDescription: getPieceDescription(selectedPiece.type),
  };
}

/**
 * Check if the user's answer is correct
 * For edges: 2 colors must match (order matters for specific sticker faces)
 * For corners: 3 colors must match (order matters for specific sticker faces)
 * 
 * We use a simpler check: colors must be the same set
 */
export function checkAnswer(
  round: InnerEyeRound,
  userColors: CubeColor[]
): { isCorrect: boolean; correctColors: CubeColor[]; explanation?: string } {
  const correctColors = round.hiddenPieceColors;
  
  // For this game, we check if user selected the correct colors (as a set)
  // This is because the user might not know the exact orientation
  const correctSet = new Set(correctColors);
  const userSet = new Set(userColors);
  
  // Check length first
  if (userColors.length !== correctColors.length) {
    return {
      isCorrect: false,
      correctColors,
      explanation: `Expected ${correctColors.length} colors, but got ${userColors.length}.`,
    };
  }
  
  // Check if sets match
  const isCorrect = correctColors.every(c => userSet.has(c)) && 
                    userColors.every(c => correctSet.has(c));
  
  if (!isCorrect) {
    // Generate explanation
    const missingColors = correctColors.filter(c => !userSet.has(c));
    const extraColors = userColors.filter(c => !correctSet.has(c));
    
    let explanation = '';
    if (missingColors.length > 0) {
      explanation += `Missing: ${missingColors.join(', ')}. `;
    }
    if (extraColors.length > 0) {
      explanation += `Incorrect: ${extraColors.join(', ')}.`;
    }
    
    return {
      isCorrect: false,
      correctColors,
      explanation: explanation.trim() || 'The colors do not match.',
    };
  }
  
  return {
    isCorrect: true,
    correctColors,
  };
}

/**
 * Validate that two colors can exist on the same piece
 * (they must not be opposites)
 */
export function areColorsValidTogether(colors: CubeColor[]): boolean {
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      if (COLOR_PAIRS[colors[i]] === colors[j]) {
        return false; // Opposite colors can't be on the same piece
      }
    }
  }
  return true;
}

/**
 * Get all possible color combinations for an edge or corner
 * that are physically valid on a Rubik's cube
 */
export function getValidColorCombinations(pieceType: PieceType): CubeColor[][] {
  const combinations: CubeColor[][] = [];
  
  if (pieceType === 'edge') {
    // Edges have 2 colors, which must not be opposites
    for (let i = 0; i < COLORS.length; i++) {
      for (let j = i + 1; j < COLORS.length; j++) {
        if (COLOR_PAIRS[COLORS[i]] !== COLORS[j]) {
          combinations.push([COLORS[i], COLORS[j]]);
        }
      }
    }
  } else {
    // Corners have 3 colors, none of which can be opposites
    for (let i = 0; i < COLORS.length; i++) {
      for (let j = i + 1; j < COLORS.length; j++) {
        if (COLOR_PAIRS[COLORS[i]] === COLORS[j]) continue;
        for (let k = j + 1; k < COLORS.length; k++) {
          if (COLOR_PAIRS[COLORS[i]] === COLORS[k]) continue;
          if (COLOR_PAIRS[COLORS[j]] === COLORS[k]) continue;
          combinations.push([COLORS[i], COLORS[j], COLORS[k]]);
        }
      }
    }
  }
  
  return combinations;
}
