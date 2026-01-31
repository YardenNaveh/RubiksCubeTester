import { generateDetailedF2LScramble, isDCrossSolved, createInitialCubeState } from '../scramble';
import { applyCubeMove } from '../cubeStateUtil';

describe('F2L Scramble Generator (Detailed State)', () => {
  test('initial state should have solved cross for all colors', () => {
    const bottomColors = ['yellow', 'white', 'red', 'blue', 'orange', 'green'] as const;
    
    bottomColors.forEach(color => {
      const state = createInitialCubeState(color);
      expect(isDCrossSolved(state, color)).toBe(true);
    });
  });

  test('R U R\' pattern should preserve cross for yellow bottom', () => {
    let state = createInitialCubeState('yellow');
    state = applyCubeMove(state, 'R');
    state = applyCubeMove(state, 'U');
    state = applyCubeMove(state, "R'");
    expect(isDCrossSolved(state, 'yellow')).toBe(true);
  });

  test('should generate a scramble string with moves', () => {
    const { scrambleString } = generateDetailedF2LScramble('yellow', 20);
    const moves = scrambleString.split(' ').filter(m => m.length > 0);
    // Due to move simplification, actual count may vary, but should have substantial moves
    expect(moves.length).toBeGreaterThan(5);
  });

  test('should only contain valid cube moves', () => {
    const { scrambleString } = generateDetailedF2LScramble('yellow', 20);
    const moves = scrambleString.split(' ').filter(m => m.length > 0);
    const validMoves = [
      'U', "U'", 'U2',
      'R', "R'", 'R2',
      'L', "L'", 'L2',
      'F', "F'", 'F2',
      'B', "B'", 'B2'
    ];
    
    moves.forEach(move => {
      expect(validMoves).toContain(move);
    });
  });

  test('D-cross should remain solved for 100 random scrambles', () => {
    for (let i = 0; i < 100; i++) {
      const initialBottomColor = 'yellow';
      const { finalState } = generateDetailedF2LScramble(initialBottomColor, 25);
      
      // Verify D-cross is still solved using the detailed state checker
      expect(isDCrossSolved(finalState, initialBottomColor)).toBe(true);
    }
  });

  test('D-cross should remain solved for different bottom colors', () => {
    const bottomColors = ['yellow', 'white'] as const;  // Test main colors
    
    bottomColors.forEach(color => {
      for (let i = 0; i < 5; i++) {
        const { finalState } = generateDetailedF2LScramble(color, 12);
        expect(isDCrossSolved(finalState, color)).toBe(true);
      }
    });
  });
}); 