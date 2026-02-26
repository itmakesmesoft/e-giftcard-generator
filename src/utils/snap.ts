export const SNAP_TOLERANCE = 7;
export const GUIDE_COLOR = "#d9d9d9";
export const GUIDE_STROKE_WIDTH = 1;
export const GUIDE_DASH = [4, 4];

export interface SnapEdges {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export interface GuideLine {
  orientation: "H" | "V";
  position: number;
  start: number;
  end: number;
}

export interface SnapResult {
  dx: number | null;
  dy: number | null;
  guides: GuideLine[];
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getSnapEdges(rect: Rect): SnapEdges {
  return {
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
    bottom: rect.y + rect.height,
    centerX: rect.x + rect.width / 2,
    centerY: rect.y + rect.height / 2,
  };
}

type EdgePairV = {
  dragVal: number;
  targetVal: number;
  dragKey: "left" | "right" | "centerX";
};
type EdgePairH = {
  dragVal: number;
  targetVal: number;
  dragKey: "top" | "bottom" | "centerY";
};

export function calculateSnap(
  dragged: SnapEdges,
  targets: SnapEdges[],
  tolerance: number = SNAP_TOLERANCE,
  options?: {
    vKeys?: EdgePairV["dragKey"][];
    hKeys?: EdgePairH["dragKey"][];
  },
): SnapResult {
  let bestDx: number | null = null;
  let bestAbsDx = tolerance + 1;
  let bestDy: number | null = null;
  let bestAbsDy = tolerance + 1;

  const vMatches: { dragEdge: EdgePairV; target: SnapEdges }[] = [];
  const hMatches: { dragEdge: EdgePairH; target: SnapEdges }[] = [];

  const vKeys: EdgePairV["dragKey"][] = options?.vKeys ?? ["left", "right", "centerX"];
  const hKeys: EdgePairH["dragKey"][] = options?.hKeys ?? ["top", "bottom", "centerY"];

  for (const target of targets) {
    // Vertical (X-axis) snapping
    for (const dk of vKeys) {
      for (const tk of vKeys) {
        const diff = target[tk] - dragged[dk];
        const absDiff = Math.abs(diff);
        if (absDiff <= tolerance) {
          if (absDiff < bestAbsDx) {
            bestAbsDx = absDiff;
            bestDx = diff;
            vMatches.length = 0;
          }
          if (absDiff === bestAbsDx) {
            vMatches.push({
              dragEdge: {
                dragVal: dragged[dk],
                targetVal: target[tk],
                dragKey: dk,
              },
              target,
            });
          }
        }
      }
    }

    // Horizontal (Y-axis) snapping
    for (const dk of hKeys) {
      for (const tk of hKeys) {
        const diff = target[tk] - dragged[dk];
        const absDiff = Math.abs(diff);
        if (absDiff <= tolerance) {
          if (absDiff < bestAbsDy) {
            bestAbsDy = absDiff;
            bestDy = diff;
            hMatches.length = 0;
          }
          if (absDiff === bestAbsDy) {
            hMatches.push({
              dragEdge: {
                dragVal: dragged[dk],
                targetVal: target[tk],
                dragKey: dk,
              },
              target,
            });
          }
        }
      }
    }
  }

  const guides: GuideLine[] = [];

  // Build vertical guide lines (X-axis snap)
  if (bestDx !== null) {
    const snappedDragged = shiftEdgesX(dragged, bestDx);
    for (const m of vMatches) {
      const xPos = m.dragEdge.targetVal;
      const minY = Math.min(snappedDragged.top, m.target.top);
      const maxY = Math.max(snappedDragged.bottom, m.target.bottom);
      guides.push({ orientation: "V", position: xPos, start: minY, end: maxY });
    }
  }

  // Build horizontal guide lines (Y-axis snap)
  if (bestDy !== null) {
    const snappedDragged = shiftEdgesY(dragged, bestDy);
    for (const m of hMatches) {
      const yPos = m.dragEdge.targetVal;
      const minX = Math.min(snappedDragged.left, m.target.left);
      const maxX = Math.max(snappedDragged.right, m.target.right);
      guides.push({ orientation: "H", position: yPos, start: minX, end: maxX });
    }
  }

  return { dx: bestDx, dy: bestDy, guides: deduplicateGuides(guides) };
}

function shiftEdgesX(edges: SnapEdges, dx: number): SnapEdges {
  return {
    ...edges,
    left: edges.left + dx,
    right: edges.right + dx,
    centerX: edges.centerX + dx,
  };
}

function shiftEdgesY(edges: SnapEdges, dy: number): SnapEdges {
  return {
    ...edges,
    top: edges.top + dy,
    bottom: edges.bottom + dy,
    centerY: edges.centerY + dy,
  };
}

function deduplicateGuides(guides: GuideLine[]): GuideLine[] {
  const seen = new Map<string, GuideLine>();
  for (const g of guides) {
    const key = `${g.orientation}:${g.position}`;
    const existing = seen.get(key);
    if (existing) {
      existing.start = Math.min(existing.start, g.start);
      existing.end = Math.max(existing.end, g.end);
    } else {
      seen.set(key, { ...g });
    }
  }
  return Array.from(seen.values());
}
