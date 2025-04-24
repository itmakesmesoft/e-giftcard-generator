import Barcode from "./Barcode";
import CanvasImage from "./CanvasImage";
import EditableText from "./EditableText";
import { Vector2d } from "konva/lib/types";
import { Arrow, Circle, Layer, Line, Rect } from "react-konva";
import { useControlStore, useShapeStore } from "@/app/store/canvas";
import { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";
import { useCanvasContext } from "@/app/context/canvas";
import React from "react";

const Canvas = () => {
  const action = useControlStore((state) => state.action);
  const { canvasSize, canvasPos } = useCanvasContext();

  return (
    <>
      <Layer id="_shapeLayer" clip={{ ...canvasSize, ...canvasPos }}>
        <ShapesRenderer isDraggable={action === "select"} />
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

const ShapesRenderer = React.memo((props: { isDraggable: boolean }) => {
  const { isDraggable } = props;
  const shapes = useShapeStore((state) => state.shapes);
  const setShapes = useShapeStore((state) => state.setShapes);

  const onDragEnd = (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
    const position = e.target.getPosition() as Vector2d;
    const id = e.target.attrs.id;
    const updated = shapes.map((shape) => {
      return shape.id === id
        ? {
            ...shape,
            ...position,
          }
        : shape;
    });
    setShapes(updated);
  };

  return (
    <>
      {shapes.map((node, index) => {
        switch (node.type) {
          case "rectangle":
            return (
              <Rect
                key={index}
                strokeWidth={2}
                draggable={isDraggable}
                strokeScaleEnabled={false}
                perfectDrawEnabled={false}
                onDragEnd={onDragEnd}
                {...node}
              />
            );
          case "circle":
            return (
              <Circle
                key={index}
                draggable={isDraggable}
                strokeScaleEnabled={false}
                perfectDrawEnabled={false}
                onDragEnd={onDragEnd}
                {...node}
              />
            );
          case "arrow":
            return (
              <Arrow
                key={index}
                draggable={isDraggable}
                strokeScaleEnabled={false}
                perfectDrawEnabled={false}
                onDragEnd={onDragEnd}
                points={node.points}
                {...node}
              />
            );
          case "image":
            return (
              <CanvasImage
                key={index}
                alt="이미지"
                draggable={isDraggable}
                perfectDrawEnabled={false}
                onDragEnd={onDragEnd}
                dataURL={node.dataURL}
                {...node}
              />
            );
          case "text":
            return (
              <EditableText
                key={index}
                draggable={isDraggable}
                perfectDrawEnabled={false}
                onDragEnd={onDragEnd}
                {...node}
              />
            );
          case "barcode":
            const { text, codeFormat, ...restProps } = node;
            return (
              <Barcode
                key={index}
                text={text}
                codeFormat={codeFormat}
                draggable={isDraggable}
                perfectDrawEnabled={false}
                onDragEnd={onDragEnd}
                {...restProps}
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
