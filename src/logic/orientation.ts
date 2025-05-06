import {
  CubeColor,
  COLORS,
  COLOR_PAIRS,
  TargetRelation,
  TARGET_RELATIONS,
  ADJACENT_FACES
} from './cubeConstants';

// --- Define standard face notation (used internally) ---
export type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
const FACES: Face[] = ['U', 'D', 'F', 'B', 'L', 'R'];

// --- Map TargetRelation to Face (relative concept) ---
// We assume a view where you look at the FRONT face,
// UP is towards the U face, RIGHT is towards the R face etc.
const RELATION_TO_FACE_MAP: Record<TargetRelation, Face> = {
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

// Inverse map: Color -> Standard Face
const STANDARD_COLOR_TO_FACE = Object.fromEntries(
    Object.entries(STANDARD_FACE_COLORS).map(([face, color]) => [color, face])
) as Record<CubeColor, Face>; // Add type assertion

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
interface OrientationMap {
    faceColors: Record<Face, CubeColor>; // Map from standard Face (U,F..) to actual Color
    colorFaces: Record<CubeColor, Face>; // Map from actual Color to standard Face
}

function getOrientationMap(bottomColor: CubeColor): OrientationMap {
    const bottomFace = STANDARD_COLOR_TO_FACE[bottomColor]; // e.g., if bottomColor='blue', bottomFace='R'
    const topFace = STANDARD_COLOR_TO_FACE[COLOR_PAIRS[bottomColor]]; // e.g., topFace='L'

    // We need a consistent way to determine Front/Back/Left/Right relative to the new Top/Bottom
    // This essentially requires defining a rotation from the standard White=UP orientation.
    
    // --- Simplified Approach for V1.1 --- 
    // Let's stick to the concept that White/Yellow, Blue/Green, Red/Orange are pairs.
    // If Bottom is White (standard D), then U=Y, F=R, B=O, L=G, R=B.
    // If Bottom is Blue (standard R), then Top is Green (standard L).
    // How to find Front? Let's assume we keep White/Yellow axis fixed if possible.
    // If Bottom=Blue(R), Top=Green(L). Keep White(U)/Yellow(D) as U/D? No, that violates adjacency.
    // We need to rotate. Imagine rotating the cube so Blue is at the bottom.
    // If Blue moves to D, then: R->D. Standard R neighbours are U,D,F,B.
    // U(W)->F, D(Y)->B, F(R)->U(?), B(O)->D(?) - this mapping gets complex quickly.

    // --- Revised Simplified Approach: Fixed Reference Frame --- 
    // Keep the STANDARD_FACE_COLORS as the *absolute* reference.
    // When generating a problem, pick a `bottomColor`. Calculate all face colors
    // *relative* to that bottom color by finding the corresponding STANDARD face
    // and using the standard adjacencies.
    
    // Example: bottomColor = blue. Standard face for blue is R.
    // The face physically opposite blue is green (standard L).
    // The faces adjacent to blue are white(U), yellow(D), red(F), orange(B).
    // This doesn't directly give us the orientation map easily.

    // === Let's use the original lookup approach BUT adapt it ===
    // The lookup determined the UP color given FRONT and RIGHT colors, assuming White=UP.
    // We can *adapt* this. Given two *reference colors* (ref1Color, ref2Color) and their *intended relative positions* 
    // (e.g., ref1 is FRONT, ref2 is RIGHT), and a desired `bottomColor`, we can find the implied UP color.

    // THIS FUNCTION BECOMES REDUNDANT with the new problem generation approach below.
    // We'll calculate colors directly in generateOrientationProblem.
    throw new Error("getOrientationMap is deprecated by the new approach.");
}

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

// --- Determine face colors based on the desired bottom color --- 
// Returns a map where keys are standard faces (U, D, F...) and values
// are the *actual* colors on those faces when `bottomColor` is at the bottom.
function determineOrientationColors(bottomColor: CubeColor): Record<Face, CubeColor> {
    const actualFaceColors: Partial<Record<Face, CubeColor>> = {};
    
    // Simplified rotation mappings based on desired bottom color
    switch(bottomColor) {
        case 'white': // U -> D - Special handling for randomized front
            actualFaceColors['U'] = 'yellow'; 
            actualFaceColors['D'] = 'white'; 

            // Randomize Front face color among sides
            const sideColors: CubeColor[] = ['red', 'orange', 'blue', 'green'];
            const frontColor = getRandomElement(sideColors);
            actualFaceColors['F'] = frontColor;

            // Determine R, B, L based on U=Yellow and chosen F
            // Standard adjacencies: U=White neighbors are F=Red, B=Orange, R=Blue, L=Green
            // If U=Yellow, the relative positions are maintained but colors are opposites
            // If F=Red (Standard), R=Blue, B=Orange, L=Green
            // If F=Blue, R=Orange, B=Green, L=Red
            // If F=Orange, R=Green, B=Red, L=Blue
            // If F=Green, R=Red, B=Blue, L=Orange
            switch(frontColor){
                case 'red':
                    actualFaceColors['R'] = 'blue';
                    actualFaceColors['B'] = 'orange';
                    actualFaceColors['L'] = 'green';
                    break;
                case 'blue':
                    actualFaceColors['R'] = 'orange';
                    actualFaceColors['B'] = 'green';
                    actualFaceColors['L'] = 'red';
                    break;
                case 'orange':
                    actualFaceColors['R'] = 'green';
                    actualFaceColors['B'] = 'red';
                    actualFaceColors['L'] = 'blue';
                    break;
                case 'green':
                    actualFaceColors['R'] = 'red';
                    actualFaceColors['B'] = 'blue';
                    actualFaceColors['L'] = 'orange';
                    break;
            }
            break;
        case 'yellow': // D -> D (Standard)
            Object.assign(actualFaceColors, STANDARD_FACE_COLORS);
            break;
        case 'red': // F -> D 
            actualFaceColors['U'] = STANDARD_FACE_COLORS['F']; // Red 
            actualFaceColors['D'] = STANDARD_FACE_COLORS['B']; // Orange
            actualFaceColors['F'] = STANDARD_FACE_COLORS['D']; // Yellow
            actualFaceColors['B'] = STANDARD_FACE_COLORS['U']; // White
            actualFaceColors['L'] = STANDARD_FACE_COLORS['L']; // Green
            actualFaceColors['R'] = STANDARD_FACE_COLORS['R']; // Blue
            break;
        case 'orange': // B -> D
            actualFaceColors['U'] = STANDARD_FACE_COLORS['B']; // Orange
            actualFaceColors['D'] = STANDARD_FACE_COLORS['F']; // Red
            actualFaceColors['F'] = STANDARD_FACE_COLORS['U']; // White
            actualFaceColors['B'] = STANDARD_FACE_COLORS['D']; // Yellow
            actualFaceColors['L'] = STANDARD_FACE_COLORS['L']; // Green
            actualFaceColors['R'] = STANDARD_FACE_COLORS['R']; // Blue
            break;
         case 'blue': // R -> D
            actualFaceColors['U'] = STANDARD_FACE_COLORS['F']; // Red 
            actualFaceColors['D'] = STANDARD_FACE_COLORS['B']; // Orange
            actualFaceColors['F'] = STANDARD_FACE_COLORS['L']; // Green
            actualFaceColors['B'] = STANDARD_FACE_COLORS['R']; // Blue
            actualFaceColors['L'] = STANDARD_FACE_COLORS['D']; // Yellow
            actualFaceColors['R'] = STANDARD_FACE_COLORS['U']; // White
            break;
        case 'green': // L -> D
            actualFaceColors['U'] = STANDARD_FACE_COLORS['F']; // Red
            actualFaceColors['D'] = STANDARD_FACE_COLORS['B']; // Orange
            actualFaceColors['F'] = STANDARD_FACE_COLORS['R']; // Blue
            actualFaceColors['B'] = STANDARD_FACE_COLORS['L']; // Green
            actualFaceColors['L'] = STANDARD_FACE_COLORS['U']; // White
            actualFaceColors['R'] = STANDARD_FACE_COLORS['D']; // Yellow
            break;
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

  if (fixedBottom && actualBottom === 'white') {
    // Special case: White bottom, random front. Ref1=D, Ref2=random side.
    ref1Face = 'D';
    ref2Face = getRandomElement(sideFaces);
  } else if (fixedBottom) {
    // Other fixed bottom: Ref1=D, Ref2=random adjacent standard face
    ref1Face = 'D';
    // Get standard faces adjacent to the standard face of the bottom color
    const stdBottomFace = STANDARD_COLOR_TO_FACE[actualBottom];
    ref2Face = getRandomElement(FACE_ADJACENCIES[stdBottomFace]);
  } else {
    // Random bottom: Pick two distinct random faces as refs
    ref1Face = getRandomElement(FACES);
    const possibleRef2 = FACE_ADJACENCIES[ref1Face].filter(adjFace => {
      const actualColorOnAdj = faceColors[adjFace];
      const stdFaceOfActual = STANDARD_COLOR_TO_FACE[actualColorOnAdj];
      const stdOppositeOfRef1 = STANDARD_COLOR_TO_FACE[COLOR_PAIRS[faceColors[ref1Face]]];
      return stdFaceOfActual !== stdOppositeOfRef1;
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
  if (fixedBottom && actualBottom === 'white') {
    // White bottom: Target must be a side face different from ref2
    targetFace = getRandomElement(sideFaces.filter(f => f !== ref2Face));
  } else {
    // Other cases: Target is any face different from ref1 and ref2
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