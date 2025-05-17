import Barcode from "./Barcode";
import CanvasImage from "./CanvasImage";
import EditableText from "./EditableText";
import { Vector2d } from "konva/lib/types";
import { Arrow, Circle, Layer, Line, Rect, Ellipse, Star } from "react-konva";
import { useControlStore, useShapeStore } from "@/app/store/canvas";
import { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";
import { useCanvasContext } from "@/app/context/canvas";
import React, { useCallback } from "react";

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

  return (
    <>
      <Layer
        id="_shapeLayer"
        clip={{ ...canvasOption.canvasSize, ...canvasPos }}
      >
        <ShapesRenderer />
      </Layer>
      <Layer
        id="_drawLayer"
        clip={{ ...canvasOption.canvasSize, ...canvasPos }}
      >
        <DrawingRenderer />
      </Layer>
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

const ShapesRenderer = React.memo(() => {
  const action = useControlStore((state) => state.action);

  const shapes = useShapeStore((state) => state.shapes);
  const setShapes = useShapeStore((state) => state.setShapes);

  const isDraggable = action === "select";

  const onDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
      const position = e.target.getPosition() as Vector2d;
      const id = e.target.attrs.id;
      setShapes((shapes) =>
        shapes.map((shape) => {
          return shape.id === id
            ? {
                ...shape,
                ...position,
              }
            : shape;
        })
      );
    },
    [setShapes]
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
                onDragEnd={onDragEnd}
              />
            );
        }
      })}
    </>
  );
});

DrawingRenderer.displayName = "DrawingRenderer";
ShapesRenderer.displayName = "ShapesRenderer";

export default Canvas;
