import { useCallback } from "react";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import Konva from "konva";
import { useCanvasContext } from "@/app/context/canvas";
import { useShapeStore } from "@/app/store/canvas";
import { useGuideStore } from "@/app/store/guides";
import {
  SnapEdges,
  SnapResult,
  calculateSnap,
  getSnapEdges,
} from "@/utils/snap";

export default function useSnap() {
  const { stageRef } = useCanvasContext();
  const setGuides = useGuideStore((s) => s.setGuides);
  const clearGuides = useGuideStore((s) => s.clearGuides);

  const getSnapTargets = useCallback(
    (excludeId?: string): SnapEdges[] => {
      const stage = stageRef.current;
      if (!stage) return [];

      const shapeLayer = stage.findOne("#_shapeLayer") as Konva.Layer | undefined;
      if (!shapeLayer) return [];

      const targets: SnapEdges[] = [];

      // Other shapes (excluding the dragged one and isDrawing shapes)
      const shapes = shapeLayer.find(".shape") as Konva.Node[];
      for (const shape of shapes) {
        if (excludeId && shape.attrs.id === excludeId) continue;
        if (shape.attrs.isDrawing) continue;
        const rect = shape.getClientRect({ relativeTo: shapeLayer });
        targets.push(getSnapEdges(rect));
      }

      // Canvas boundaries + center lines
      const { canvasOption } = useShapeStore.getState();
      const { width: cw, height: ch } = canvasOption.canvasSize;

      const clipX = shapeLayer.clipX();
      const clipY = shapeLayer.clipY();

      targets.push({
        left: clipX,
        right: clipX + cw,
        top: clipY,
        bottom: clipY + ch,
        centerX: clipX + cw / 2,
        centerY: clipY + ch / 2,
      });

      return targets;
    },
    [stageRef],
  );

  const onSnapDragMove = useCallback(
    (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
      const node = e.target;
      const stage = stageRef.current;
      if (!stage) return;

      const shapeLayer = stage.findOne("#_shapeLayer") as Konva.Layer | undefined;
      if (!shapeLayer) return;

      const id = node.attrs.id as string;
      const targets = getSnapTargets(id);
      if (targets.length === 0) return;

      // Get AABB in layer coordinates
      const clientRect = node.getClientRect({ relativeTo: shapeLayer });
      const draggedEdges = getSnapEdges(clientRect);

      const result = calculateSnap(draggedEdges, targets);

      // Apply delta to node position (not to AABB — handles center-origin shapes)
      if (result.dx !== null) {
        node.x(node.x() + result.dx);
      }
      if (result.dy !== null) {
        node.y(node.y() + result.dy);
      }

      setGuides(result.guides);
    },
    [stageRef, getSnapTargets, setGuides],
  );

  const snapRect = useCallback(
    (
      rect: { x: number; y: number; width: number; height: number },
      excludeId?: string,
      options?: {
        vKeys?: ("left" | "right" | "centerX")[];
        hKeys?: ("top" | "bottom" | "centerY")[];
      },
    ): SnapResult => {
      const targets = getSnapTargets(excludeId);
      const edges = getSnapEdges(rect);
      const result = calculateSnap(edges, targets, undefined, options);
      setGuides(result.guides);
      return result;
    },
    [getSnapTargets, setGuides],
  );

  return { onSnapDragMove, clearGuides, getSnapTargets, snapRect };
}
