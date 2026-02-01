import { COLOR_PAIRS, CubeColor, FACE_MAP } from '../cubeConstants';

export type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export interface OrientationColors {
  UColor: CubeColor;
  DColor: CubeColor;
  FColor: CubeColor;
  BColor: CubeColor;
  LColor: CubeColor;
  RColor: CubeColor;
}

// Inverse mapping for the standard scheme: color -> face letter (in the default cube)
const COLOR_TO_FACE: Record<CubeColor, Face> = Object.fromEntries(
  (Object.entries(FACE_MAP) as Array<[string, CubeColor]>).map(([face, color]) => [color, face as Face])
) as Record<CubeColor, Face>;

type Vec3 = { x: number; y: number; z: number };

const FACE_TO_VEC: Record<Face, Vec3> = {
  R: { x: 1, y: 0, z: 0 },
  L: { x: -1, y: 0, z: 0 },
  U: { x: 0, y: 1, z: 0 },
  D: { x: 0, y: -1, z: 0 },
  F: { x: 0, y: 0, z: 1 },
  B: { x: 0, y: 0, z: -1 },
};

function vecNeg(v: Vec3): Vec3 {
  return { x: -v.x, y: -v.y, z: -v.z };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function vecToFace(v: Vec3): Face {
  const key = `${v.x},${v.y},${v.z}`;
  switch (key) {
    case '1,0,0': return 'R';
    case '-1,0,0': return 'L';
    case '0,1,0': return 'U';
    case '0,-1,0': return 'D';
    case '0,0,1': return 'F';
    case '0,0,-1': return 'B';
    default:
      throw new Error(`Invalid axis vector for face: ${key}`);
  }
}

function colorToVec(color: CubeColor): Vec3 {
  const face = COLOR_TO_FACE[color];
  return FACE_TO_VEC[face];
}

function vecToColor(v: Vec3): CubeColor {
  const face = vecToFace(v);
  return FACE_MAP[face];
}

export function isValidBottomFront(bottom: CubeColor, front: CubeColor): boolean {
  if (bottom === front) return false;
  if (COLOR_PAIRS[bottom] === front) return false; // opposite colors are invalid
  return true;
}

/**
 * Computes the full orientation (U/D/F/B/L/R colors) from a chosen bottom (D) and front (F).
 * Uses the cube's fixed color scheme and right-hand rule: R = U × F.
 */
export function computeOrientationColors(bottom: CubeColor, front: CubeColor): OrientationColors {
  if (!isValidBottomFront(bottom, front)) {
    throw new Error(`Invalid orientation: bottom=${bottom}, front=${front}`);
  }

  // Treat the standard cube as a set of color vectors. We want the chosen colors to map
  // to the D (-Y) and F (+Z) faces in the current orientation.
  const dVec = colorToVec(bottom);
  const fVec = colorToVec(front);

  const uVec = vecNeg(dVec);
  const rVec = cross(uVec, fVec); // R = U × F (right-handed)
  const lVec = vecNeg(rVec);

  // Sanity: rVec must be a principal axis.
  const RColor = vecToColor(rVec);
  const LColor = vecToColor(lVec);

  return {
    UColor: COLOR_PAIRS[bottom],
    DColor: bottom,
    FColor: front,
    BColor: COLOR_PAIRS[front],
    RColor,
    LColor,
  };
}

export function randomValidBottomFront(): { bottom: CubeColor; front: CubeColor } {
  const colors = Object.keys(COLOR_PAIRS) as CubeColor[];
  while (true) {
    const bottom = colors[Math.floor(Math.random() * colors.length)];
    const candidates = colors.filter(c => isValidBottomFront(bottom, c));
    const front = candidates[Math.floor(Math.random() * candidates.length)];
    return { bottom, front };
  }
}

