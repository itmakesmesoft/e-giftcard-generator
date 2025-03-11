import { ShapeConfig } from "@/app/types/canvas";
import Konva from "konva";
import { nanoid } from "nanoid";

export const saveToLocalStorage = (data: string | JSON) => {
  window.localStorage.setItem("autoSaved", JSON.stringify(data));
  return true;
};

export const loadFromLocalStorage = () => {
  const dataAsString = window.localStorage.getItem("autoSaved");
  if (dataAsString) {
    return JSON.parse(dataAsString)?.map((item: string) => JSON.parse(item));
  }
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
