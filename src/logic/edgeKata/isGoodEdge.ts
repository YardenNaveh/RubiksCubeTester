import * as THREE from 'three';
import { LiveCubieState } from '../f2l/cubeStateUtil';
import { CubeColor } from '../cubeConstants';
import { Face, OrientationColors } from './orientation';

export type EdgeKind = 'UD' | 'FB';

export interface EdgeGoodBadResult {
  isGood: boolean;
  kind: EdgeKind;
  explanation: string;
}

function worldNormalToFace(n: THREE.Vector3): Face {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);

  if (ax >= ay && ax >= az) return n.x >= 0 ? 'R' : 'L';
  if (ay >= ax && ay >= az) return n.y >= 0 ? 'U' : 'D';
  return n.z >= 0 ? 'F' : 'B';
}

function stickerFace(live: LiveCubieState, localNormal: THREE.Vector3): Face {
  const n = localNormal.clone().applyQuaternion(live.currentOrientation).normalize();
  return worldNormalToFace(n);
}

export function isGoodEdge(liveEdge: LiveCubieState, orientation: OrientationColors): EdgeGoodBadResult {
  if (liveEdge.definition.type !== 'edge') {
    throw new Error(`isGoodEdge expected an edge cubie, got ${liveEdge.definition.type}`);
  }
  if (liveEdge.definition.stickers.length !== 2) {
    throw new Error(`Edge cubie expected 2 stickers, got ${liveEdge.definition.stickers.length}`);
  }

  const s1 = liveEdge.definition.stickers[0];
  const s2 = liveEdge.definition.stickers[1];

  const c1 = s1.color as CubeColor;
  const c2 = s2.color as CubeColor;
  const f1 = stickerFace(liveEdge, s1.normal);
  const f2 = stickerFace(liveEdge, s2.normal);

  const { UColor, DColor, FColor, BColor } = orientation;

  // ZZ Edge Orientation: An edge is "good" if it can be placed correctly using only R, U, L, D moves.
  // For U/D edges: the U/D sticker must NOT be on F or B face (can be on U, D, R, or L).
  // This is because R, U, L, D moves cannot transfer stickers from the F/B faces to U/D faces.
  const isUD = c1 === UColor || c1 === DColor || c2 === UColor || c2 === DColor;
  if (isUD) {
    const udStickerIndex = (c1 === UColor || c1 === DColor) ? 1 : 2;
    const udColor = udStickerIndex === 1 ? c1 : c2;
    const udFace = udStickerIndex === 1 ? f1 : f2;
    // Good if U/D sticker is NOT on F or B face
    const good = udFace !== 'F' && udFace !== 'B';

    return {
      isGood: good,
      kind: 'UD',
      explanation: good
        ? `U/D edge: the ${udColor} sticker is on ${udFace} (not F/B), so Good.`
        : `U/D edge: the ${udColor} sticker is on ${udFace} (F or B face), so Bad.`,
    };
  }

  // Non-U/D edges (equatorial edges): must contain F or B color.
  // For these edges: the F/B sticker must BE on F or B face.
  // This is because R, U, L, D moves keep F/B face stickers in the F/B "orbit",
  // so if the F/B colored sticker starts on F or B face, it can reach its home.
  const fbStickerIndex = (c1 === FColor || c1 === BColor) ? 1 : 2;
  const fbColor = fbStickerIndex === 1 ? c1 : c2;
  const fbFace = fbStickerIndex === 1 ? f1 : f2;
  const good = fbFace === 'F' || fbFace === 'B';

  return {
    isGood: good,
    kind: 'FB',
    explanation: good
      ? `Non-U/D edge: the F/B color (${fbColor}) sticker is on ${fbFace}, so Good.`
      : `Non-U/D edge: the F/B color (${fbColor}) sticker is on ${fbFace} (not F/B), so Bad.`,
  };
}

