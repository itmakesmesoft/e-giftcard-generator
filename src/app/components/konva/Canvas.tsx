import Barcode from "./Barcode";
import BrushCursor from "./BrushCursor";
import CanvasImage from "./CanvasImage";
import EditableText from "./EditableText";
import GuideLines from "./GuideLines";
import { Vector2d } from "konva/lib/types";
import { Arrow, Circle, Layer, Line, Rect, Ellipse, Star } from "react-konva";
import { useControlStore, useShapeStore } from "@/app/store/canvas";
import { useGuideStore } from "@/app/store/guides";
import { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";
import { useCanvasContext } from "@/app/context/canvas";
import React, { useCallback, useRef } from "react";
import { UpdateShapeCommand } from "@/app/lib/command";
import useCommandManager from "@/app/hooks/useCommandManager";
import useSnap from "@/app/hooks/useSnap";

export type ShapeType =
  | "rectangle"
  | "circle"
  | "arrow"
  | "line"
  | "triangle"
  | "ellipse"
  | "star";

const Canvas = () => {
  const { canvasPos } = useCanvasContext();
  const canvasOption = useShapeStore((state) => state.canvasOption);
  const guides = useGuideStore((s) => s.guides);
  const { onSnapDragMove, clearGuides } = useSnap();

  return (
    <>
      <Layer
        id="_shapeLayer"
        clip={{ ...canvasOption.canvasSize, ...canvasPos }}
      >
        <ShapesRenderer
          onSnapDragMove={onSnapDragMove}
          clearGuides={clearGuides}
        />
      </Layer>
      <Layer
        id="_drawLayer"
        clip={{ ...canvasOption.canvasSize, ...canvasPos }}
      >
        <DrawingRenderer />
      </Layer>
      <Layer id="_cursorLayer" listening={false}>
        <BrushCursor />
      </Layer>
      <GuideLines guides={guides} />
    </>
  );
};

const DrawingRenderer = React.memo(() => {
  const shapes = useShapeStore((state) => state.shapes);

  return shapes.map((node, index) => {
    switch (node.type) {
      case "pencil":
      case "eraser":
        return (
          <Line
            key={index}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
            listening={false}
            {...node}
          />
        );
    }
  });
});

interface ShapesRendererProps {
  onSnapDragMove: (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => void;
  clearGuides: () => void;
}

const ShapesRenderer = React.memo(
  ({ onSnapDragMove, clearGuides }: ShapesRendererProps) => {
    const action = useControlStore((state) => state.action);

    const shapes = useShapeStore((state) => state.shapes);
    const { execute } = useCommandManager();
    const { getAllSelectedNodes, cancelPendingDeselect } = useCanvasContext();

    const isDraggable = action === "select";

    const dragStartPositionsRef = useRef<Map<string, Vector2d>>(new Map());
    const dragNodesRef = useRef<Node<NodeConfig>[]>([]);

    const onDragStart = useCallback(
      (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
        cancelPendingDeselect();
        const selectedNodes = getAllSelectedNodes();
        dragNodesRef.current = selectedNodes;
        if (selectedNodes.length <= 1) return;
        const positions = new Map<string, Vector2d>();
        selectedNodes.forEach((node) => {
          positions.set(node.attrs.id, node.getPosition());
        });
        dragStartPositionsRef.current = positions;
      },
      [cancelPendingDeselect, getAllSelectedNodes],
    );

    const onDragMove = useCallback(
      (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
        onSnapDragMove(e);

        const selectedNodes = dragNodesRef.current;
        if (selectedNodes.length <= 1) return;

        const draggedId = e.target.attrs.id;
        const startPositions = dragStartPositionsRef.current;
        const draggedStart = startPositions.get(draggedId);
        if (!draggedStart) return;

        const dx = e.target.x() - draggedStart.x;
        const dy = e.target.y() - draggedStart.y;

        selectedNodes.forEach((node) => {
          if (node.attrs.id === draggedId) return;
          const startPos = startPositions.get(node.attrs.id);
          if (startPos) {
            node.x(startPos.x + dx);
            node.y(startPos.y + dy);
          }
        });
      },
      [onSnapDragMove],
    );

    const getShapes = () => useShapeStore.getState().shapes;
    const rawSetShapes = (
      shapes: typeof getShapes extends () => infer R ? R : never,
    ) => useShapeStore.getState().setShapes(shapes);

    const onDragEnd = useCallback(
      (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
        clearGuides();
        const dragNodes = dragNodesRef.current;
        dragNodesRef.current = [];

        if (dragNodes.length > 1) {
          const movedIds = new Map(
            dragNodes.map((n) => [n.attrs.id, n.getPosition()]),
          );
          const newShapes = getShapes().map((shape) => {
            const pos = movedIds.get(shape.id);
            return pos ? { ...shape, ...pos } : shape;
          });
          execute(new UpdateShapeCommand(newShapes, getShapes, rawSetShapes));
          return;
        }

        const position = e.target.getPosition() as Vector2d;
        const id = e.target.attrs.id;
        const newShapes = getShapes().map((shape) =>
          shape.id === id ? { ...shape, ...position } : shape,
        );
        execute(new UpdateShapeCommand(newShapes, getShapes, rawSetShapes));
      },
      [execute, clearGuides],
    );

    return (
      <>
        {shapes.map((node, index) => {
          const strokeWidth = node.hasStroke ? node.strokeWidth : 0;
          switch (node.type) {
            case "rectangle":
              return (
                <Rect
                  key={index}
                  strokeScaleEnabled={false}
                  perfectDrawEnabled={false}
                  {...node}
                  strokeWidth={strokeWidth}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "circle":
              return (
                <Circle
                  key={index}
                  strokeScaleEnabled={false}
                  perfectDrawEnabled={false}
                  {...node}
                  strokeWidth={strokeWidth}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "arrow":
              return (
                <Arrow
                  key={index}
                  strokeScaleEnabled={false}
                  perfectDrawEnabled={false}
                  {...node}
                  strokeWidth={strokeWidth}
                  points={node.points}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "triangle":
              return (
                <Line
                  key={index}
                  strokeScaleEnabled={false}
                  perfectDrawEnabled={false}
                  closed={true}
                  points={node.points ?? [0, 0, 100, 100, 0, 100]}
                  {...node}
                  strokeWidth={strokeWidth}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "line":
              return (
                <Line
                  key={index}
                  strokeScaleEnabled={false}
                  perfectDrawEnabled={false}
                  points={node.points}
                  {...node}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "ellipse":
              return (
                <Ellipse
                  key={index}
                  strokeScaleEnabled={false}
                  perfectDrawEnabled={false}
                  radiusX={node.radiusX ?? 0}
                  radiusY={node.radiusY ?? 0}
                  {...node}
                  strokeWidth={strokeWidth}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "star":
              return (
                <Star
                  key={index}
                  strokeScaleEnabled={false}
                  perfectDrawEnabled={false}
                  numPoints={node.numPoints ?? 5}
                  innerRadius={node.innerRadius}
                  outerRadius={node.outerRadius}
                  {...node}
                  strokeWidth={strokeWidth}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "image":
              return (
                <CanvasImage
                  key={index}
                  alt="이미지"
                  perfectDrawEnabled={false}
                  dataURL={node.dataURL}
                  {...node}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "text":
              return (
                <EditableText
                  key={index}
                  perfectDrawEnabled={false}
                  {...node}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
            case "barcode":
              const { text, codeFormat, ...restProps } = node;
              return (
                <Barcode
                  key={index}
                  text={text}
                  codeFormat={codeFormat}
                  perfectDrawEnabled={false}
                  {...restProps}
                  draggable={isDraggable}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                />
              );
          }
        })}
      </>
    );
  },
);

DrawingRenderer.displayName = "DrawingRenderer";
ShapesRenderer.displayName = "ShapesRenderer";

export default Canvas;
