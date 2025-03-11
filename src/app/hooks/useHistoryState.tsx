import Konva from "konva";
import { useCallback, useReducer } from "react";
import { useShapeStore } from "../store/canvas";

type StateConfig = Konva.ShapeConfig[];

interface State {
  history: StateConfig[];
  historyIndex: number;
  shapes: StateConfig;
}

type FunctionableState =
  | StateConfig
  | ((prevState: StateConfig) => StateConfig);

interface Action {
  logHistory?: boolean;
  shapes: FunctionableState;
}

const updatestate = (
  newState: FunctionableState,
  prevState: StateConfig
): StateConfig => {
  if (typeof newState === "function") {
    return (newState as (prevState: StateConfig) => StateConfig)(prevState);
  }
  return newState;
};

const useHistoryState = () => {
  const setShapes = useShapeStore((state) => state.setShapes);

  const reducer = useCallback(
    (prevState: State, { logHistory = true, shapes }: Action): State => {
      const newShapes = updatestate(shapes, prevState.shapes);
      const newHistory = logHistory
        ? [...prevState.history.slice(0, prevState.historyIndex + 1), newShapes]
        : prevState.history;
      setShapes(newShapes);
      return {
        ...prevState,
        shapes: newShapes,
        history: newHistory,
        historyIndex: logHistory
          ? prevState.historyIndex + 1
          : prevState.historyIndex,
      };
    },
    [setShapes]
  );

  const [state, dispatch] = useReducer(reducer, {
    history: [],
    shapes: [],
    historyIndex: -1,
  });

  const undo = () => {
    if (state.historyIndex >= 0) {
      state.historyIndex -= 1;
      const prevState = state.history[state.historyIndex];
      dispatch({
        logHistory: false,
        shapes: state.historyIndex >= 0 ? prevState : [],
      });
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex += 1;
      const nextstate = state.history[state.historyIndex];
      dispatch({ logHistory: false, shapes: nextstate });
    }
  };

  const canUndo = () => state.historyIndex > 0;

  const canRedo = () => state.historyIndex < state.history.length - 1;

  return { state, dispatch, undo, redo, canUndo, canRedo };
};

export default useHistoryState;
