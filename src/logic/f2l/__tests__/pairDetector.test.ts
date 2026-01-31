import { createInitialCubeState } from '../scramble';
import { getUnsolvedPairs, isValidPair } from '../pairDetector';

describe('F2L Pair Detector', () => {
  test('should detect valid F2L pairs for yellow bottom', () => {
    const cubeState = createInitialCubeState('yellow');
    
    // F2L pairs with yellow bottom: D-layer corners with their matching E-layer edges
    // DFR corner (yellow/red/blue) pairs with FR edge (red/blue)
    expect(isValidPair('FR', 'DFR', cubeState, 'yellow')).toBe(true);
    // DFL corner (yellow/red/green) pairs with FL edge (red/green)
    expect(isValidPair('FL', 'DFL', cubeState, 'yellow')).toBe(true);
    // DBR corner (yellow/orange/blue) pairs with BR edge (orange/blue)
    expect(isValidPair('BR', 'DBR', cubeState, 'yellow')).toBe(true);
    // DBL corner (yellow/orange/green) pairs with BL edge (orange/green)
    expect(isValidPair('BL', 'DBL', cubeState, 'yellow')).toBe(true);
  });

  test('should detect valid F2L pairs for white bottom', () => {
    const cubeState = createInitialCubeState('white');
    
    // F2L pairs with white bottom: U-layer corners (they have white) with E-layer edges
    // UFR corner (white/red/blue) pairs with FR edge (red/blue)
    expect(isValidPair('FR', 'UFR', cubeState, 'white')).toBe(true);
    // UFL corner (white/red/green) pairs with FL edge (red/green)
    expect(isValidPair('FL', 'UFL', cubeState, 'white')).toBe(true);
    // UBR corner (white/orange/blue) pairs with BR edge (orange/blue)
    expect(isValidPair('BR', 'UBR', cubeState, 'white')).toBe(true);
    // UBL corner (white/orange/green) pairs with BL edge (orange/green)
    expect(isValidPair('BL', 'UBL', cubeState, 'white')).toBe(true);
  });

  test('should reject invalid pairs', () => {
    const cubeState = createInitialCubeState('yellow');
    
    // Wrong corner for edge
    expect(isValidPair('FL', 'DFR', cubeState, 'yellow')).toBe(false);
    expect(isValidPair('FR', 'DBL', cubeState, 'yellow')).toBe(false);
    
    // U-layer edges are not F2L edges
    expect(isValidPair('UF', 'DFL', cubeState, 'yellow')).toBe(false);
    
    // D-layer edges are not F2L edges (they're cross edges)
    expect(isValidPair('DF', 'DFR', cubeState, 'yellow')).toBe(false);
    
    // For yellow bottom, U-layer corners are not F2L corners
    expect(isValidPair('FR', 'UFR', cubeState, 'yellow')).toBe(false);
  });

  test('should return 4 unsolved pairs for yellow bottom', () => {
    const cubeState = createInitialCubeState('yellow');
    const pairs = getUnsolvedPairs(cubeState, 'yellow');
    
    expect(pairs.length).toBe(4);
    
    // Each pair should have a corner and edge
    pairs.forEach(pair => {
      expect(pair).toHaveProperty('corner');
      expect(pair).toHaveProperty('edge');
      expect(pair).toHaveProperty('isSolved');
      expect(pair.isSolved).toBe(false);
    });

    // Verify the correct F2L corners are returned (D-layer for yellow bottom)
    const cornerIds = pairs.map(p => p.corner.id).sort();
    expect(cornerIds).toEqual(['DBL', 'DBR', 'DFL', 'DFR']);
    
    // Verify the correct F2L edges are returned
    const edgeIds = pairs.map(p => p.edge.id).sort();
    expect(edgeIds).toEqual(['BL', 'BR', 'FL', 'FR']);
  });

  test('should return 4 unsolved pairs for white bottom', () => {
    const cubeState = createInitialCubeState('white');
    const pairs = getUnsolvedPairs(cubeState, 'white');
    
    expect(pairs.length).toBe(4);

    // Verify the correct F2L corners are returned (U-layer for white bottom)
    const cornerIds = pairs.map(p => p.corner.id).sort();
    expect(cornerIds).toEqual(['UBL', 'UBR', 'UFL', 'UFR']);
    
    // Verify the correct F2L edges are returned
    const edgeIds = pairs.map(p => p.edge.id).sort();
    expect(edgeIds).toEqual(['BL', 'BR', 'FL', 'FR']);
  });
}); 