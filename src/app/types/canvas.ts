import Konva from "konva";

export type ActionType =
  | "select"
  | "text"
  | "pencil"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle"
  | "arrow"
  | "triangle"
  | "ellipse"
  | "star";

export interface Controls {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  draggable: boolean;
  lineJoin: string;
  lineCap: string;
  radius: number;
  image: unknown;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fontStyle: string;
}

export type ShapeConfig = Konva.ShapeConfig & { isDrawing?: boolean };

export interface NodeSize {
  width: number;
  height: number;
}