import Konva from "konva";
import { nanoid } from "nanoid";
import { useState } from "react";

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

  return { shapes, setShapes, createShape, updateShape };
};

export default useShapes;
