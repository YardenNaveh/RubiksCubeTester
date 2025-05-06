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
    
    // Reinstate switch statement
    switch(bottomColor) {
        case 'white': // D=White, U=Yellow. Random F.
            actualFaceColors['U'] = 'yellow'; 
            actualFaceColors['D'] = 'white'; 
            const sideColorsW: CubeColor[] = ['red', 'orange', 'blue', 'green'];
            const frontColorW = getRandomElement(sideColorsW);
            actualFaceColors['F'] = frontColorW;
            // Adjacencies for U=Yellow
            switch(frontColorW){
                case 'red':    actualFaceColors['R'] = 'green';  actualFaceColors['B'] = 'orange'; actualFaceColors['L'] = 'blue'; break;
                case 'green':  actualFaceColors['R'] = 'orange'; actualFaceColors['B'] = 'blue';   actualFaceColors['L'] = 'red'; break;
                case 'orange': actualFaceColors['R'] = 'blue';   actualFaceColors['B'] = 'red';    actualFaceColors['L'] = 'green'; break;
                case 'blue':   actualFaceColors['R'] = 'red';    actualFaceColors['B'] = 'green';  actualFaceColors['L'] = 'orange'; break;
            }
            break;

        case 'yellow': // D=Yellow, U=White (Standard)
            Object.assign(actualFaceColors, STANDARD_FACE_COLORS);
            break;

        case 'red': // D=Red, U=Orange. Random F.
            actualFaceColors['U'] = 'orange';
            actualFaceColors['D'] = 'red';
            const sideColorsR: CubeColor[] = ['white', 'yellow', 'blue', 'green'];
            const frontColorR = getRandomElement(sideColorsR);
            actualFaceColors['F'] = frontColorR;
            // Adjacencies for U=Orange (Opposite of U=Red)
            switch(frontColorR){
                case 'white':  actualFaceColors['R'] = 'green'; actualFaceColors['B'] = 'yellow'; actualFaceColors['L'] = 'blue'; break;
                case 'green':  actualFaceColors['R'] = 'yellow'; actualFaceColors['B'] = 'blue'; actualFaceColors['L'] = 'white'; break;
                case 'yellow': actualFaceColors['R'] = 'blue'; actualFaceColors['B'] = 'white'; actualFaceColors['L'] = 'green'; break;
                case 'blue':   actualFaceColors['R'] = 'white'; actualFaceColors['B'] = 'green'; actualFaceColors['L'] = 'yellow'; break;
            }
            break;

        case 'orange': // D=Orange, U=Red. Random F.
            actualFaceColors['U'] = 'red';
            actualFaceColors['D'] = 'orange';
            const sideColorsO: CubeColor[] = ['white', 'yellow', 'blue', 'green'];
            const frontColorO = getRandomElement(sideColorsO);
            actualFaceColors['F'] = frontColorO;
            // Adjacencies for U=Red (Opposite of U=Orange)
            switch(frontColorO){
                case 'white':  actualFaceColors['R'] = 'blue'; actualFaceColors['B'] = 'yellow'; actualFaceColors['L'] = 'green'; break;
                case 'blue':   actualFaceColors['R'] = 'yellow'; actualFaceColors['B'] = 'green'; actualFaceColors['L'] = 'white'; break;
                case 'yellow': actualFaceColors['R'] = 'green'; actualFaceColors['B'] = 'white'; actualFaceColors['L'] = 'blue'; break;
                case 'green':  actualFaceColors['R'] = 'white'; actualFaceColors['B'] = 'blue'; actualFaceColors['L'] = 'yellow'; break;
            }
            break;

         case 'blue': // D=Blue, U=Green. Random F.
             actualFaceColors['U'] = 'green';
             actualFaceColors['D'] = 'blue';
             const sideColorsB: CubeColor[] = ['white', 'yellow', 'red', 'orange'];
             const frontColorB = getRandomElement(sideColorsB);
             actualFaceColors['F'] = frontColorB;
             // Adjacencies for U=Green (Opposite of U=Blue)
             switch(frontColorB){
                 case 'white':  actualFaceColors['R'] = 'red'; actualFaceColors['B'] = 'yellow'; actualFaceColors['L'] = 'orange'; break;
                 case 'red':    actualFaceColors['R'] = 'yellow'; actualFaceColors['B'] = 'orange'; actualFaceColors['L'] = 'white'; break;
                 case 'yellow': actualFaceColors['R'] = 'orange'; actualFaceColors['B'] = 'white'; actualFaceColors['L'] = 'red'; break;
                 case 'orange': actualFaceColors['R'] = 'white'; actualFaceColors['B'] = 'red'; actualFaceColors['L'] = 'yellow'; break;
             }
             break;

        case 'green': // D=Green, U=Blue. Random F.
            actualFaceColors['U'] = 'blue';
            actualFaceColors['D'] = 'green';
            const sideColorsG: CubeColor[] = ['white', 'yellow', 'red', 'orange'];
            const frontColorG = getRandomElement(sideColorsG);
            actualFaceColors['F'] = frontColorG;
            // Adjacencies for U=Blue (Opposite of U=Green)
            switch(frontColorG){
                case 'white':  actualFaceColors['R'] = 'orange'; actualFaceColors['B'] = 'yellow'; actualFaceColors['L'] = 'red'; break;
                case 'orange': actualFaceColors['R'] = 'yellow'; actualFaceColors['B'] = 'red'; actualFaceColors['L'] = 'white'; break;
                case 'yellow': actualFaceColors['R'] = 'red'; actualFaceColors['B'] = 'white'; actualFaceColors['L'] = 'orange'; break;
                case 'red':    actualFaceColors['R'] = 'white'; actualFaceColors['B'] = 'orange'; actualFaceColors['L'] = 'yellow'; break;
            }
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