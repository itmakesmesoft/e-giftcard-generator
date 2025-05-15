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

export const convertPosition = (props: ShapeConfig, parentX = 0, parentY = 0, isAbsolute = true) => {
  const { x, y, points } = props;
  return {
    ...(x && { x: x + (isAbsolute ? parentX : -parentX) }),
    ...(y && { y: y + (isAbsolute ? parentY : -parentY) }),
    ...(points && {
      points: points?.map((point: number, index: number) =>
        index % 2
          ? point + (isAbsolute ? parentY : -parentY)
          : point + (isAbsolute ? parentX : -parentX)
      ),
    }),
  };
}

export const omitKeysFromObject = (obj: Record<string, unknown>, keys: string[]) => {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (keys.includes(key)) continue;
    result[key] = obj[key];
  }
  return result;
};