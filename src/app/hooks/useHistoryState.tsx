import Konva from "konva";
import { useReducer } from "react";

type ShapesConfig = Konva.ShapeConfig[];

interface State {
  history: ShapesConfig[];
  historyIndex: number;
  shapes: ShapesConfig;
}

type FunctionableShapes =
  | ShapesConfig
  | ((prevShapes: ShapesConfig) => ShapesConfig);

interface Action {
  type?: "save" | "unsave";
  shapes: FunctionableShapes;
}

const updateShapes = (
  newShapes: FunctionableShapes,
  prevShapes: ShapesConfig
): ShapesConfig => {
  if (typeof newShapes === "function") {
    return (newShapes as (prevShapes: ShapesConfig) => ShapesConfig)(
      prevShapes
    );
  }
  return newShapes;
};

const reducer = (
  prevState: State,
  { type = "save", shapes }: Action
): State => {
  switch (type) {
    case "save":
    case "unsave": {
      const newShapes = updateShapes(shapes, prevState.shapes);
      const newHistory =
        type === "save"
          ? [
              ...prevState.history.slice(0, prevState.historyIndex + 1),
              newShapes,
            ]
          : prevState.history;
      return {
        ...prevState,
        shapes: newShapes,
        history: newHistory,
        historyIndex:
          type === "save" ? prevState.historyIndex + 1 : prevState.historyIndex,
      };
    }

    default:
      return prevState;
  }
};

export const useHistoryState = () => {
  const [state, dispatch] = useReducer(reducer, {
    history: [],
    shapes: [],
    historyIndex: -1,
  });

  const undo = () => {
    if (state.historyIndex >= 0) {
      state.historyIndex -= 1;
      const prevShapes = state.history[state.historyIndex];
      dispatch({
        type: "unsave",
        shapes: state.historyIndex >= 0 ? prevShapes : [],
      });
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex += 1;
      const nextShapes = state.history[state.historyIndex];
      dispatch({ type: "unsave", shapes: nextShapes });
    }
  };

  const canUndo = () => state.historyIndex > 0;

  const canRedo = () => state.historyIndex < state.history.length - 1;

  return { state, dispatch, undo, redo, canUndo, canRedo };
};
