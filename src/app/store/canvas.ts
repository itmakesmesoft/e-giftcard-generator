import { create } from "zustand";
import { ActionType, ShapeConfig } from "../types/canvas";

type State = {
  action: ActionType;
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
};

type Action = {
  setAction: (action: State["action"]) => void;
  setFontSize: (fontSize: State["fontSize"]) => void;
  setFontWeight: (fontWeight: State["fontWeight"]) => void;
  setFontFamily: (fontFamily: State["fontFamily"]) => void;
  setFontStyle: (fontStyle: State["fontStyle"]) => void;
  setFill: (fill: State["fill"]) => void;
  setStroke: (stroke: State["stroke"]) => void;
  setStrokeWidth: (strokeWidth: State["strokeWidth"]) => void;
  setOpacity: (opacity: State["opacity"]) => void;
  setDraggable: (draggable: State["draggable"]) => void;
  setLineJoin: (lineJoin: State["lineJoin"]) => void;
  setLineCap: (lineCap: State["lineCap"]) => void;
  setRadius: (radius: State["radius"]) => void;
  setImage: (image: State["image"]) => void;
};

const useControlStore = create<State & Action>((set) => ({
  action: "select",
  fill: "#ff0000",
  stroke: "#000000",
  strokeWidth: 2,
  opacity: 1,
  draggable: true,
  lineJoin: "round",
  lineCap: "round",
  radius: 0,
  image: "",
  fontSize: 16,
  fontWeight: 500,
  fontFamily: "Arial",
  fontStyle: "italic",
  setAction: (action) => set(() => ({ action: action })),
  setFontSize: (fontSize) => set(() => ({ fontSize: fontSize })),
  setFontWeight: (fontWeight) => set(() => ({ fontWeight: fontWeight })),
  setFontFamily: (fontFamily) => set(() => ({ fontFamily: fontFamily })),
  setFontStyle: (fontStyle) => set(() => ({ fontStyle: fontStyle })),
  setFill: (fill) => set(() => ({ fill: fill })),
  setStroke: (stroke) => set(() => ({ stroke: stroke })),
  setStrokeWidth: (strokeWidth) => set(() => ({ strokeWidth: strokeWidth })),
  setOpacity: (opacity) => set(() => ({ opacity: opacity })),
  setDraggable: (draggable) => set(() => ({ draggable: draggable })),
  setLineJoin: (lineJoin) => set(() => ({ lineJoin: lineJoin })),
  setLineCap: (lineCap) => set(() => ({ lineCap: lineCap })),
  setRadius: (radius) => set(() => ({ radius: radius })),
  setImage: (image) => set(() => ({ image: image })),
}));

type StateConfig = ShapeConfig[];

type Shapes = {
  history: StateConfig[];
  historyIndex: number;
  shapes: StateConfig;
};

type FunctionableState =
  | StateConfig
  | ((prevState: StateConfig) => StateConfig);

type ChangeAction = {
  setShapes: (shapes: FunctionableState, logHistory?: boolean) => void;
  redo: () => void;
  undo: () => void;
};

const updatestate = (
  prevState: StateConfig,
  newState: FunctionableState
): StateConfig => {
  if (typeof newState === "function") {
    return (newState as (prevState: StateConfig) => StateConfig)(prevState);
  }
  return newState;
};

const useShapeStore = create<Shapes & ChangeAction>((set) => ({
  shapes: [],
  history: [],
  historyIndex: -1,
  setShapes: (shapes, logHistory = true) =>
    set((state) => {
      const newShapes = updatestate(state.shapes, shapes);
      if (logHistory) {
        const updated = [
          ...state.history.slice(0, state.historyIndex + 1),
          newShapes,
        ];
        const history = updated;
        const historyIndex = updated.length - 1;
        return { shapes: newShapes, history, historyIndex };
      }
      return { shapes: newShapes };
    }),
  redo: () =>
    set((state) => {
      const historyIndex = state.historyIndex + 1;
      if (historyIndex < state.history.length) {
        return { historyIndex, shapes: state.history[historyIndex] };
      }
      return state;
    }),

  undo: () =>
    set((state) => {
      const historyIndex = state.historyIndex - 1;
      return {
        historyIndex: Math.max(historyIndex, -1),
        shapes: historyIndex >= 0 ? state.history[historyIndex] : [],
      };
    }),
}));

export { useControlStore, useShapeStore };
