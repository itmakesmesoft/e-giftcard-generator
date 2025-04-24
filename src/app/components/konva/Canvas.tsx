import Barcode from "./Barcode";
import CanvasImage from "./CanvasImage";
import EditableText from "./EditableText";
import { Vector2d } from "konva/lib/types";
import { Arrow, Circle, Layer, Line, Rect } from "react-konva";
import { useControlStore, useShapeStore } from "@/app/store/canvas";
import { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";
import { useCanvasContext } from "@/app/context/canvas";
import React, { useCallback } from "react";

const Canvas = () => {
  const { canvasSize, canvasPos } = useCanvasContext();

  return (
    <>
      <Layer id="_shapeLayer" clip={{ ...canvasSize, ...canvasPos }}>
        <ShapesRenderer />
      </Layer>
      <Layer id="_drawLayer" clip={{ ...canvasSize, ...canvasPos }}>
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
        switch (node.type) {
          case "rectangle":
            return (
              <Rect
                key={index}
                strokeScaleEnabled={false}
                perfectDrawEnabled={false}
                {...node}
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
                points={node.points}
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
