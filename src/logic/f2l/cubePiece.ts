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

// Axis for rotations
const AXIS_Y = new THREE.Vector3(0, 1, 0);

/**
 * Applies a U-turn (90 degrees clockwise around Y axis) to a cubie's 
 * position and orientation if it's in the U layer.
 * @param position Current position of the cubie
 * @param orientation Current orientation of the cubie
 * @returns Updated { position, orientation }
 */
export function applyUMove(
  position: THREE.Vector3,
  orientation: THREE.Quaternion
): { position: THREE.Vector3; orientation: THREE.Quaternion } {
  const newPosition = position.clone();
  const newOrientation = orientation.clone();

  // Rotation matrix for 90 degrees around Y
  const rotationMatrix = new THREE.Matrix4().makeRotationAxis(AXIS_Y, -Math.PI / 2); // Negative for clockwise from top view

  // Rotate position
  newPosition.applyMatrix4(rotationMatrix);
  
  // Rotate orientation
  const rotationQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
  newOrientation.premultiply(rotationQuaternion);

  return { position: newPosition, orientation: newOrientation };
}

/**
 * Applies a U-prime turn (-90 degrees)
 */
export function applyUPrimeMove(
  position: THREE.Vector3,
  orientation: THREE.Quaternion
): { position: THREE.Vector3; orientation: THREE.Quaternion } {
  const newPosition = position.clone();
  const newOrientation = orientation.clone();
  const rotationMatrix = new THREE.Matrix4().makeRotationAxis(AXIS_Y, Math.PI / 2);
  newPosition.applyMatrix4(rotationMatrix);
  const rotationQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
  newOrientation.premultiply(rotationQuaternion);
  return { position: newPosition, orientation: newOrientation };
}

/**
 * Applies a U2 turn (180 degrees)
 */
export function applyU2Move(
  position: THREE.Vector3,
  orientation: THREE.Quaternion
): { position: THREE.Vector3; orientation: THREE.Quaternion } {
  const newPosition = position.clone();
  const newOrientation = orientation.clone();
  const rotationMatrix = new THREE.Matrix4().makeRotationAxis(AXIS_Y, -Math.PI); // 180 deg
  newPosition.applyMatrix4(rotationMatrix);
  const rotationQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
  newOrientation.premultiply(rotationQuaternion);
  return { position: newPosition, orientation: newOrientation };
} 