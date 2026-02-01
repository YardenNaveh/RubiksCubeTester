import { applyCubeMove, createInitialCubeState, LiveCubieState } from '../../f2l/cubeStateUtil';
import { computeOrientationColors } from '../orientation';
import { isGoodEdge } from '../isGoodEdge';

function findEdgeWithColor(state: Record<string, LiveCubieState>, color: string): LiveCubieState {
  const edges = Object.values(state).filter(p => p.definition.type === 'edge');
  const found = edges.find(e => e.definition.stickers.some(s => s.color === color));
  if (!found) throw new Error(`No edge found with color ${color}`);
  return found;
}

describe('Edge Kata isGoodEdge', () => {
  test('Rule 1: if an edge contains DColor and that sticker is on D, it is GOOD', () => {
    const bottom = 'yellow' as const;
    const front = 'red' as const;
    const o = computeOrientationColors(bottom, front);
    const state = createInitialCubeState(bottom);

    // In solved state, any edge containing DColor has that sticker on D and is good.
    const edge = findEdgeWithColor(state, o.DColor);
    expect(isGoodEdge(edge, o).isGood).toBe(true);
  });

  test('Rule 2: if an edge contains UColor and that sticker is on a side face, it is BAD', () => {
    const bottom = 'yellow' as const;
    const front = 'red' as const;
    const o = computeOrientationColors(bottom, front);

    let state = createInitialCubeState(bottom);
    // Apply an F move: UF edge's U sticker moves to a side face
    state = applyCubeMove(state, 'F');
    const uf = state['UF'];
    expect(isGoodEdge(uf, o).isGood).toBe(false);
  });

  test('Rule 3: non-U/D edge with FColor sticker on F is GOOD (solved state)', () => {
    const bottom = 'yellow' as const;
    const front = 'red' as const;
    const o = computeOrientationColors(bottom, front);
    const state = createInitialCubeState(bottom);

    // FR is a non-U/D edge in this orientation
    const fr = state['FR'];
    expect(isGoodEdge(fr, o).isGood).toBe(true);
  });

  test('Rule 4: non-U/D edge with BColor sticker on U is BAD', () => {
    const bottom = 'yellow' as const;
    const front = 'red' as const;
    const o = computeOrientationColors(bottom, front);

    let state = createInitialCubeState(bottom);
    // Apply R' so BR edge's B sticker moves to U (rotation about X +90)
    state = applyCubeMove(state, "R'");
    const br = state['BR'];
    expect(isGoodEdge(br, o).isGood).toBe(false);
  });
});

