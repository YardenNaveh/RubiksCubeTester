import { generateDetailedF2LScramble, isDCrossSolved } from '../scramble';

describe('F2L Scramble Generator (Detailed State)', () => {
  test('should generate a scramble string of correct length', () => {
    const { scrambleString } = generateDetailedF2LScramble('yellow', 20);
    const moves = scrambleString.split(' ');
    expect(moves.length).toBe(20);
  });

  test('should only contain U-layer moves', () => {
    const { scrambleString } = generateDetailedF2LScramble('yellow', 20);
    const moves = scrambleString.split(' ');
    const validMoves = ['U', "U'", 'U2'];
    
    moves.forEach(move => {
      expect(validMoves).toContain(move);
    });
  });

  test('D-cross should remain solved for 100 random scrambles', () => {
    for (let i = 0; i < 100; i++) {
      const initialBottomColor = 'yellow'; // Or randomize this?
      const { finalState } = generateDetailedF2LScramble(initialBottomColor, 25);
      
      // Verify D-cross is still solved using the detailed state checker
      expect(isDCrossSolved(finalState)).toBe(true);
    }
  });
}); 