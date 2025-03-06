import Konva from "konva";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { Vector2d } from "konva/lib/types";
import { EditableText, Barcode, ShapeHelper } from "../canvas/components";
import type { ShapeHelperConfig } from "../canvas/components";
import { Arrow, Circle, Rect, Image, Line } from "react-konva";
import { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";
import { ShapeConfig } from "konva/lib/Shape";
import { useCanvasContext } from "../context/canvas";

const useShapes = () => {
  const { transformerRef } = useCanvasContext();
  const currentShapeRef = useRef<Konva.ShapeConfig>(null);
  const [shapes, setShapes] = useState<Konva.ShapeConfig[]>([]);
  const [helperConfig, setHelperConfig] = useState<ShapeHelperConfig>();

  useEffect(() => {
    if (!transformerRef.current) return;
    transformerRef.current.on("transform", () => {
      const target = transformerRef.current?.getNode();
      if (!target) return;

      setShapes((shapes) =>
        shapes.map((shape: Konva.ShapeConfig) =>
          shape.id === target.attrs.id ? { ...shape, ...target.attrs } : shape
        )
      );
    });
  }, [transformerRef]);

  const createShape = <T extends Konva.ShapeConfig>(shapeConfig: T) => {
    const { type, width = 0, height = 0, ...restConfig } = shapeConfig;

    const id = nanoid();
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

    setShapes((shapes) => [...shapes, { ...config }]);
    currentShapeRef.current = { ...config };
    return config;
  };

  const updateCurrentShape = (
    callback: (shape: Konva.ShapeConfig) => Konva.ShapeConfig
  ) => {
    const currentId = currentShapeRef.current?.id;
    if (!currentId || !currentShapeRef.current) return;

    const updated = callback(currentShapeRef.current);
    currentShapeRef.current = { ...updated };
    handleShapeHelper({ node: updated, visible: true });
    setShapes((shapes) =>
      shapes.map((shape) => (shape.id === currentId ? { ...updated } : shape))
    );
  };

  const endCreateShape = () => {
    handleShapeHelper({ visible: false });
    const id = currentShapeRef.current?.id;
    currentShapeRef.current = null;
    return id as string;
  };

  const handleShapeHelper = ({
    node,
    visible,
  }: {
    node?: ShapeConfig;
    visible: boolean;
  }) => {
    if (!node || node.type !== "text") return setHelperConfig({ visible });
    const { x, y, width, height } = node;
    setHelperConfig({ visible, x, y, width, height });
  };

  const updateShape = (
    callback: (shape: Konva.ShapeConfig) => Konva.ShapeConfig
  ) => {
    const updated = shapes.map(callback);
    setShapes([...updated]);
    console.log(updated);
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

  const updateTextValueChange = (id: string | undefined, text: string) => {
    if (!id) return;
    setShapes((shapes) =>
      shapes.map((shape) => (shape.id === id ? { ...shape, text } : shape))
    );
  };

  const shapesRenderer = (props: { isDraggable: boolean }) => {
    const { isDraggable } = props;
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
                  onValueChange={updateTextValueChange}
                  {...node}
                />
              );
            case "barcode":
              const { text, codeFormat } = node;
              return (
                <Barcode
                  key={index}
                  text={text}
                  codeFormat={codeFormat}
                  draggable={isDraggable}
                  onDragEnd={onDragEnd}
                  {...node}
                />
              );
          }
        })}
        {/* 추후 EditableText로 옮기는게 나을 듯 */}
        {helperConfig && <ShapeHelper config={helperConfig} />}
      </>
    );
  };

  const drawingRenderer = () =>
    shapes.map((node, index) => {
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
