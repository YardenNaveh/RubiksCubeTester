import { 
  generateInnerEyeRound, 
  checkAnswer, 
  areColorsValidTogether,
  getValidColorCombinations 
} from '../generateInnerEyeRound';
import { CubeColor, COLOR_PAIRS } from '../../cubeConstants';
import { DifficultyLevel } from '../../../state/innerEyeStore';

describe('generateInnerEyeRound', () => {
  it('generates a round with valid structure', () => {
    const round = generateInnerEyeRound('yellow', 2);
    
    expect(round).toHaveProperty('state');
    expect(round).toHaveProperty('difficulty');
    expect(round).toHaveProperty('hiddenPieceId');
    expect(round).toHaveProperty('hiddenPieceType');
    expect(round).toHaveProperty('hiddenPieceColors');
    expect(round).toHaveProperty('hiddenPieceDescription');
  });

  it('hidden piece type matches color count', () => {
    // Run multiple times to test both edges and corners
    for (let i = 0; i < 20; i++) {
      const round = generateInnerEyeRound('yellow', 3);
      
      if (round.hiddenPieceType === 'edge') {
        expect(round.hiddenPieceColors).toHaveLength(2);
      } else {
        expect(round.hiddenPieceColors).toHaveLength(3);
      }
    }
  });

  it('generates different difficulty levels', () => {
    const difficulties: DifficultyLevel[] = [1, 2, 3, 4];
    
    for (const difficulty of difficulties) {
      const round = generateInnerEyeRound('yellow', difficulty);
      expect(round.difficulty).toBe(difficulty);
    }
  });

  it('hidden piece colors are valid (no opposite colors)', () => {
    for (let i = 0; i < 20; i++) {
      const round = generateInnerEyeRound('yellow', 4);
      const colors = round.hiddenPieceColors;
      
      // Check no two colors are opposites
      for (let j = 0; j < colors.length; j++) {
        for (let k = j + 1; k < colors.length; k++) {
          expect(COLOR_PAIRS[colors[j]]).not.toBe(colors[k]);
        }
      }
    }
  });

  it('does not hide center pieces', () => {
    for (let i = 0; i < 30; i++) {
      const round = generateInnerEyeRound('white', 4);
      expect(['edge', 'corner']).toContain(round.hiddenPieceType);
    }
  });
});

describe('checkAnswer', () => {
  it('returns correct for matching colors (same order)', () => {
    const round = {
      state: {} as any,
      difficulty: 2 as DifficultyLevel,
      hiddenPieceId: 'UF',
      hiddenPieceType: 'edge' as const,
      hiddenPieceColors: ['white', 'red'] as CubeColor[],
      hiddenPieceDescription: 'edge piece (2 colors)',
    };
    
    const result = checkAnswer(round, ['white', 'red']);
    expect(result.isCorrect).toBe(true);
  });

  it('returns correct for matching colors (different order)', () => {
    const round = {
      state: {} as any,
      difficulty: 2 as DifficultyLevel,
      hiddenPieceId: 'UF',
      hiddenPieceType: 'edge' as const,
      hiddenPieceColors: ['white', 'red'] as CubeColor[],
      hiddenPieceDescription: 'edge piece (2 colors)',
    };
    
    const result = checkAnswer(round, ['red', 'white']);
    expect(result.isCorrect).toBe(true);
  });

  it('returns incorrect for wrong colors', () => {
    const round = {
      state: {} as any,
      difficulty: 2 as DifficultyLevel,
      hiddenPieceId: 'UF',
      hiddenPieceType: 'edge' as const,
      hiddenPieceColors: ['white', 'red'] as CubeColor[],
      hiddenPieceDescription: 'edge piece (2 colors)',
    };
    
    const result = checkAnswer(round, ['blue', 'red']);
    expect(result.isCorrect).toBe(false);
    expect(result.explanation).toBeTruthy();
  });

  it('returns incorrect for wrong number of colors', () => {
    const round = {
      state: {} as any,
      difficulty: 2 as DifficultyLevel,
      hiddenPieceId: 'UF',
      hiddenPieceType: 'edge' as const,
      hiddenPieceColors: ['white', 'red'] as CubeColor[],
      hiddenPieceDescription: 'edge piece (2 colors)',
    };
    
    const result = checkAnswer(round, ['white']);
    expect(result.isCorrect).toBe(false);
  });

  it('works for corner pieces (3 colors)', () => {
    const round = {
      state: {} as any,
      difficulty: 2 as DifficultyLevel,
      hiddenPieceId: 'UFR',
      hiddenPieceType: 'corner' as const,
      hiddenPieceColors: ['white', 'red', 'blue'] as CubeColor[],
      hiddenPieceDescription: 'corner piece (3 colors)',
    };
    
    const result = checkAnswer(round, ['blue', 'white', 'red']);
    expect(result.isCorrect).toBe(true);
  });
});

describe('areColorsValidTogether', () => {
  it('returns true for non-opposite colors', () => {
    expect(areColorsValidTogether(['white', 'red'])).toBe(true);
    expect(areColorsValidTogether(['white', 'blue'])).toBe(true);
    expect(areColorsValidTogether(['white', 'red', 'blue'])).toBe(true);
  });

  it('returns false for opposite colors', () => {
    expect(areColorsValidTogether(['white', 'yellow'])).toBe(false);
    expect(areColorsValidTogether(['red', 'orange'])).toBe(false);
    expect(areColorsValidTogether(['blue', 'green'])).toBe(false);
  });

  it('returns false if any pair is opposite', () => {
    expect(areColorsValidTogether(['white', 'red', 'yellow'])).toBe(false);
    expect(areColorsValidTogether(['blue', 'green', 'white'])).toBe(false);
  });
});

describe('getValidColorCombinations', () => {
  it('returns 12 valid edge combinations', () => {
    const edgeCombos = getValidColorCombinations('edge');
    expect(edgeCombos.length).toBe(12); // 6 colors * 4 non-opposite pairings / 2 (order)
    
    // Each should have 2 colors
    for (const combo of edgeCombos) {
      expect(combo).toHaveLength(2);
      expect(areColorsValidTogether(combo)).toBe(true);
    }
  });

  it('returns 8 valid corner combinations', () => {
    const cornerCombos = getValidColorCombinations('corner');
    expect(cornerCombos.length).toBe(8); // 8 corners on a cube
    
    // Each should have 3 colors
    for (const combo of cornerCombos) {
      expect(combo).toHaveLength(3);
      expect(areColorsValidTogether(combo)).toBe(true);
    }
  });
});
