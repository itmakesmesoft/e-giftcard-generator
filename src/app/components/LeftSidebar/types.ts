import { ReactNode } from "react";
import { ShapeType } from "../konva/Canvas";

export type ToolAction = "select" | "pencil" | "eraser" | "text";
export type ActionType = ToolAction | ShapeType;
export interface ShapeMenuGroupProps {
  onToolChange: (action: ShapeType) => void;
}

export interface ShapeConfig {
  action: string;
  icon: ReactNode;
  label: string;
}
