import { ShapeConfig } from "@/app/types/canvas";
import Konva from "konva";
import { nanoid } from "nanoid";

export const saveToLocalStorage = (key: string, data: unknown) => {
  window.localStorage.setItem(key, JSON.stringify(data));
  return true;
};

export const loadFromLocalStorage = (key: string) => {
  const dataAsString = window.localStorage.getItem(key);
  if (dataAsString) {
    const converted = JSON.parse(dataAsString);
    if (!Array.isArray(converted)) return converted;
    return converted.map((item: string) =>
      typeof item === "string" ? JSON.parse(item) : item
    );
  }
  return undefined;
};

export const generateShapeConfig = (
  shapeConfig: Konva.ShapeConfig
): ShapeConfig => {
  const { type, ...restConfig } = shapeConfig;
  const id = nanoid();
  const hasRadius = type === "circle";
  const hasPoints = type === "arrow";
  const isShape = type !== "pencil" && type !== "eraser";
  const compositeOperation =
    type === "pencil" ? "source-over" : "destination-out";

  return {
    id,
    type,
    isDrawing: false,
    ...(hasRadius && { radius: 0 }),
    ...(hasPoints && { points: [] }),
    ...(isShape
      ? { name: "shape" }
      : { globalCompositeOperation: compositeOperation }),
    ...restConfig,
  };
};
