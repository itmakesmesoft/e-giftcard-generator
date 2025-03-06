import Konva from "konva";
import { nanoid } from "nanoid";
import { useRef, useState } from "react";
import { Vector2d } from "konva/lib/types";
import { EditableText, Barcode, ShapeHelper } from "../canvas/components";
import type { ShapeHelperConfig } from "../canvas/components";
import { Arrow, Circle, Rect, Image, Line } from "react-konva";
import { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";
import { ShapeConfig } from "konva/lib/Shape";

const useShapes = () => {
  const [shapes, setShapes] = useState<Konva.ShapeConfig[]>([]);
  const [newShape, setNewShape] = useState<Konva.ShapeConfig | null>(null);
  const [shapeHelperConfig, setShapeHelperConfig] = useState<ShapeHelperConfig>(
    {
      visible: false,
    }
  );
  const currentShapeIdRef = useRef<string>(undefined);

  const createShape = <T extends Konva.ShapeConfig>(shapeConfig: T) => {
    const id = nanoid();
    const { type, width = 0, height = 0, ...restConfig } = shapeConfig;
    const hasRadius = type === "circle";
    const hasPoints = type === "arrow";
    const isShape = type !== "pencil" && type !== "eraser";
    const compositeOperation =
      type === "pencil" ? "source-over" : "destination-out";

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

    setNewShape(config);
    currentShapeIdRef.current = id;
    return config;
  };

  const updateCurrentShape = (
    callback: (shape: Konva.ShapeConfig) => Konva.ShapeConfig
  ) => {
    const currentId = currentShapeIdRef.current;
    if (!currentId) return;
    setNewShape(callback);
    handleShapeHelper({ newShape, visible: true });
  };

  const endCreateShape = () => {
    const id = currentShapeIdRef.current as string;
    currentShapeIdRef.current = undefined;
    setShapes((shapes) => [...shapes, { ...newShape }]);
    setNewShape(null);
    setShapeHelperConfig({ visible: false });
    return id;
  };

  const handleShapeHelper = ({
    newShape,
    visible,
  }: {
    newShape?: ShapeConfig | null;
    visible: boolean;
  }) => {
    if (!newShape || newShape.type !== "text") return;
    const { x, y, width, height } = newShape;
    setShapeHelperConfig({ visible, x, y, width, height });
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

  const renderShapes = ({
    node,
    index,
    isDraggable,
    onDragEnd,
  }: {
    node: Konva.ShapeConfig;
    index?: number;
    isDraggable: boolean;
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  }) => {
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
        return (
          <EditableText
            key={index}
            draggable={isDraggable}
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
            onDragEnd={onDragEnd}
            {...restProps}
          />
        );
    }
  };

  const shapesRenderer = (props: { isDraggable: boolean }) => {
    const { isDraggable } = props;

    return (
      <>
        {shapes.map((node, index) =>
          renderShapes({ node, index, isDraggable, onDragEnd })
        )}
        {newShape && renderShapes({ node: newShape, isDraggable, onDragEnd })}
        <ShapeHelper config={shapeHelperConfig} />
      </>
    );
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
