const MAXIMUM_HISTORY_SIZE = 100;

export interface Command {
  execute(): void;
  undo(): void;
}

export class CommandManager {
  private static instance: CommandManager | undefined;
  private history: Command[];
  private currentIndex: number;
  private maxHistorySize: number;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = MAXIMUM_HISTORY_SIZE;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new CommandManager();
    }
    return this.instance;
  }

  execute(command: Command) {
    this.history = this.history.slice(0, this.currentIndex + 1);

    command.execute();
    this.history.push(command);
    this.currentIndex++;

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.notify();
  }

  undo() {
    if (this.canUndo()) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      this.notify();
      return true;
    }
    return false;
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      this.notify();
      return true;
    }
    return false;
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export class CombineCommand implements Command {
  private commands: Command[];

  constructor(...commands: Command[]) {
    this.commands = commands;
  }

  execute(): void {
    for (const command of this.commands) {
      command.execute();
    }
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}
