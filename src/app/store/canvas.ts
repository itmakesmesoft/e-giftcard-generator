import { create } from "zustand";
import { ActionType, ShapeConfig } from "../types/canvas";
import { LineCap, LineJoin } from "konva/lib/Shape";

export type TextAlign = "center" | "left" | "right";
export type FontWeight = string | number;
export type FontStyle = "italic" | "normal";

// Control Store 타입 정의
type ControlState = {
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

type ControlActions = {
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

const useControlStore = create<ControlState & ControlActions>((set) => ({
  action: "select",
  bgColor: "#ffffff",
  fill: "#ff0000",
  stroke: "#000000",
  strokeWidth: 2,
  opacity: 1,
  lineJoin: "round",
  lineCap: "round",
  radius: 0,
  fontSize: 16,
  fontWeight: 500,
  fontFamily: "Arial",
  typeFace: "sans-serif",
  fontStyle: "normal",
  textAlign: "center",
  setAction: (action) => set(() => ({ action })),
  setBgColor: (bgColor) => set(() => ({ bgColor })),
  setFontSize: (fontSize) => set(() => ({ fontSize })),
  setFontWeight: (fontWeight) => set(() => ({ fontWeight })),
  setFontFamily: (fontFamily) => set(() => ({ fontFamily })),
  setTypeFace: (typeFace) => set(() => ({ typeFace })),
  setFontStyle: (fontStyle) => set(() => ({ fontStyle })),
  setTextAlign: (textAlign) => set(() => ({ textAlign })),
  setFill: (fill) => set(() => ({ fill })),
  setStroke: (stroke) => set(() => ({ stroke })),
  setStrokeWidth: (strokeWidth) => set(() => ({ strokeWidth })),
  setOpacity: (opacity) => set(() => ({ opacity })),
  setLineJoin: (lineJoin) => set(() => ({ lineJoin })),
  setLineCap: (lineCap) => set(() => ({ lineCap })),
  setRadius: (radius) => set(() => ({ radius })),
}));

// Canvas Store 타입 정의
type StateConfig = ShapeConfig[];

type CanvasSize = { width: number; height: number };

type CanvasOption = {
  canvasSize: CanvasSize;
  bgColor: string;
};

type CanvasState = {
  shapes: StateConfig;
  canvasOption: CanvasOption;
};

type CanvasStoreState = {
  history: CanvasState[];
  historyIndex: number;
  isFirstHistory: boolean;
  isLastHistory: boolean;
  shapes: StateConfig;
  canvasOption: CanvasOption;
};

type CanvasStoreActions = {
  setShapes: (
    shapes: FunctionableState<StateConfig>,
    logHistory?: boolean
  ) => void;
  setCanvasOption: (
    option: FunctionableState<CanvasOption>,
    logHistory?: boolean
  ) => void;
  redo: () => void;
  undo: () => void;
  moveToForward: (id: string) => void;
  moveToBackward: (id: string) => void;
};

type FunctionableState<T> = T | ((prevState: T) => T);

const updateState = <T>(prevState: T, newState: FunctionableState<T>): T =>
  typeof newState === "function"
    ? (newState as (prevState: T) => T)(prevState)
    : newState;

const updateHistory = (
  state: CanvasStoreState,
  newState: { shapes: StateConfig; canvasOption: CanvasOption }
) => {
  const updatedHistory = [
    ...state.history.slice(0, state.historyIndex + 1),
    newState,
  ];
  return {
    history: updatedHistory,
    historyIndex: updatedHistory.length - 1,
    isFirstHistory: false,
    isLastHistory: true,
  };
};

const useShapeStore = create<CanvasStoreState & CanvasStoreActions>((set) => ({
  shapes: [],
  history: [],
  historyIndex: -1,
  isFirstHistory: true,
  isLastHistory: true,
  canvasOption: {
    canvasSize: { width: 400, height: 600 },
    bgColor: "#ffffff",
  },
  setCanvasOption: (option, logHistory = true) =>
    set((state) => {
      const newCanvasOption = updateState(state.canvasOption, option);
      if (logHistory) {
        return {
          canvasOption: newCanvasOption,
          ...updateHistory(state, {
            shapes: state.shapes,
            canvasOption: newCanvasOption,
          }),
        };
      }
      return { canvasOption: newCanvasOption };
    }),
  setShapes: (shapes, logHistory = true) =>
    set((state) => {
      const newShapes = updateState(state.shapes, shapes);
      if (logHistory) {
        return {
          shapes: newShapes,
          ...updateHistory(state, {
            shapes: newShapes,
            canvasOption: state.canvasOption,
          }),
        };
      }
      return { shapes: newShapes };
    }),
  redo: () =>
    set((state) => {
      const nextIndex = Math.min(
        state.historyIndex + 1,
        state.history.length - 1
      );
      const nextHistoryItem = state.history[nextIndex];
      return {
        historyIndex: nextIndex,
        isFirstHistory: nextIndex === -1,
        isLastHistory: nextIndex === state.history.length - 1,
        shapes: nextIndex !== -1 ? nextHistoryItem.shapes : [],
        canvasOption:
          nextIndex !== -1 ? nextHistoryItem.canvasOption : state.canvasOption,
      };
    }),
  undo: () =>
    set((state) => {
      const prevIndex = Math.max(state.historyIndex - 1, -1);
      const prevHistoryItem = state.history[prevIndex];
      return {
        shapes: prevIndex !== -1 ? prevHistoryItem.shapes : [],
        canvasOption:
          prevIndex !== -1 ? prevHistoryItem.canvasOption : state.canvasOption,
        historyIndex: prevIndex,
        isFirstHistory: prevIndex === -1,
        isLastHistory: prevIndex === state.history.length - 1,
      };
    }),
  moveToForward: (id: string) =>
    set((state) => {
      const shape = state.shapes.find((s) => s.id === id);
      if (!shape) return state;
      const newShapes = state.shapes.filter((s) => s.id !== id);
      newShapes.push(shape);
      return {
        shapes: newShapes,
        ...updateHistory(state, {
          shapes: newShapes,
          canvasOption: state.canvasOption,
        }),
      };
    }),
  moveToBackward: (id: string) =>
    set((state) => {
      const shape = state.shapes.find((s) => s.id === id);
      if (!shape) return state;
      const newShapes = state.shapes.filter((s) => s.id !== id);
      newShapes.unshift(shape);
      return {
        shapes: newShapes,
        ...updateHistory(state, {
          shapes: newShapes,
          canvasOption: state.canvasOption,
        }),
      };
    }),
}));

export { useControlStore, useShapeStore };
