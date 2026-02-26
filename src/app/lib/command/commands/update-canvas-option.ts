import { Command } from "../command-manager";

type CanvasOption = {
  canvasSize: { width: number; height: number };
  bgColor: string;
};

export class UpdateCanvasOptionCommand implements Command {
  private prevOption: CanvasOption;
  private newOption: CanvasOption;
  private setCanvasOption: (option: CanvasOption) => void;

  constructor(
    newOption: CanvasOption,
    getCanvasOption: () => CanvasOption,
    setCanvasOption: (option: CanvasOption) => void
  ) {
    this.prevOption = getCanvasOption();
    this.newOption = newOption;
    this.setCanvasOption = setCanvasOption;
  }

  execute(): void {
    this.setCanvasOption(this.newOption);
  }

  undo(): void {
    this.setCanvasOption(this.prevOption);
  }
}
