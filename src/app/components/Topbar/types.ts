import { ActionType } from "@/app/types/canvas";
import Konva from "konva";

export type PanelType = "text" | "shape" | "brush" | null;

export interface ControlPanelProps {
  actionType: ActionType | null
  updateSelectedShapeAttributes: (newAttrs: Konva.ShapeConfig) => void;
}
