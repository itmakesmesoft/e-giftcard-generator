import Konva from "konva";
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

  const ShapesRenderer = (props: {
    isDraggable: boolean;
    handleClickShape: (e: Konva.KonvaPointerEvent) => void;
  }) => {
    const { isDraggable, handleClickShape } = props;
    return shapes.map((node, index) => {
      switch (node.type) {
        case "rectangle":
          return (
            <Rect
              key={index}
              strokeWidth={2}
              draggable={isDraggable}
              strokeScaleEnabled={false}
              onPointerDown={handleClickShape}
              {...node}
            />
          );
        case "circle":
          return (
            <Circle
              key={index}
              draggable={isDraggable}
              strokeScaleEnabled={false}
              onPointerDown={handleClickShape}
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
              onPointerDown={handleClickShape}
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
              onPointerDown={handleClickShape}
              {...node}
            />
          );
      }
    });
  };

  const DrawingRenderer = () => {
    return shapes.map((node, index) => {
      switch (node.type) {
        case "pencil":
        case "eraser":
          return (
            <Line
              key={index}
              lineCap="round"
              lineJoin="round"
              strokeWidth={2}
              tension={0.5}
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
    ShapesRenderer,
    DrawingRenderer,
  };
};

export default useShapes;
