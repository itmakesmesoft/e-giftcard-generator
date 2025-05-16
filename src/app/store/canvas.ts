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
    fontFamily: "Arial",
    typeFace: "sans-serif",
    fontStyle: "normal",
    textAlign: "center",
  },
  shape: {
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 0,
    opacity: 1,
    lineJoin: "round",
    lineCap: "round",
    radius: 0,
  }
};

const useControlStore = create<ControlState & ControlAction>((set) => ({
  action: defaultValues.action,
  bgColor: defaultValues.bgColor,
  stageScale: defaultValues.stageScale,


  // 기본 액션 (변경 없음)
  setAction: (action) => set(() => ({ action })),
  setBgColor: (bgColor) => set(() => ({ bgColor })),
  setStageScale: (stageScale) => set(() => ({ stageScale })),

  font: {
    ...defaultValues.font,
    setFontSize: (fontSize) => set((state) => ({
      font: { ...state.font, fontSize }
    })),
    setFontWeight: (fontWeight) => set((state) => ({
      font: { ...state.font, fontWeight }
    })),
    setFontFamily: (fontFamily) => set((state) => ({
      font: { ...state.font, fontFamily }
    })),
    setTypeFace: (typeFace) => set((state) => ({
      font: { ...state.font, typeFace }
    })),
    setFontStyle: (fontStyle) => set((state) => ({
      font: { ...state.font, fontStyle }
    })),
    setTextAlign: (textAlign) => set((state) => ({
      font: { ...state.font, textAlign }
    })),
    setFill: (fill) => set((state) => ({
      font: { ...state.font, fill }
    })),
    setStroke: (stroke) => set((state) => ({
      font: { ...state.font, stroke }
    })),
    setOpacity: (opacity) => set((state) => ({
      font: { ...state.font, opacity }
    })),
  },
  shape: {
    ...defaultValues.shape,
    setFill: (fill) => set((state) => ({
      shape: { ...state.shape, fill }
    })),
    setStroke: (stroke) => set((state) => ({
      shape: { ...state.shape, stroke }
    })),
    setStrokeWidth: (strokeWidth) => set((state) => ({
      shape: { ...state.shape, strokeWidth }
    })),
    setOpacity: (opacity) => set((state) => ({
      shape: { ...state.shape, opacity }
    })),
    setLineJoin: (lineJoin) => set((state) => ({
      shape: { ...state.shape, lineJoin }
    })),
    setLineCap: (lineCap) => set((state) => ({
      shape: { ...state.shape, lineCap }
    })),
    setRadius: (radius) => set((state) => ({
      shape: { ...state.shape, radius }
    })),
  },
    brush: {
    ...defaultValues.brush,
    setFill: (fill) => set((state) => ({
      brush: { ...state.brush, fill }
    })),
    setStroke: (stroke) => set((state) => ({
      brush: { ...state.brush, stroke }
    })),
    setStrokeWidth: (strokeWidth) => set((state) => ({
      brush: { ...state.brush, strokeWidth }
    })),
    setOpacity: (opacity) => set((state) => ({
      brush: { ...state.brush, opacity }
    })),
    setLineJoin: (lineJoin) => set((state) => ({
      brush: { ...state.brush, lineJoin }
    })),
    setLineCap: (lineCap) => set((state) => ({
      brush: { ...state.brush, lineCap }
    })),
    setRadius: (radius) => set((state) => ({
      brush: { ...state.brush, radius }
    })),
  }
}));
// Canvas Store 타입 정의
type StateConfig = ShapeConfig[];


type CanvasOption = {
  canvasSize: NodeSize;
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
