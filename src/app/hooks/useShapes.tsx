import Konva from "konva";
import { nanoid } from "nanoid";
import { useRef, useState } from "react";
import { Vector2d } from "konva/lib/types";
import { Arrow, Circle, Rect, Image, Line, Text } from "react-konva";
import { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";

const useShapes = () => {
  const [shapes, setShapes] = useState<Konva.ShapeConfig[]>([]);
  const currentShapeIdRef = useRef<string>(undefined);

  const createShape = <T extends Konva.ShapeConfig>(shapeConfig: T) => {
    const id = nanoid();
    const { type, width = 0, height = 0, ...restConfig } = shapeConfig;
    const hasRadius = type === "circle";
    const hasPoints = type === "arrow";
    const isShape = type !== "pencil" && type !== "eraser";
    const compositeOperation =
      type === "pencil" ? "source-over" : "destination-out";

    currentShapeIdRef.current = id;
    const config: Konva.ShapeConfig = {
      id,
      type,
      width,
      height,
      ...(hasRadius && { radius: 0 }),
      ...(hasPoints && { points: [] }),
      ...(isShape
        ? { name: "shape" }
        : { globalCompositeOperation: compositeOperation }),
      ...restConfig,
    };

    setShapes((prevShapes) => {
      return [...prevShapes, config];
    });
    return config;
  };

  const updateCurrentShape = (
    callback: (shape: Konva.ShapeConfig) => Konva.ShapeConfig
  ) => {
    const currentId = currentShapeIdRef.current;
    if (!currentId) return;

    const updated = shapes.map((shape) => {
      if (shape.id === currentId) return callback(shape);
      return shape;
    });
    setShapes(updated);
    return updated;
  };

  const endCreateShape = () => {
    const id = currentShapeIdRef.current as string;
    currentShapeIdRef.current = undefined;
    return id;
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
        case "text":
          return <Text />;
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
    updateCurrentShape,
    endCreateShape,
    updateShape,
    renderLayer: {
      shapes: shapesRenderer,
      drawing: drawingRenderer,
    },
  };
};

export default useShapes;
