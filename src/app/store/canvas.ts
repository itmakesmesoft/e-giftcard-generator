import { create } from "zustand";
import { NodeSize, ShapeConfig } from "../types/canvas";
import { ControlState, ControlAction } from "./types";

export const defaultValues: ControlState = {
  action: "select",
  bgColor: "#ffffff",
  stageScale: 1,
  brush: {
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 6,
    opacity: 1,
    lineJoin: "round",
    lineCap: "round",
    radius: 0,
  },
  font: {
    fill: "#000000",
    stroke: "#000000",
    opacity: 1,
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "ABeeZee",
    typeFace: "sans-serif",
    fontStyle: "normal",
    textAlign: "center",
  },
  shape: {
    fill: "#000000",
    hasStroke: true,
    stroke: "#000000",
    strokeWidth: 1,
    opacity: 1,
    lineJoin: "round",
    lineCap: "round",
    cornerRadius: 0,
  },
};
let prevShapeHasStroke: boolean;
const useControlStore = create<ControlState & ControlAction>((set) => ({
  action: defaultValues.action,
  bgColor: defaultValues.bgColor,
  stageScale: defaultValues.stageScale,

  // 기본 액션
  setAction: (action) =>
    set((state) => {
      const isLineOrArrow = action === "line" || action === "arrow";
      if (isLineOrArrow) {
        prevShapeHasStroke = state.shape.hasStroke;
      }
      return {
        action,
        shape: {
          ...state.shape,
          hasStroke: isLineOrArrow ? true : prevShapeHasStroke,
        },
      };
    }),
  setBgColor: (bgColor) => set(() => ({ bgColor })),
  setStageScale: (stageScale) => set(() => ({ stageScale })),

  font: {
    ...defaultValues.font,
    setFontSize: (fontSize) =>
      set((state) => ({
        font: { ...state.font, fontSize },
      })),
    setFontWeight: (fontWeight) =>
      set((state) => ({
        font: { ...state.font, fontWeight },
      })),
    setFontFamily: (fontFamily) =>
      set((state) => ({
        font: { ...state.font, fontFamily },
      })),
    setTypeFace: (typeFace) =>
      set((state) => ({
        font: { ...state.font, typeFace },
      })),
    setFontStyle: (fontStyle) =>
      set((state) => ({
        font: { ...state.font, fontStyle },
      })),
    setTextAlign: (textAlign) =>
      set((state) => ({
        font: { ...state.font, textAlign },
      })),
    setFill: (fill) =>
      set((state) => ({
        font: { ...state.font, fill },
      })),
    setStroke: (stroke) =>
      set((state) => ({
        font: { ...state.font, stroke },
      })),
    setOpacity: (opacity) =>
      set((state) => ({
        font: { ...state.font, opacity },
      })),
  },
  shape: {
    ...defaultValues.shape,
    setFill: (fill) =>
      set((state) => ({
        shape: { ...state.shape, fill },
      })),
    setHasStroke: (hasStroke) =>
      set((state) => ({
        shape: { ...state.shape, hasStroke },
      })),
    setStroke: (stroke) =>
      set((state) => ({
        shape: { ...state.shape, stroke },
      })),
    setStrokeWidth: (strokeWidth) =>
      set((state) => ({
        shape: { ...state.shape, strokeWidth },
      })),
    setOpacity: (opacity) =>
      set((state) => ({
        shape: { ...state.shape, opacity },
      })),
    setLineJoin: (lineJoin) =>
      set((state) => ({
        shape: { ...state.shape, lineJoin },
      })),
    setLineCap: (lineCap) =>
      set((state) => ({
        shape: { ...state.shape, lineCap },
      })),
    setCornerRadius: (cornerRadius) =>
      set((state) => ({
        shape: { ...state.shape, cornerRadius },
      })),
  },
  brush: {
    ...defaultValues.brush,
    setFill: (fill) =>
      set((state) => ({
        brush: { ...state.brush, fill },
      })),
    setStroke: (stroke) =>
      set((state) => ({
        brush: { ...state.brush, stroke },
      })),
    setStrokeWidth: (strokeWidth) =>
      set((state) => ({
        brush: { ...state.brush, strokeWidth },
      })),
    setOpacity: (opacity) =>
      set((state) => ({
        brush: { ...state.brush, opacity },
      })),
    setLineJoin: (lineJoin) =>
      set((state) => ({
        brush: { ...state.brush, lineJoin },
      })),
    setLineCap: (lineCap) =>
      set((state) => ({
        brush: { ...state.brush, lineCap },
      })),
    setRadius: (radius) =>
      set((state) => ({
        brush: { ...state.brush, radius },
      })),
  },
}));
// Canvas Store 타입 정의
type StateConfig = ShapeConfig[];

export type CanvasOption = {
  canvasSize: NodeSize;
  bgColor: string;
};

type CanvasStoreState = {
  shapes: StateConfig;
  canvasOption: CanvasOption;
};

type FunctionableState<T> = T | ((prevState: T) => T);

const updateState = <T>(prevState: T, newState: FunctionableState<T>): T =>
  typeof newState === "function"
    ? (newState as (prevState: T) => T)(prevState)
    : newState;

type CanvasStoreActions = {
  setShapes: (shapes: FunctionableState<StateConfig>) => void;
  setCanvasOption: (option: FunctionableState<CanvasOption>) => void;
};

const useShapeStore = create<CanvasStoreState & CanvasStoreActions>((set) => ({
  shapes: [],
  canvasOption: {
    canvasSize: { width: 400, height: 600 },
    bgColor: "#ffffff",
  },
  setCanvasOption: (option) =>
    set((state) => ({
      canvasOption: updateState(state.canvasOption, option),
    })),
  setShapes: (shapes) =>
    set((state) => ({
      shapes: updateState(state.shapes, shapes),
    })),
}));

export { useControlStore, useShapeStore };
