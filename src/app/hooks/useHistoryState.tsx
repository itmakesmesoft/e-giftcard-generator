import Konva from "konva";
import { useReducer } from "react";

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

const reducer = (
  prevState: State,
  { logHistory = true, shapes }: Action
): State => {
  const newState = updatestate(shapes, prevState.shapes);
  const newHistory = logHistory
    ? [...prevState.history.slice(0, prevState.historyIndex + 1), newState]
    : prevState.history;
  return {
    ...prevState,
    shapes: newState,
    history: newHistory,
    historyIndex: logHistory
      ? prevState.historyIndex + 1
      : prevState.historyIndex,
  };
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
