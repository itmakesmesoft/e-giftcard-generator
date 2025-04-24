import Konva from "konva";

export type PanelType = "text" | "shape" | "brush" | null;

export interface ControlPanelProps {
  updateSelectedShapeAttributes: (newAttrs: Konva.ShapeConfig) => void;
}
