export type CubeColor = 'white' | 'yellow' | 'blue' | 'green' | 'red' | 'orange';

export const COLORS: CubeColor[] = ['white', 'yellow', 'blue', 'green', 'red', 'orange'];

export const COLOR_PAIRS: Record<CubeColor, CubeColor> = {
  white: 'yellow',
  yellow: 'white',
  blue: 'green',
  green: 'blue',
  red: 'orange',
  orange: 'red',
};

// Standard Western Color Scheme (WCA standard)
// U: White, F: Red, R: Blue
// Corresponding opposites: D: Yellow, B: Orange, L: Green
export const FACE_MAP: Record<string, CubeColor> = {
  U: 'white',
  D: 'yellow',
  F: 'red',
  B: 'orange',
  R: 'blue',
  L: 'green',
};

// Defines adjacent faces for orientation generation
export const ADJACENT_FACES: Record<CubeColor, CubeColor[]> = {
  white: ['red', 'orange', 'blue', 'green'], // U
  yellow: ['red', 'orange', 'blue', 'green'], // D
  red: ['white', 'yellow', 'blue', 'green'], // F
  orange: ['white', 'yellow', 'blue', 'green'], // B
  blue: ['white', 'yellow', 'red', 'orange'], // R
  green: ['white', 'yellow', 'red', 'orange'], // L
};

export type TargetRelation = 'up' | 'down' | 'left' | 'right' | 'front' | 'back';
export const TARGET_RELATIONS: TargetRelation[] = ['up', 'down', 'left', 'right', 'front', 'back'];

// Map TargetRelation to standard face notation (relative to given Front/Up or Front/Right)
// This might be better handled by rotation logic, but starting simple
// Example: If Front=Red, Up=White, then Right=Blue, Left=Green, Back=Orange, Down=Yellow
// If Front=Red, Right=Blue, then Up=White, Left=Green, Back=Orange, Down=Yellow 