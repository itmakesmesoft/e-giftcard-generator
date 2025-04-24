import { create } from "zustand";
import { ActionType, ShapeConfig } from "../types/canvas";
import { LineCap, LineJoin } from "konva/lib/Shape";

export type TextAlign = "center" | "left" | "right";
export type FontWeight = string | number;
export type FontStyle = "italic" | "normal";

export type State = {
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

export type Action = {
  setAction: (action: State["action"]) => void;
  setBgColor: (fontSize: State["bgColor"]) => void;
  setFontSize: (fontSize: State["fontSize"]) => void;
  setFontWeight: (fontWeight: State["fontWeight"]) => void;
  setFontFamily: (fontFamily: State["fontFamily"]) => void;
  setFontStyle: (fontStyle: State["fontStyle"]) => void;
  setTypeFace: (fontStyle: State["typeFace"]) => void;
  setTextAlign: (textAlign: State["textAlign"]) => void;
  setFill: (fill: State["fill"]) => void;
  setStroke: (stroke: State["stroke"]) => void;
  setStrokeWidth: (strokeWidth: State["strokeWidth"]) => void;
  setOpacity: (opacity: State["opacity"]) => void;
  setLineJoin: (lineJoin: State["lineJoin"]) => void;
  setLineCap: (lineCap: State["lineCap"]) => void;
  setRadius: (radius: State["radius"]) => void;
};

const useControlStore = create<State & Action>((set) => ({
  action: "select",
  bgColor: "#ffffff",
  fill: "#ff0000",
  stroke: "#000000",
  strokeWidth: 2,
  opacity: 1,
  lineJoin: "round",
  lineCap: "round",
  radius: 0,
  image: "",
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

type StateConfig = ShapeConfig[];

type CanvasOption = {
  canvasSize: { width: number; height: number };
  bgColor: string;
};

type CanvasState = {
  shapes: StateConfig;
  canvasOption: CanvasOption;
};

type Shapes = {
  history: CanvasState[];
  historyIndex: number;
  shapes: StateConfig;
  canvasOption: CanvasOption;
};

type FunctionableState =
  | StateConfig
  | ((prevState: StateConfig) => StateConfig);

type ChangeAction = {
  setShapes: (shapes: FunctionableState, logHistory?: boolean) => void;
  setCanvasOption: (
    option: Partial<CanvasOption>,
    logHistory?: boolean
  ) => void;
  redo: () => void;
  undo: () => void;
  moveToForward: (id: string) => void;
  moveToBackward: (id: string) => void;
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
  canvasOption: {
    canvasSize: { width: 400, height: 600 },
    bgColor: "#ffffff",
  },
  setCanvasOption: (option, logHistory = true) =>
    set((state) => {
      const newCanvasOption = {
        ...state.canvasOption,
        ...option,
      };

      if (logHistory) {
        const updated = [
          ...state.history.slice(0, state.historyIndex + 1),
          {
            shapes: state.shapes,
            canvasOption: newCanvasOption,
          },
        ];
        return {
          canvasOption: newCanvasOption,
          history: updated,
          historyIndex: updated.length - 1,
        };
      }
      return { canvasOption: newCanvasOption };
    }),
  setShapes: (shapes, logHistory = true) =>
    set((state) => {
      const newShapes = updatestate(state.shapes, shapes);
      if (logHistory) {
        const updated = [
          ...state.history.slice(0, state.historyIndex + 1),
          {
            shapes: newShapes,
            canvasOption: state.canvasOption,
          },
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
        const historyItem = state.history[historyIndex];
        return {
          historyIndex,
          shapes: historyItem.shapes,
          canvasOption: historyItem.canvasOption,
        };
      }
      return state;
    }),

  undo: () =>
    set((state) => {
      const historyIndex = state.historyIndex - 1;
      if (historyIndex >= 0) {
        const historyItem = state.history[historyIndex];
        return {
          historyIndex,
          shapes: historyItem.shapes,
          canvasOption: historyItem.canvasOption,
        };
      }
      return {
        historyIndex: -1,
        shapes: [],
        canvasOption: state.canvasOption,
      };
    }),
  moveToForward: (id: string) =>
    set((state) => {
      const shape = state.shapes.find((shape) => shape.id === id);
      if (!shape) return state;
      const newShapes = [...state.shapes];
      const index = newShapes.indexOf(shape);
      newShapes.splice(index, 1);
      newShapes.push(shape);

      const history = [
        ...state.history.slice(0, state.historyIndex + 1),
        {
          shapes: newShapes,
          canvasOption: state.canvasOption,
        },
      ];
      const historyIndex = history.length - 1;

      return { shapes: newShapes, history, historyIndex };
    }),
  moveToBackward: (id: string) =>
    set((state) => {
      const shape = state.shapes.find((shape) => shape.id === id);
      if (!shape) return state;
      const newShapes = [...state.shapes];
      const index = newShapes.indexOf(shape);
      newShapes.splice(index, 1);
      newShapes.unshift(shape);

      const history = [
        ...state.history.slice(0, state.historyIndex + 1),
        {
          shapes: newShapes,
          canvasOption: state.canvasOption,
        },
      ];
      const historyIndex = history.length - 1;

      return { shapes: newShapes, history, historyIndex };
    }),
}));

export { useControlStore, useShapeStore };
