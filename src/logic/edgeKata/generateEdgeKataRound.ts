import { AllMoves, applyCubeMove, createInitialCubeStateWithFront, RubiksCubeState } from '../f2l/cubeStateUtil';
import { CubeColor } from '../cubeConstants';
import { computeOrientationColors, isValidBottomFront, randomValidBottomFront } from './orientation';
import { isGoodEdge } from './isGoodEdge';

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

  if (settings.randomizeEachRound || settings.bottom === 'random' || settings.front === 'random') {
    const rnd = randomValidBottomFront();
    bottom = rnd.bottom;
    front = rnd.front;
  } else {
    bottom = settings.bottom;
    front = settings.front;
    if (!isValidBottomFront(bottom, front)) {
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

  // Pick a random edge to highlight
  const edgeIds = Object.keys(state).filter(id => state[id].definition.type === 'edge');
  const highlightedEdgeId = edgeIds[Math.floor(Math.random() * edgeIds.length)];
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

