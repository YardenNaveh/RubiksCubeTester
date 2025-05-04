import {
  CubeColor,
  COLORS,
  COLOR_PAIRS,
  TargetRelation,
  TARGET_RELATIONS,
  ADJACENT_FACES
} from './cubeConstants';

export interface OrientationProblem {
  frontFaceColor: CubeColor;
  rightFaceColor: CubeColor; // Defining with Front+Right is sufficient
  targetRelation: TargetRelation;
  correctAnswer: CubeColor;
  upFaceColor: CubeColor;
  leftFaceColor: CubeColor;
  downFaceColor: CubeColor;
  backFaceColor: CubeColor;
}

// Helper to get a random element from an array
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Given Front and Right colors, determine all other face colors
// based on the standard Western color scheme
export function determineFullOrientation(
  front: CubeColor,
  right: CubeColor
): { [key in TargetRelation | 'currentFront' | 'currentRight']: CubeColor } {
  if (!ADJACENT_FACES[front].includes(right)) {
    throw new Error(`Front (${front}) and Right (${right}) faces cannot be adjacent.`);
  }

  const back = COLOR_PAIRS[front];
  const left = COLOR_PAIRS[right];

  // Determine Up/Down based on standard adjacencies
  // This is the trickiest part and defines the standard orientation model
  let up: CubeColor;
  let down: CubeColor;

  // Standard layout assumption: White-Up, Red-Front -> Blue-Right
  // We need to derive the Up color based on the given Front and Right
  // This essentially involves solving a small spatial puzzle based on the fixed color scheme.

  // Example cases based on standard Western Scheme:
  // F=Red, R=Blue => U=White
  // F=Blue, R=Orange => U=White
  // F=Orange, R=Green => U=White
  // F=Green, R=Red => U=White
  // F=Red, R=Green => U=Yellow (Down is white)
  // F=Blue, R=Red => U=Yellow
  // etc.

  // Let's find the common adjacent color to Front and Right that is NOT the opposite of the other
  const commonAdjacent = ADJACENT_FACES[front].filter(
    color => ADJACENT_FACES[right].includes(color)
  );

  if (commonAdjacent.length !== 2) {
      // Should always be 2 common neighbors (Up and Down)
      throw new Error("Internal error: Invalid adjacency calculation.");
  }

  // How to decide which of the two common neighbors is UP?
  // We need a reference point. Let's use the standard White-Up, Yellow-Down reference.
  // If F=Red, R=Blue, common are White/Yellow. Standard orientation has White Up.
  // If F=Red, R=Green, common are White/Yellow. Standard orientation has Yellow Up.

  // A simpler way might be a lookup table based on Front/Right pairs.
  // THIS LOOKUP NOW ASSUMES WHITE-DOWN / YELLOW-UP
  const upLookup: { [key: string]: CubeColor } = {
    // Original White-UP pairs now map to Yellow-UP
    'red-blue': 'yellow', 'blue-orange': 'yellow', 'orange-green': 'yellow', 'green-red': 'yellow',

    // Pairs where Green was UP (relative to Front/Right) remain the same
    'red-white': 'green', 'white-orange': 'green', 'orange-yellow': 'green', 'yellow-red': 'green',

    // Original Yellow-UP pairs now map to White-UP
    'red-green': 'white', 'green-orange': 'white', 'orange-blue': 'white', 'blue-red': 'white',

    // Pairs where Red was UP remain the same
    'blue-white': 'red', 'white-green': 'red', 'green-yellow': 'red', 'yellow-blue': 'red',

    // Pairs where Orange was UP remain the same
    'green-white': 'orange', 'white-red': 'orange', 'red-yellow': 'orange', 'yellow-green': 'orange',

    // Pairs where Blue was UP remain the same
    'orange-white': 'blue', 'white-blue': 'blue', 'blue-yellow': 'blue', 'yellow-orange': 'blue',
  };

  const key = `${front}-${right}` as keyof typeof upLookup;
  if (!(key in upLookup)) {
      throw new Error(`Internal error: Missing Front/Right pair in lookup: ${key}`);
  }
  up = upLookup[key];
  down = COLOR_PAIRS[up];

  return {
    front: front,
    back: back,
    left: left,
    right: right,
    up: up,
    down: down,
    currentFront: front,
    currentRight: right,
  };
}


export function generateOrientationProblem(): OrientationProblem {
  // 1. Pick a random Front face color
  const frontFaceColor = getRandomElement(COLORS);

  // 2. Pick a random Right face color that is adjacent to Front
  const possibleRightColors = ADJACENT_FACES[frontFaceColor];
  const rightFaceColor = getRandomElement(possibleRightColors);

  // 3. Determine the full orientation based on Front and Right
  const orientation = determineFullOrientation(frontFaceColor, rightFaceColor);

  // 4. Pick a random target relation
  const targetRelation = getRandomElement(TARGET_RELATIONS);

  // 5. Determine the correct answer color for that relation
  const correctAnswer = orientation[targetRelation];

  return {
    frontFaceColor,
    rightFaceColor,
    targetRelation,
    correctAnswer,
    upFaceColor: orientation.up,
    leftFaceColor: orientation.left,
    downFaceColor: orientation.down,
    backFaceColor: orientation.back,
  };
}

// Utility to check answer (can be used in the component)
export function checkAnswer(
  problem: OrientationProblem,
  selectedColor: CubeColor
): boolean {
  return problem.correctAnswer === selectedColor;
} 