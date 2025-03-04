import Konva from "konva";
import { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Arrow, Circle, Rect, Image, Line } from "react-konva";

const useShapes = () => {
  const [shapes, setShapes] = useState<Konva.ShapeConfig[]>([]);

  const createShape = <T extends Konva.ShapeConfig>(shapeConfig: T) => {
    const id = nanoid();
    const { type, width = 0, height = 0, ...restConfig } = shapeConfig;
    const hasRadius = type === "circle";
    const hasPoints = type === "arrow";
    const config: Konva.ShapeConfig = {
      id,
      type,
      width,
      height,
      ...(hasRadius && { radius: 0 }),
      ...(hasPoints && { points: [] }),
      ...restConfig,
    };

    setShapes((prevShapes) => {
      return [...prevShapes, config];
    });
    return config;
  };

  const updateShape = (
    callback: (shape: Konva.ShapeConfig) => Konva.ShapeConfig
  ) => {
    const updated = shapes.map(callback);
    setShapes(updated);
    return updated;
  };

  const onDragEnd = (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
    const id = e.target.attrs.id;
    const { x, y } = e.target.getPosition() as Vector2d;
    updateShape((shape) => {
      if (shape.id === id) {
        return {
          ...shape,
          x,
          y,
        };
      }
      return shape;
    });
  };

  const shapesRenderer = (props: { isDraggable: boolean }) => {
    const { isDraggable } = props;

    return shapes.map((node, index) => {
      switch (node.type) {
        case "rectangle":
          return (
            <Rect
              key={index}
              strokeWidth={2}
              draggable={isDraggable}
              strokeScaleEnabled={false}
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
              onDragEnd={onDragEnd}
              {...node}
            />
          );
        case "arrow":
          return (
            <Arrow
              key={index}
              strokeWidth={2}
              draggable={isDraggable}
              strokeScaleEnabled={false}
              onDragEnd={onDragEnd}
              points={node.points}
              {...node}
            />
          );
        case "image":
          return (
            <Image
              key={index}
              alt="이미지"
              image={node.image}
              draggable={isDraggable}
              onDragEnd={onDragEnd}
              {...node}
            />
          );
      }
    });
  };

  const drawingRenderer = () => {
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
  };

  return {
    shapes,
    setShapes,
    createShape,
    updateShape,
    renderLayer: {
      shapes: shapesRenderer,
      drawing: drawingRenderer,
    },
  };
};

export default useShapes;
