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
 * Generate a scrambled cube state with cross solved and specific F2L pairs solved
 * based on difficulty level.
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
  maxAttempts: number = 500
): RubiksCubeState {
  const crossEdges = getCrossEdgeIds(bottomColor);
  const f2lSlots = getF2LSlotsForBottom(bottomColor);
  
  // Determine how many pairs should be solved based on difficulty
  let targetFrontPairs: number;
  let targetBackPairs: number;
  
  switch (difficulty) {
    case 1: // cross + 3 F2L (2 front, 1 back)
      targetFrontPairs = 2;
      targetBackPairs = 1;
      break;
    case 2: // cross + 2 front F2L
      targetFrontPairs = 2;
      targetBackPairs = 0;
      break;
    case 3: // cross + 1 front F2L
      targetFrontPairs = 1;
      targetBackPairs = 0;
      break;
    case 4: // only cross
    default:
      targetFrontPairs = 0;
      targetBackPairs = 0;
      break;
  }
  
  // Generate states until we find one that matches our criteria
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let state = createInitialCubeState(bottomColor);
    
    // Apply random moves to scramble
    const numMoves = 15 + Math.floor(Math.random() * 10);
    let prevBase: string | null = null;
    
    for (let i = 0; i < numMoves; i++) {
      const move = randomMoveAvoidingRepeat(prevBase);
      prevBase = move.replace(/['2]/g, '');
      state = applyCubeMove(state, move);
    }
    
    // Check cross is solved
    const crossSolved = crossEdges.every(id => isPieceInSolvedPosition(state, id));
    if (!crossSolved) continue;
    
    // Check the D center (or relevant center for bottom) is in place
    // For a proper cross, the bottom center must also be solved
    // Since centers don't move, this is always true
    
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
    // We want exactly the target number of pairs, not more
    if (solvedFrontPairs === targetFrontPairs && solvedBackPairs === targetBackPairs) {
      return state;
    }
  }
  
  // Fallback: return a solved cube with only cross visible
  // This should rarely happen
  console.warn('Could not generate valid state for difficulty', difficulty);
  return createInitialCubeState(bottomColor);
}

/**
 * Get all valid pieces that can be hidden (edges and corners, not centers)
 * Excludes pieces that are part of the cross or solved F2L pairs
 */
function getHideablePieces(
  state: RubiksCubeState, 
  bottomColor: CubeColor
): { id: string; type: PieceType }[] {
  const crossEdges = new Set(getCrossEdgeIds(bottomColor));
  const f2lSlots = getF2LSlotsForBottom(bottomColor);
  
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
  
  // Collect all hideable pieces
  const hideablePieces: { id: string; type: PieceType }[] = [];
  
  for (const id in state) {
    const piece = state[id];
    if (!piece) continue;
    
    const { type } = piece.definition;
    
    // Skip centers
    if (type === 'center') continue;
    
    // Skip cross edges
    if (crossEdges.has(id)) continue;
    
    // Skip solved F2L pieces
    if (solvedF2LPieces.has(id)) continue;
    
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
