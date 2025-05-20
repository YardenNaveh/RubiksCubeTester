import { createInitialCubeState } from '../scramble';
import { getUnsolvedPairs, isValidPair } from '../pairDetector';

describe('F2L Pair Detector', () => {
  test('should detect valid pairs', () => {
    const cubeState = createInitialCubeState();
    
    // Test known valid pairs
    expect(isValidPair('FL', 'UFL', cubeState)).toBe(true);
    expect(isValidPair('FR', 'UFR', cubeState)).toBe(true);
    expect(isValidPair('BL', 'UBL', cubeState)).toBe(true);
    expect(isValidPair('BR', 'UBR', cubeState)).toBe(true);
  });

  test('should reject invalid pairs', () => {
    const cubeState = createInitialCubeState();
    
    // Test known invalid pairs
    expect(isValidPair('FL', 'UFR', cubeState)).toBe(false);
    expect(isValidPair('FR', 'UBL', cubeState)).toBe(false);
    expect(isValidPair('UF', 'UFL', cubeState)).toBe(false); // UF is not an F2L edge
    expect(isValidPair('DB', 'UBR', cubeState)).toBe(false); // DB is not an F2L edge
  });

  test('should return 4 unsolved pairs', () => {
    const cubeState = createInitialCubeState();
    const pairs = getUnsolvedPairs(cubeState);
    
    expect(pairs.length).toBe(4);
    
    // Each pair should have a corner and edge
    pairs.forEach(pair => {
      expect(pair).toHaveProperty('corner');
      expect(pair).toHaveProperty('edge');
      expect(pair).toHaveProperty('isSolved');
      expect(pair.isSolved).toBe(false);
    });
  });
}); 