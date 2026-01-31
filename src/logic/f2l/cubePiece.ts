import * as THREE from 'three';
import { CubeColor } from '../cubeConstants';

// Defines which face of a cubie a sticker is on
export type StickerFace = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

export interface CubieSticker {
  face: StickerFace; // The logical face this sticker is on (e.g., the U-facing sticker of UFR)
  color: CubeColor;  // The actual color of this sticker
  // Normal vector in local coordinates of the cubie, points outwards from the sticker
  normal: THREE.Vector3; 
}

export type CubieType = 'corner' | 'edge' | 'center';

export interface CubieDefinition {
  id: string; // Unique ID, e.g., "UFR", "UF", "U"
  type: CubieType;
  initialPosition: THREE.Vector3; // Solved state position relative to cube center
  initialOrientation: THREE.Quaternion; // Solved state orientation
  stickers: CubieSticker[]; // Stickers this piece has
}

// Example: Define the UFR corner piece (White-Red-Blue)
// Assuming standard orientation: White on U, Red on F, Blue on R
// Box faces: +X (Right), -X (Left), +Y (Up), -Y (Down), +Z (Front), -Z (Back)
// Sticker normals point OUT from the center of the cubie.
// A cubie at (0,0,0) with a sticker on its +Y face would have that sticker's normal as (0,1,0).

export const UFR_CORNER_DEF: CubieDefinition = {
  id: 'UFR',
  type: 'corner',
  initialPosition: new THREE.Vector3(1, 1, 1),
  initialOrientation: new THREE.Quaternion().identity(),
  stickers: [
    { face: 'U', color: 'white', normal: new THREE.Vector3(0, 1, 0) }, // Up-facing sticker
    { face: 'F', color: 'red', normal: new THREE.Vector3(0, 0, 1) },   // Front-facing sticker
    { face: 'R', color: 'blue', normal: new THREE.Vector3(1, 0, 0) },  // Right-facing sticker
  ],
};

// --- Transformation Helpers ---

const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

function applyRotation(position: THREE.Vector3, orientation: THREE.Quaternion, axis: THREE.Vector3, angle: number): { position: THREE.Vector3; orientation: THREE.Quaternion } {
  const newPosition = position.clone();
  const newOrientation = orientation.clone();
  const rotationMatrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
  newPosition.applyMatrix4(rotationMatrix);
  const rotationQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
  newOrientation.premultiply(rotationQuaternion);
  // Snap to the integer cube grid to avoid floating drift breaking layer selection
  // (e.g., x=0.499999999 causing x>0.5 checks to fail).
  newPosition.set(
    Math.round(newPosition.x),
    Math.round(newPosition.y),
    Math.round(newPosition.z)
  );
  // Keep quaternions stable.
  newOrientation.normalize();
  return { position: newPosition, orientation: newOrientation };
}

// U-layer moves (around Y axis)
export const applyUMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Y, -Math.PI / 2);
export const applyUPrimeMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Y, Math.PI / 2);
export const applyU2Move = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Y, -Math.PI);

// R-layer moves (around X axis - from R face perspective, a clockwise R move is negative rotation around world X)
export const applyRMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, -Math.PI / 2);
export const applyRPrimeMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, Math.PI / 2);
export const applyR2Move = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, -Math.PI);

// L-layer moves (around X axis - from L face perspective, a clockwise L move is positive rotation around world X)
export const applyLMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, Math.PI / 2);
export const applyLPrimeMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, -Math.PI / 2);
export const applyL2Move = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, Math.PI);

// F-layer moves (around Z axis - from F face perspective, a clockwise F move is negative rotation around world Z)
export const applyFMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, -Math.PI / 2);
export const applyFPrimeMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, Math.PI / 2);
export const applyF2Move = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, -Math.PI);

// B-layer moves (around Z axis - from B face perspective, a clockwise B move is positive rotation around world Z)
export const applyBMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, Math.PI / 2);
export const applyBPrimeMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, -Math.PI / 2);
export const applyB2Move = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, Math.PI);

// --- Whole Cube Rotation Helpers (affect all 26 cubies) ---
// These rotate the entire cube around its center.
// The cubie's `position` is rotated, and its `orientation` is updated to reflect the new frame.

// x: Rotate entire cube around X axis (like an R move but for the whole cube)
export const applyWCxMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, -Math.PI / 2);
// x': Rotate entire cube around X axis prime
export const applyWCxPrimeMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, Math.PI / 2);
// x2: Rotate entire cube around X axis 180
export const applyWCx2Move = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_X, -Math.PI);

// y: Rotate entire cube around Y axis (like a U move but for the whole cube)
export const applyWCyMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Y, -Math.PI / 2);
// y': Rotate entire cube around Y axis prime
export const applyWCyPrimeMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Y, Math.PI / 2);
// y2: Rotate entire cube around Y axis 180
export const applyWCy2Move = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Y, -Math.PI);

// z: Rotate entire cube around Z axis (like an F move but for the whole cube)
export const applyWCzMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, -Math.PI / 2);
// z': Rotate entire cube around Z axis prime
export const applyWCzPrimeMove = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, Math.PI / 2);
// z2: Rotate entire cube around Z axis 180
export const applyWCz2Move = (pos: THREE.Vector3, ori: THREE.Quaternion) => applyRotation(pos, ori, AXIS_Z, -Math.PI); 