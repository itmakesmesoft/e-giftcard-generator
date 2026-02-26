import { useCallback, useEffect, useState } from "react";
import { Command, CommandManager } from "../lib/command";

const commandManager = CommandManager.getInstance();

const useCommandManager = () => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const unsubscribe = commandManager.subscribe(() => {
      setCanUndo(commandManager.canUndo());
      setCanRedo(commandManager.canRedo());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const execute = useCallback((command: Command) => {
    commandManager.execute(command);
  }, []);

  const undo = useCallback(() => {
    commandManager.undo();
  }, []);

  const redo = useCallback(() => {
    commandManager.redo();
  }, []);

  const clear = useCallback(() => {
    commandManager.clear();
  }, []);

  return { execute, undo, redo, canUndo, canRedo, clear };
};

export default useCommandManager;
