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

  // Determine edge's solved layer based on its colors:
  // - If edge has U or D color → belongs to U or D layer (top/bottom)
  // - If edge has NO U/D colors → belongs to middle layer
  const belongsToUDLayer = c1 === UColor || c1 === DColor || c2 === UColor || c2 === DColor;

  if (belongsToUDLayer) {
    // U/D layer edge: the "important sticker" is the one with U or D color
    const importantStickerIndex = (c1 === UColor || c1 === DColor) ? 1 : 2;
    const importantColor = importantStickerIndex === 1 ? c1 : c2;
    const importantFace = importantStickerIndex === 1 ? f1 : f2;
    
    // GOOD if important sticker is facing U or D
    // BAD if important sticker is facing any side face (F, B, L, R)
    const good = importantFace === 'U' || importantFace === 'D';

    return {
      isGood: good,
      kind: 'UD',
      explanation: good
        ? `U/D edge: the ${importantColor} sticker is facing ${importantFace}, so Good.`
        : `U/D edge: the ${importantColor} sticker is facing ${importantFace} (not U/D), so Bad.`,
    };
  }

  // Middle layer edge: the "important sticker" is the one with F or B color
  const importantStickerIndex = (c1 === FColor || c1 === BColor) ? 1 : 2;
  const importantColor = importantStickerIndex === 1 ? c1 : c2;
  const importantFace = importantStickerIndex === 1 ? f1 : f2;
  
  // GOOD if important sticker is facing F or B
  // BAD if important sticker is facing any other face (U, D, L, R)
  const good = importantFace === 'F' || importantFace === 'B';

  return {
    isGood: good,
    kind: 'FB',
    explanation: good
      ? `Middle edge: the ${importantColor} sticker is facing ${importantFace}, so Good.`
      : `Middle edge: the ${importantColor} sticker is facing ${importantFace} (not F/B), so Bad.`,
  };
}

