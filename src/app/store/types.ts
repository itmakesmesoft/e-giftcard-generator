import { LineJoin, LineCap } from "konva/lib/Shape";
import { ActionType } from "../types/canvas";

export type TextAlign = "center" | "left" | "right";
export type FontWeight = string | number;
export type FontStyle = "italic" | "normal";

export type ControlState = {
  action: ActionType;
  bgColor: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  lineJoin: LineJoin;
  lineCap: LineCap;
  radius: number;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  fontFamily: string;
  typeFace: string;
  textAlign: TextAlign;
};

export type ControlActions = {
  setAction: (action: ControlState["action"]) => void;
  setBgColor: (bgColor: ControlState["bgColor"]) => void;
  setFontSize: (fontSize: ControlState["fontSize"]) => void;
  setFontWeight: (fontWeight: ControlState["fontWeight"]) => void;
  setFontFamily: (fontFamily: ControlState["fontFamily"]) => void;
  setFontStyle: (fontStyle: ControlState["fontStyle"]) => void;
  setTypeFace: (typeFace: ControlState["typeFace"]) => void;
  setTextAlign: (textAlign: ControlState["textAlign"]) => void;
  setFill: (fill: ControlState["fill"]) => void;
  setStroke: (stroke: ControlState["stroke"]) => void;
  setStrokeWidth: (strokeWidth: ControlState["strokeWidth"]) => void;
  setOpacity: (opacity: ControlState["opacity"]) => void;
  setLineJoin: (lineJoin: ControlState["lineJoin"]) => void;
  setLineCap: (lineCap: ControlState["lineCap"]) => void;
  setRadius: (radius: ControlState["radius"]) => void;
};
