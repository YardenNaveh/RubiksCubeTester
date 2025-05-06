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