import { ShapeConfig } from "@/app/types/canvas";
import { Command } from "../command-manager";

export class CreateShapeCommand implements Command {
  private prevShapes: ShapeConfig[];
  private completedShapes: ShapeConfig[] | null = null;
  private getShapes: () => ShapeConfig[];
  private setShapes: (shapes: ShapeConfig[]) => void;

  constructor(
    prevShapes: ShapeConfig[],
    getShapes: () => ShapeConfig[],
    setShapes: (shapes: ShapeConfig[]) => void
  ) {
    this.prevShapes = prevShapes;
    this.getShapes = getShapes;
    this.setShapes = setShapes;
  }

  execute(): void {
    if (this.completedShapes) {
      this.setShapes(this.completedShapes);
    } else {
      this.completedShapes = this.getShapes().map((shape) => ({
        ...shape,
        isDrawing: false,
      }));
      this.setShapes(this.completedShapes);
    }
  }

  undo(): void {
    this.setShapes(this.prevShapes);
  }
}
