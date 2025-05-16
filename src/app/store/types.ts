import { LineJoin, LineCap } from "konva/lib/Shape";
import { ActionType } from "../types/canvas";

export type TextAlign = "center" | "left" | "right";
export type FontWeight = string | number;
export type FontStyle = "italic" | "normal";


export type ControlState = {
  action: ActionType;
  bgColor: string;
  stageScale: number;
  font: FontState,
  shape: ShapeState,
  brush: BrushState
}

export type FontState = {
  fill: string;
  stroke: string;
  opacity: number;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  fontFamily: string;
  typeFace: string;
  textAlign: TextAlign;
}

export type ShapeState = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  lineJoin: LineJoin;
  lineCap: LineCap;
  radius: number;
}

export type BrushState = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  lineJoin: LineJoin;
  lineCap: LineCap;
  radius: number;
}

export type ControlAction = DefaultControlActions & {shape: ShapeControlActions; font: FontControlActions; brush: BrushControlActions}

export type DefaultControlActions = {
  setAction: (action: ActionType) => void;
  setBgColor: (bgColor: string) => void;
  setStageScale: (stageScale:number) => void;
}
export type FontControlActions = {
  setFontSize: (fontSize: FontState['fontSize']) => void;
  setFontWeight: (fontWeight: FontState['fontWeight']) => void;
  setFontFamily: (fontFamily: FontState['fontFamily']) => void;
  setFontStyle: (fontStyle: FontState['fontStyle']) => void;
  setTypeFace: (typeFace: FontState['typeFace']) => void;
  setTextAlign: (textAlign: FontState['textAlign']) => void;
  setFill: (fill: FontState['fill']) => void;
  setStroke: (stroke: FontState['stroke']) => void;
  setOpacity: (opacity: FontState['opacity']) => void;
};


export type ShapeControlActions = {
  setFill: (fill: ShapeState["fill"]) => void;
  setStroke: (stroke: ShapeState["stroke"]) => void;
  setStrokeWidth: (strokeWidth: ShapeState["strokeWidth"]) => void;
  setOpacity: (opacity: ShapeState["opacity"]) => void;
  setLineJoin: (lineJoin: ShapeState["lineJoin"]) => void;
  setLineCap: (lineCap: ShapeState["lineCap"]) => void;
  setRadius: (radius: ShapeState["radius"]) => void;
};

export type BrushControlActions = {
  setFill: (fill: BrushState["fill"]) => void;
  setStroke: (stroke: BrushState["stroke"]) => void;
  setStrokeWidth: (strokeWidth: BrushState["strokeWidth"]) => void;
  setOpacity: (opacity: BrushState["opacity"]) => void;
  setLineJoin: (lineJoin: BrushState["lineJoin"]) => void;
  setLineCap: (lineCap: BrushState["lineCap"]) => void;
  setRadius: (radius: BrushState["radius"]) => void;
};
