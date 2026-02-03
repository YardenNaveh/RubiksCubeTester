import * as THREE from 'three';
import { AllMoves, applyCubeMove, createInitialCubeState, LiveCubieState, RubiksCubeState } from '../f2l/cubeStateUtil';
import { CubeColor, COLORS, COLOR_PAIRS } from '../cubeConstants';
import { QuestionType } from '../../state/zanshinRecallStore';

// Sticker identifier: "cubieId-face" e.g., "UFR-U", "UF-F"
export type StickerId = string;

export interface StickerInfo {
  stickerId: StickerId;
  cubieId: string;
  face: string;
  color: CubeColor;
  worldNormal: THREE.Vector3;
  isVisible: boolean;
}

export interface ZanshinRoundSettings {
  enabledTypes: QuestionType[];
  flashDurationMs: number;
  onlyVisibleStickers: boolean;
  bottomColor: CubeColor | 'random';
}

export interface PieceRecallRound {
  type: 'pieceRecall';
  state: RubiksCubeState;
  targetPieceId: string;
  targetPieceDescription: string; // e.g., "red-green edge"
}

export interface StickerSetRecallRound {
  type: 'stickerSetRecall';
  state: RubiksCubeState;
  targetColor: CubeColor;
  targetStickerIds: Set<StickerId>;
}

export interface SingleStickerRecallRound {
  type: 'singleStickerRecall';
  state: RubiksCubeState;
  hiddenStickerId: StickerId;
  hiddenStickerColor: CubeColor;
}

export type ZanshinRound = PieceRecallRound | StickerSetRecallRound | SingleStickerRecallRound;

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
 * Scramble the cube state with random moves
 */
function scrambleCube(state: RubiksCubeState, numMoves: number = 20): RubiksCubeState {
  let prevBase: string | null = null;
  for (let i = 0; i < numMoves; i++) {
    const move = randomMoveAvoidingRepeat(prevBase);
    prevBase = move.replace(/['2]/g, '');
    state = applyCubeMove(state, move);
  }
  return state;
}

/**
 * Check if a sticker is visible from the default camera position [3.5, 3.5, 3.5]
 * A sticker is visible if its world-space normal points toward positive X, Y, or Z
 */
function isStickerVisible(sticker: { normal: THREE.Vector3 }, cubie: LiveCubieState): boolean {
  const worldNormal = sticker.normal.clone().applyQuaternion(cubie.currentOrientation);
  return worldNormal.x > 0.5 || worldNormal.y > 0.5 || worldNormal.z > 0.5;
}

/**
 * Get all stickers from the cube state with visibility information
 */
export function getAllStickers(state: RubiksCubeState): StickerInfo[] {
  const stickers: StickerInfo[] = [];
  
  for (const cubieId in state) {
    const cubie = state[cubieId];
    for (const sticker of cubie.definition.stickers) {
      const worldNormal = sticker.normal.clone().applyQuaternion(cubie.currentOrientation);
      const isVisible = worldNormal.x > 0.5 || worldNormal.y > 0.5 || worldNormal.z > 0.5;
      
      stickers.push({
        stickerId: `${cubieId}-${sticker.face}`,
        cubieId,
        face: sticker.face,
        color: sticker.color,
        worldNormal,
        isVisible,
      });
    }
  }
  
  return stickers;
}

/**
 * Get visible stickers from a cube state
 */
export function getVisibleStickers(state: RubiksCubeState): StickerInfo[] {
  return getAllStickers(state).filter(s => s.isVisible);
}

/**
 * Get a color name for display (capitalize first letter)
 */
function colorName(color: CubeColor): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

/**
 * Generate a description for a piece (edge or corner) based on its sticker colors
 */
function getPieceDescription(cubie: LiveCubieState): string {
  const colors = cubie.definition.stickers.map(s => s.color);
  const type = cubie.definition.type;
  
  if (type === 'edge') {
    return `${colorName(colors[0])}-${colorName(colors[1])} edge`;
  } else if (type === 'corner') {
    return `${colorName(colors[0])}-${colorName(colors[1])}-${colorName(colors[2])} corner`;
  } else {
    return `${colorName(colors[0])} center`;
  }
}

/**
 * Generate a Piece Recall round
 * "Where is the red-green edge?"
 * Only selects F2L pieces (pieces without U color sticker)
 */
function generatePieceRecallRound(state: RubiksCubeState, onlyVisible: boolean, bottomColor: CubeColor): PieceRecallRound {
  // U color is opposite of bottom
  const uColor = COLOR_PAIRS[bottomColor];
  
  // Get all edges and corners (not centers) that are F2L pieces (no U color sticker)
  const pieces = Object.values(state).filter(p => {
    if (p.definition.type !== 'edge' && p.definition.type !== 'corner') return false;
    // F2L pieces don't have the U color
    const hasUColor = p.definition.stickers.some(s => s.color === uColor);
    return !hasUColor;
  });
  
  // If only visible, filter to pieces with at least one visible sticker
  let candidates = pieces;
  if (onlyVisible) {
    candidates = pieces.filter(p => 
      p.definition.stickers.some(s => isStickerVisible(s, p))
    );
  }
  
  // Fall back to all F2L pieces if no visible candidates
  if (candidates.length === 0) candidates = pieces;
  
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  
  return {
    type: 'pieceRecall',
    state,
    targetPieceId: target.definition.id,
    targetPieceDescription: getPieceDescription(target),
  };
}

/**
 * Generate a Sticker Set Recall round
 * "Click all the yellow stickers"
 */
function generateStickerSetRecallRound(state: RubiksCubeState, onlyVisible: boolean): StickerSetRecallRound {
  const allStickers = getAllStickers(state);
  const stickersToConsider = onlyVisible ? allStickers.filter(s => s.isVisible) : allStickers;
  
  // Pick a random color
  const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  // Find all stickers of that color (visible or all based on settings)
  const targetStickers = stickersToConsider.filter(s => s.color === targetColor);
  const targetStickerIds = new Set(targetStickers.map(s => s.stickerId));
  
  return {
    type: 'stickerSetRecall',
    state,
    targetColor,
    targetStickerIds,
  };
}

/**
 * Generate a Single Sticker Color Recall round
 * "What color was this sticker?" (with one sticker hidden)
 */
function generateSingleStickerRecallRound(state: RubiksCubeState, onlyVisible: boolean): SingleStickerRecallRound {
  const allStickers = getAllStickers(state);
  
  // Filter to visible stickers if setting is enabled
  let candidates = onlyVisible ? allStickers.filter(s => s.isVisible) : allStickers;
  
  // Optionally exclude centers for more difficulty consistency
  // For now, include all visible stickers (minimum requirement)
  
  // Fall back to all stickers if no candidates
  if (candidates.length === 0) candidates = allStickers;
  
  const hidden = candidates[Math.floor(Math.random() * candidates.length)];
  
  return {
    type: 'singleStickerRecall',
    state,
    hiddenStickerId: hidden.stickerId,
    hiddenStickerColor: hidden.color,
  };
}

/**
 * Generate a random Zanshin Recall round based on enabled question types
 */
export function generateZanshinRound(settings: ZanshinRoundSettings): ZanshinRound {
  const { enabledTypes, onlyVisibleStickers, bottomColor } = settings;
  
  if (enabledTypes.length === 0) {
    throw new Error('At least one question type must be enabled');
  }
  
  // Determine bottom color
  const actualBottomColor: CubeColor = bottomColor === 'random' 
    ? COLORS[Math.floor(Math.random() * COLORS.length)]
    : bottomColor;
  
  // Create and scramble the cube
  let state = createInitialCubeState(actualBottomColor);
  state = scrambleCube(state, 20);
  
  // Pick a random enabled question type
  const questionType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
  
  switch (questionType) {
    case 'pieceRecall':
      return generatePieceRecallRound(state, onlyVisibleStickers, actualBottomColor);
    case 'stickerSetRecall':
      return generateStickerSetRecallRound(state, onlyVisibleStickers);
    case 'singleStickerRecall':
      return generateSingleStickerRecallRound(state, onlyVisibleStickers);
  }
}

/**
 * Parse a sticker ID into cubie ID and face
 */
export function parseStickerId(stickerId: StickerId): { cubieId: string; face: string } {
  const parts = stickerId.split('-');
  return {
    cubieId: parts[0],
    face: parts[1],
  };
}

/**
 * Check if a piece recall answer is correct
 */
export function checkPieceRecallAnswer(round: PieceRecallRound, selectedCubieId: string): boolean {
  return selectedCubieId === round.targetPieceId;
}

/**
 * Check if a sticker set recall answer is correct
 * Returns detailed feedback
 */
export function checkStickerSetRecallAnswer(
  round: StickerSetRecallRound, 
  selectedStickerIds: Set<StickerId>
): { isCorrect: boolean; missed: number; extra: number } {
  const target = round.targetStickerIds;
  
  let missed = 0;
  let extra = 0;
  
  // Check for missed stickers
  for (const id of target) {
    if (!selectedStickerIds.has(id)) {
      missed++;
    }
  }
  
  // Check for extra stickers
  for (const id of selectedStickerIds) {
    if (!target.has(id)) {
      extra++;
    }
  }
  
  return {
    isCorrect: missed === 0 && extra === 0,
    missed,
    extra,
  };
}

/**
 * Check if a single sticker color recall answer is correct
 */
export function checkSingleStickerRecallAnswer(
  round: SingleStickerRecallRound,
  selectedColor: CubeColor
): boolean {
  return selectedColor === round.hiddenStickerColor;
}
