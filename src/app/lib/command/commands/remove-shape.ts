import { ShapeConfig } from "@/app/types/canvas";
import { Command } from "../command-manager";

export class RemoveShapeCommand implements Command {
  private removedShapes: { shape: ShapeConfig; index: number }[] = [];
  private ids: string[];
  private getShapes: () => ShapeConfig[];
  private setShapes: (shapes: ShapeConfig[]) => void;

  constructor(
    ids: string[],
    getShapes: () => ShapeConfig[],
    setShapes: (shapes: ShapeConfig[]) => void
  ) {
    this.ids = ids;
    this.getShapes = getShapes;
    this.setShapes = setShapes;
  }

  execute(): void {
    const shapes = this.getShapes();
    this.removedShapes = [];
    shapes.forEach((shape, index) => {
      if (shape.id && this.ids.includes(shape.id)) {
        this.removedShapes.push({ shape, index });
      }
    });
    this.setShapes(shapes.filter((s) => !s.id || !this.ids.includes(s.id)));
  }

  undo(): void {
    const shapes = [...this.getShapes()];
    for (const { shape, index } of this.removedShapes) {
      shapes.splice(index, 0, shape);
    }
    this.setShapes(shapes);
  }
}
