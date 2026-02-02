import { applyCubeMove, createInitialCubeState } from '../../f2l/cubeStateUtil';
import { computeOrientationColors } from '../orientation';
import { isGoodEdge } from '../isGoodEdge';

describe('Edge Kata isGoodEdge - Important Sticker Model', () => {
  // Edge Orientation based on "Important Sticker" model:
  //
  // 1. Find the "important sticker":
  //    - If edge has U or D color → that sticker is important
  //    - Otherwise → the F or B colored sticker is important
  //
  // 2. Check the edge's CURRENT layer (based on current position):
  //    - If currently in U or D layer → GOOD if important sticker faces U or D
  //    - If currently in middle layer → GOOD if important sticker faces F or B

  describe('Edges currently in U/D layer', () => {
    test('Important sticker facing U is GOOD (edge in U layer)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);
      const state = createInitialCubeState(bottom);

      // UF edge is in U layer, U sticker (important) faces U
      const uf = state['UF'];
      expect(isGoodEdge(uf, o).isGood).toBe(true);
    });

    test('Important sticker facing D is GOOD (edge in D layer)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);
      const state = createInitialCubeState(bottom);

      // DF edge is in D layer, D sticker (important) faces D
      const df = state['DF'];
      expect(isGoodEdge(df, o).isGood).toBe(true);
    });

    test('Important sticker facing R is BAD (edge in U layer)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // U move rotates edges in U layer
      // After U, UF edge stays in U layer but orientation changes
      // UF: position (0,1,1) -> after U -> (-1,1,0) which is UL
      // But UF piece is still tracked by its ID
      // Let's use F2 which flips the UF edge in place
      state = applyCubeMove(state, 'F2');
      // After F2, UF is at DF position (y=-1, D layer)
      // Let's try a different approach - use a single F move
      state = createInitialCubeState(bottom);
      state = applyCubeMove(state, 'F');
      // After F, UF goes to RF position (1,0,1) - that's middle layer, not U/D
      
      // F' on FL: FL goes to UF position
      state = createInitialCubeState(bottom);
      state = applyCubeMove(state, "F'");
      const fl = state['FL']; // FL is now at UF position (y=1), F sticker faces L
      // FL is a middle layer edge (has F color, not U/D)
      // Important sticker is F (F/B color)
      // Edge is now in U layer (y=1)
      // F sticker faces L
      // Since in U layer, good if important faces U/D → F faces L → BAD
      const result = isGoodEdge(fl, o);
      expect(result.isGood).toBe(false);
    });

    test('Important sticker facing F is BAD (edge in U layer)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // R' on BR: BR goes to UR position
      // BR: B sticker -Z, R sticker +X
      // R' is +π/2 around X: -Z -> +Y (U face), +X stays +X (R face)
      // So BR is at UR with B on U, R on R
      // Wait, that means B faces U, which is good for U layer
      
      // Let's try: R on FR: FR goes to UR
      // FR: F sticker +Z, R sticker +X  
      // R is -π/2 around X: +Z -> -Y (D face), +X stays +X
      // Actually R moves pieces on R face, FR is at (1,0,1)
      // After R: (1,0,1) -> (1,1,0) = UR position
      // F sticker +Z -> +Y (U face) after -π/2 around X? Let me recalc
      // -π/2 around X: (0,0,1) -> (0,1,0) = +Y direction = U face
      // So F sticker faces U
      // This is a middle layer edge (FR has F color, no U/D)
      // Important sticker is F
      // Edge is in U layer (y=1)
      // F faces U → GOOD for U layer!
      
      // I need F sticker to face F while in U layer
      // That requires more complex moves
      // Let's try: after putting FR at UL with F facing L
      // F' on FR: FR goes to UF position? No, F' affects z>0.5
      // FR at (1,0,1) has z=1 > 0.5, so it's affected
      // F' is +π/2 around Z: (1,0,1) -> (0,1,1) = UF position (y=1, U layer)
      // F sticker +Z stays +Z (F face)
      // R sticker +X -> -Y (D face)
      // So after F', FR is at UF with F on F, R on D
      // Important sticker is F (middle edge)
      // Edge is in U layer (y=1)
      // F faces F → BAD for U layer (should face U/D)
      state = applyCubeMove(state, "F'");
      const fr = state['FR'];
      const result = isGoodEdge(fr, o);
      expect(result.isGood).toBe(false);
    });
  });

  describe('Edges currently in middle layer', () => {
    test('Important sticker facing F is GOOD (edge in middle layer)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);
      const state = createInitialCubeState(bottom);

      // FR edge is in middle layer (y=0), F sticker faces F
      const fr = state['FR'];
      const result = isGoodEdge(fr, o);
      expect(result.isGood).toBe(true);
    });

    test('Important sticker facing B is GOOD (edge in middle layer)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);
      const state = createInitialCubeState(bottom);

      // BR edge is in middle layer (y=0), B sticker faces B
      const br = state['BR'];
      const result = isGoodEdge(br, o);
      expect(result.isGood).toBe(true);
    });

    test('Important sticker facing U is BAD (edge in middle layer)', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // F on UF: UF goes to RF position (middle layer)
      // UF: U sticker +Y, F sticker +Z
      // F is -π/2 around Z: +Y -> +X (R face), +Z stays +Z (F face)
      // So UF is at RF with U on R, F on F
      // UF is a U/D edge (has U color)
      // Important sticker is U
      // Edge is in middle layer (y=0)
      // U faces R → BAD for middle layer (should face F/B)
      state = applyCubeMove(state, 'F');
      const uf = state['UF'];
      const result = isGoodEdge(uf, o);
      expect(result.isGood).toBe(false);
    });

    test('Important sticker facing F is GOOD for U/D edge in middle layer', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // R' on UR: UR goes to FR position (middle layer)
      // UR: U sticker +Y, R sticker +X
      // R' is +π/2 around X: +Y -> +Z (F face), +X stays +X (R face)
      // So UR is at FR with U on F, R on R
      // UR is a U/D edge (has U color)
      // Important sticker is U
      // Edge is in middle layer (y=0)
      // U faces F → GOOD for middle layer!
      state = applyCubeMove(state, "R'");
      const ur = state['UR'];
      const result = isGoodEdge(ur, o);
      expect(result.isGood).toBe(true);
    });

    test('Important sticker facing B is GOOD for U/D edge in middle layer', () => {
      const bottom = 'yellow' as const;
      const front = 'red' as const;
      const o = computeOrientationColors(bottom, front);

      let state = createInitialCubeState(bottom);
      // R on UR: UR goes to BR position (middle layer)
      // UR: U sticker +Y, R sticker +X
      // R is -π/2 around X: +Y -> -Z (B face), +X stays +X (R face)
      // So UR is at BR with U on B, R on R
      // Important sticker is U
      // Edge is in middle layer (y=0)
      // U faces B → GOOD for middle layer!
      state = applyCubeMove(state, 'R');
      const ur = state['UR'];
      const result = isGoodEdge(ur, o);
      expect(result.isGood).toBe(true);
    });
  });
});

