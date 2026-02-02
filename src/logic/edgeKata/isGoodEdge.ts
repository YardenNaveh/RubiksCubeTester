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

  // Step 1: Find the "important sticker"
  // - If edge has U or D color → that sticker is important
  // - Otherwise → the F or B colored sticker is important
  const hasUDColor = c1 === UColor || c1 === DColor || c2 === UColor || c2 === DColor;
  
  let importantColor: CubeColor;
  let importantFace: Face;
  let edgeKind: EdgeKind;
  
  if (hasUDColor) {
    // Important sticker is the one with U or D color
    const isFirstSticker = c1 === UColor || c1 === DColor;
    importantColor = isFirstSticker ? c1 : c2;
    importantFace = isFirstSticker ? f1 : f2;
    edgeKind = 'UD';
  } else {
    // Important sticker is the one with F or B color
    const isFirstSticker = c1 === FColor || c1 === BColor;
    importantColor = isFirstSticker ? c1 : c2;
    importantFace = isFirstSticker ? f1 : f2;
    edgeKind = 'FB';
  }

  // Step 2: Determine the edge's CURRENT layer based on its current position
  // y ≈ 1 → U layer, y ≈ -1 → D layer, y ≈ 0 → middle layer
  const currentY = Math.round(liveEdge.currentPosition.y);
  const isCurrentlyInUDLayer = currentY === 1 || currentY === -1;

  // Step 3: Classification based on CURRENT layer
  // - If currently in U/D layer → good if important sticker faces U or D
  // - If currently in middle layer → good if important sticker faces F or B
  let good: boolean;
  let explanation: string;

  if (isCurrentlyInUDLayer) {
    good = importantFace === 'U' || importantFace === 'D';
    explanation = good
      ? `Edge in U/D layer: ${importantColor} sticker faces ${importantFace}, so Good.`
      : `Edge in U/D layer: ${importantColor} sticker faces ${importantFace} (not U/D), so Bad.`;
  } else {
    good = importantFace === 'F' || importantFace === 'B';
    explanation = good
      ? `Edge in middle layer: ${importantColor} sticker faces ${importantFace}, so Good.`
      : `Edge in middle layer: ${importantColor} sticker faces ${importantFace} (not F/B), so Bad.`;
  }

  return {
    isGood: good,
    kind: edgeKind,
    explanation,
  };
}

