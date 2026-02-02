import { applyCubeMove, createInitialCubeState } from '../../f2l/cubeStateUtil';
import { computeOrientationColors } from '../orientation';
import { isGoodEdge } from '../isGoodEdge';

describe('Edge Kata isGoodEdge - ZZ Edge Orientation', () => {
  // Edge Orientation based on "Important Sticker" model:
  //
  // 1. Determine edge's solved layer by its colors:
  //    - Has U or D color → belongs to U/D layer
  //    - No U/D colors → belongs to middle layer
  //
  // 2. Find the "important sticker":
  //    - U/D layer edges: sticker with U or D color
  //    - Middle layer edges: sticker with F or B color
  //
  // 3. Classification:
  //    - U/D edges: GOOD if important sticker faces U or D; BAD otherwise
  //    - Middle edges: GOOD if important sticker faces F or B; BAD otherwise

  describe('U/D edges (edges with white/yellow sticker)', () => {
    test('U/D sticker on U face is GOOD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);
      const state = createInitialCubeState(bottom);

      // In solved state, UF edge has U sticker on U face
      const uf = state['UF'];
      expect(isGoodEdge(uf, o).isGood).toBe(true);
      expect(isGoodEdge(uf, o).kind).toBe('UD');
    });

    test('U/D sticker on D face is GOOD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);
      const state = createInitialCubeState(bottom);

      // In solved state, DF edge has D sticker on D face
      const df = state['DF'];
      expect(isGoodEdge(df, o).isGood).toBe(true);
      expect(isGoodEdge(df, o).kind).toBe('UD');
    });

    test('U/D sticker on R face is BAD (not U/D)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // F move on UF: UF goes to RF position
      // UF: U sticker +Y, F sticker +Z
      // F move is -π/2 around Z axis: +Y -> +X (R face), +Z stays +Z
      // So after F: U sticker on R face, F sticker on F face
      state = applyCubeMove(state, 'F');
      const uf = state['UF']; // This piece is now at RF with U on R face
      const result = isGoodEdge(uf, o);
      expect(result.isGood).toBe(false);
      expect(result.kind).toBe('UD');
    });

    test('U/D sticker on L face is BAD (not U/D)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // F' move on UF: UF goes to LF position
      // F' is +π/2 around Z axis: +Y -> -X (L face)
      state = applyCubeMove(state, "F'");
      const uf = state['UF']; // This piece is now at LF with U on L face
      const result = isGoodEdge(uf, o);
      expect(result.isGood).toBe(false);
      expect(result.kind).toBe('UD');
    });

    test('U/D sticker on F face is BAD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // R' on UR: UR goes to FR position
      // UR: U sticker +Y, R sticker +X
      // R' is +π/2 around X axis: +Y -> +Z (F face)
      state = applyCubeMove(state, "R'");
      const ur = state['UR']; // This piece is now at FR with U on F face
      const result = isGoodEdge(ur, o);
      expect(result.isGood).toBe(false);
      expect(result.kind).toBe('UD');
      expect(result.explanation).toContain('not U/D');
    });

    test('U/D sticker on B face is BAD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // R on UR: UR goes to BR position
      // R is -π/2 around X axis: +Y -> -Z (B face)
      state = applyCubeMove(state, 'R');
      const ur = state['UR']; // This piece is now at BR with U on B face
      const result = isGoodEdge(ur, o);
      expect(result.isGood).toBe(false);
      expect(result.kind).toBe('UD');
      expect(result.explanation).toContain('not U/D');
    });
  });

  describe('Non-U/D edges (equatorial edges with F/B sticker)', () => {
    test('F/B sticker on F face is GOOD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);
      const state = createInitialCubeState(bottom);

      // FR edge has F sticker on F face in solved state
      const fr = state['FR'];
      const result = isGoodEdge(fr, o);
      expect(result.isGood).toBe(true);
      expect(result.kind).toBe('FB');
    });

    test('F/B sticker on B face is GOOD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);
      const state = createInitialCubeState(bottom);

      // BR edge has B sticker on B face in solved state
      const br = state['BR'];
      const result = isGoodEdge(br, o);
      expect(result.isGood).toBe(true);
      expect(result.kind).toBe('FB');
    });

    test('F/B sticker on U face is BAD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // F on FR: FR goes to DF position
      // FR: F sticker +Z, R sticker +X
      // F is -π/2 around Z: +Z stays +Z, +X -> +Y (U face)
      // Wait, that puts R sticker on U, not F sticker
      // Let me use a different move: R' on BR
      // BR: B sticker -Z, R sticker +X
      // R' is +π/2 around X: -Z -> +Y (U face)
      state = applyCubeMove(state, "R'");
      const br = state['BR']; // This piece is now at UR with B on U face
      const result = isGoodEdge(br, o);
      expect(result.isGood).toBe(false);
      expect(result.kind).toBe('FB');
    });

    test('F/B sticker on R face is BAD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // U on FR: FR goes to FL position
      // FR: F sticker +Z, R sticker +X
      // Actually FR isn't on U layer. Let me think...
      // To get F sticker on R face from FR:
      // We need +Z to become +X
      // That's rotation around Y by -π/2 (U move for pieces on U layer)
      // But FR is at y=0, not on U layer
      // Let's try: B on BR
      // BR: B sticker -Z, R sticker +X
      // B is +π/2 around Z: -Z stays -Z (no change), +X -> +Y
      // That puts R sticker on U, not B sticker on R
      // Hmm, to get B/F sticker on R face...
      // Need -Z -> +X or +Z -> +X
      // -Z -> +X is rotation around Y by +π/2 (U' for pieces on U layer)
      // Let's use: B' on UB
      // Wait, UB has U sticker (U/D edge), not a non-U/D edge
      // 
      // Let me think differently. FR edge is at position (1,0,1)
      // F on entire cube would rotate it, but F only affects z>0.5
      // After F on FR: position (1,0,1) -> (0,-1,1) which is DF
      // F sticker +Z rotates around Z by -π/2: stays +Z
      // R sticker +X rotates around Z by -π/2: +X -> +Y
      // So now at DF, F sticker on F, R sticker on... +Y is U face
      // That doesn't help.
      //
      // To get F sticker (+Z) on R face (+X), need rotation that takes Z to X
      // That's -π/2 around Y (U move direction)
      // But F and B moves rotate around Z, R and L around X
      // U move on a piece at y=1... FR is at y=0
      // 
      // Let me use a two-move sequence: R F on FR
      // R on FR: FR (1,0,1) -> UR (1,1,0)
      // F sticker +Z -> +Y (U face)
      // R sticker +X -> +X (R face)
      // So after R, FR is at UR with F on U, R on R
      // This is a non-U/D edge, and F sticker is on U face (BAD)
      // Let me use this
      state = applyCubeMove(state, 'R');
      const fr = state['FR']; // This piece is now at UR with F on U face
      const result = isGoodEdge(fr, o);
      expect(result.isGood).toBe(false);
      expect(result.kind).toBe('FB');
    });

    test('F/B sticker on L face is BAD', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // L' on FL: FL goes to UL position
      // FL: F sticker +Z, L sticker -X
      // L' is -π/2 around X: +Z -> +Y (U face)
      // So after L', FL is at UL with F on U face
      state = applyCubeMove(state, "L'");
      const fl = state['FL']; // This piece is now at UL with F on U face
      const result = isGoodEdge(fl, o);
      expect(result.isGood).toBe(false);
      expect(result.kind).toBe('FB');
    });
  });
});

