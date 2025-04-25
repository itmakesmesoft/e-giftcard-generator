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

  // 도형 유형별 특성 정의
  const hasRadius = type === "circle";
  const hasRadiusXY = type === "ellipse";
  const hasPoints = ["arrow", "triangle", "star"].includes(type as string);

  const isShape = type !== "pencil" && type !== "eraser";
  const compositeOperation =
    type === "pencil" ? "source-over" : "destination-out";

  return {
    id,
    type,
    isDrawing: false,
    ...(hasRadius && { radius: 0 }),
    ...(hasRadiusXY && { radiusX: 0, radiusY: 0 }),
    ...(hasPoints && { points: [] }),
    ...(isShape
      ? { name: "shape" }
      : { globalCompositeOperation: compositeOperation }),
    ...restConfig,
  };
};
