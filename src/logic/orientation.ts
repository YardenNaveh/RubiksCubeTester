import {
  CubeColor,
  COLORS,
  COLOR_PAIRS,
  TargetRelation
} from './cubeConstants';

// --- Define standard face notation (used internally) ---
export type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
const FACES: Face[] = ['U', 'D', 'F', 'B', 'L', 'R'];

// --- Map TargetRelation to Face (relative concept) ---
// We assume a view where you look at the FRONT face,
// UP is towards the U face, RIGHT is towards the R face etc.
export const RELATION_TO_FACE_MAP: Record<TargetRelation, Face> = {
  up: 'U',
  down: 'D',
  left: 'L',
  right: 'R',
  front: 'F',
  back: 'B',
};

const FACE_TO_RELATION_MAP: Record<Face, TargetRelation> = {
    U: 'up', D: 'down', L: 'left', R: 'right', F: 'front', B: 'back',
};

// --- Define the standard "solved" state relative to White=Up, Red=Front ---
const STANDARD_FACE_COLORS: Record<Face, CubeColor> = {
  U: 'white', D: 'yellow',
  F: 'red',   B: 'orange',
  R: 'blue',  L: 'green',
};

// Commented out unused STANDARD_COLOR_TO_FACE
// const STANDARD_COLOR_TO_FACE = Object.fromEntries(
//     Object.entries(STANDARD_FACE_COLORS).map(([face, color]) => [color, face])
// ) as Record<CubeColor, Face>; 

// --- Define adjacencies between standard FACES ---
const FACE_ADJACENCIES: Record<Face, Face[]> = {
  U: ['F', 'B', 'L', 'R'],
  D: ['F', 'B', 'L', 'R'],
  F: ['U', 'D', 'L', 'R'],
  B: ['U', 'D', 'L', 'R'],
  L: ['U', 'D', 'F', 'B'],
  R: ['U', 'D', 'F', 'B'],
};

// Helper to get a random element from an array
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Main Logic: Determine colors relative to a chosen bottom ---
// Commented out unused OrientationMap interface
// interface OrientationMap {
//     faceColors: Record<Face, CubeColor>; // Map from standard Face (U,F..) to actual Color
//     colorFaces: Record<CubeColor, Face>; // Map from actual Color to standard Face
// }

// --- New Problem Structure ---
export interface OrientationProblem {
    ref1Face: Face;         // Standard name of 1st ref face (e.g., 'F')
    ref2Face: Face;         // Standard name of 2nd ref face (e.g., 'R')
    ref1Color: CubeColor;   // Actual color appearing on ref1Face
    ref2Color: CubeColor;   // Actual color appearing on ref2Face
    targetRelation: TargetRelation; // Relation asked (e.g., 'up')
    correctAnswer: CubeColor; // The color at the targetRelation
    faceColors: Record<Face, CubeColor>; // Full map Face -> Color for this orientation
    bottomColor: CubeColor; // The setting used
}

// Helper to determine R, B, L colors based on known U and F colors
function getSideColors(upColor: CubeColor, frontColor: CubeColor): { R: CubeColor; B: CubeColor; L: CubeColor } {
    // Adjacency map: Given U, F -> find R, B, L
    // Derived from standard cube rotations
    const adj: Partial<Record<CubeColor, Partial<Record<CubeColor, { R: CubeColor; B: CubeColor; L: CubeColor }>>>> = {
        white: { // U = White
            red:    { R: 'blue',   B: 'orange', L: 'green' },
            blue:   { R: 'orange', B: 'green',  L: 'red' },
            orange: { R: 'green',  B: 'red',    L: 'blue' },
            green:  { R: 'red',    B: 'blue',   L: 'orange' },
        },
        yellow: { // U = Yellow
            red:    { R: 'green',  B: 'orange', L: 'blue' },
            green:  { R: 'orange', B: 'blue',   L: 'red' },
            orange: { R: 'blue',   B: 'red',    L: 'green' },
            blue:   { R: 'red',    B: 'green',  L: 'orange' },
        },
        blue: { // U = Blue
            white:  { R: 'red',    B: 'yellow', L: 'orange' },
            red:    { R: 'yellow', B: 'orange', L: 'white' },
            yellow: { R: 'orange', B: 'white',  L: 'red' },
            orange: { R: 'white',  B: 'red',    L: 'yellow' },
        },
        green: { // U = Green
            white:  { R: 'orange', B: 'yellow', L: 'red' },
            orange: { R: 'yellow', B: 'red',    L: 'white' },
            yellow: { R: 'red',    B: 'white',  L: 'orange' },
            red:    { R: 'white',  B: 'orange', L: 'yellow' },
        },
        red: { // U = Red
            white:  { R: 'blue',   B: 'yellow', L: 'green' },
            blue:   { R: 'yellow', B: 'green',  L: 'white' },
            yellow: { R: 'green',  B: 'white',  L: 'blue' },
            green:  { R: 'white',  B: 'blue',   L: 'yellow' },
        },
        orange: { // U = Orange
            white:  { R: 'green',  B: 'yellow', L: 'blue' },
            green:  { R: 'yellow', B: 'blue',   L: 'white' },
            yellow: { R: 'blue',   B: 'white',  L: 'green' },
            blue:   { R: 'white',  B: 'green',  L: 'yellow' },
        },
    };

    const upAdj = adj[upColor];
    if (!upAdj) {
        console.error(`Adjacency logic missing for Up=${upColor}`);
        return { R: 'red', B: 'blue', L: 'green' }; // Error fallback with valid colors
    }
    const sides = upAdj[frontColor];
    if (!sides) {
        console.error(`Adjacency logic missing for Up=${upColor}, Front=${frontColor}`);
        return { R: 'red', B: 'blue', L: 'green' }; // Error fallback with valid colors
    }

    return sides;
}

// --- Determine face colors based on the desired bottom color ---
// Returns a map where keys are standard faces (U, D, F...) and values
// are the *actual* colors on those faces when `bottomColor` is at the bottom.
function determineOrientationColors(bottomColor: CubeColor): Record<Face, CubeColor> {
    const actualFaceColors: Partial<Record<Face, CubeColor>> = {};
    
    // Handle standard orientation separately
    if (bottomColor === 'yellow') {
        Object.assign(actualFaceColors, STANDARD_FACE_COLORS);
    } else {
        // Unified logic for all other bottom colors
        const upColor = COLOR_PAIRS[bottomColor];
        actualFaceColors['U'] = upColor;
        actualFaceColors['D'] = bottomColor;

        // Determine potential side colors (all except U and D)
        const potentialSideColors = COLORS.filter(c => c !== upColor && c !== bottomColor);

        // Randomize Front face color among potential sides
        const frontColor = getRandomElement(potentialSideColors);
        actualFaceColors['F'] = frontColor;

        // Calculate R, B, L based on determined U and randomized F
        const sides = getSideColors(upColor, frontColor);
        actualFaceColors['R'] = sides.R;
        actualFaceColors['B'] = sides.B;
        actualFaceColors['L'] = sides.L;
    }

    return actualFaceColors as Record<Face, CubeColor>;
}

// --- Generate Problem --- 
export function generateOrientationProblem(bottomColorSetting: CubeColor | 'random'): OrientationProblem {
  // Determine if bottom is fixed; if not, pick random bottom
  const fixedBottom = bottomColorSetting !== 'random';
  const actualBottom = fixedBottom ? bottomColorSetting : getRandomElement(COLORS);
  // Compute full orientation map for actual bottom
  const faceColors: Record<Face, CubeColor> = determineOrientationColors(actualBottom);

  let ref1Face: Face;
  let ref2Face: Face;
  const sideFaces: Face[] = ['F', 'R', 'B', 'L'];

  if (fixedBottom) { // Applies to ALL fixed bottoms now
    ref1Face = 'D';
    ref2Face = getRandomElement(sideFaces); // Ref2 is always a side face
  } else {
    // Random bottom: Pick two distinct random faces as refs
    ref1Face = getRandomElement(FACES);
    const possibleRef2 = FACE_ADJACENCIES[ref1Face].filter(adjFace => {
      // Ensure ref2 is not opposite ref1 based on the actual colors
      const actualColorOnAdj = faceColors[adjFace];
      return actualColorOnAdj !== COLOR_PAIRS[faceColors[ref1Face]]; 
    });
    if (possibleRef2.length === 0) { 
        console.warn("Could not find non-opposite adjacent face, picking random adjacent.");
        possibleRef2.push(...FACE_ADJACENCIES[ref1Face]); 
    }
    ref2Face = getRandomElement(possibleRef2);
  }

  const ref1Color = faceColors[ref1Face];
  const ref2Color = faceColors[ref2Face];

  // Pick a target face
  let targetFace: Face;
  if (fixedBottom) { // Applies to ALL fixed bottoms
    // Target must be a side face different from ref2
    targetFace = getRandomElement(sideFaces.filter(f => f !== ref2Face));
  } else {
    // Random bottom: Target is any face different from ref1 and ref2
    targetFace = getRandomElement(FACES.filter(f => f !== ref1Face && f !== ref2Face));
  }

  const targetRelation = FACE_TO_RELATION_MAP[targetFace];
  const correctAnswer = faceColors[targetFace];

  return {
    ref1Face,
    ref2Face,
    ref1Color,
    ref2Color,
    targetRelation,
    correctAnswer,
    faceColors,
    bottomColor: actualBottom,
  };
}

// --- Check Answer --- 
export function checkAnswer(
  problem: OrientationProblem,
  selectedColor: CubeColor
): boolean {
  return problem.correctAnswer === selectedColor;
} 