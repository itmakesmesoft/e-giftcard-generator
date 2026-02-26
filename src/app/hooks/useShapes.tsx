import Konva from "konva";
import { useCanvasContext } from "../context/canvas";
import { useCallback, useEffect, useRef } from "react";
import { useShapeStore } from "../store/canvas";
import { ShapeConfig } from "@/app/types/canvas";
import { generateShapeConfig, omitKeysFromObject } from "@/utils/canvas";
import useCommandManager from "./useCommandManager";
import {
  AddShapeCommand,
  UpdateShapeCommand,
  CreateShapeCommand,
} from "../lib/command";

const useShapes = () => {
  const currentShapeRef = useRef<ShapeConfig>(null);
  const prevShapesRef = useRef<ShapeConfig[]>([]);
  const { transformerRef } = useCanvasContext();
  const setShapes = useShapeStore((state) => state.setShapes);
  const { execute } = useCommandManager();

  const getShapes = () => useShapeStore.getState().shapes;
  const rawSetShapes = (shapes: ShapeConfig[]) =>
    useShapeStore.getState().setShapes(shapes);

  const onTransform = useCallback(() => {
    const nodes = transformerRef.current?.getNodes();
    if (!nodes || nodes.length === 0) return;

    const updatedAttrs = new Map(
      nodes.map((node) => [
        node.attrs.id,
        omitKeysFromObject(node.attrs, ["ref"]),
      ])
    );

    const newShapes = getShapes().map((shape: Konva.ShapeConfig) => {
      const attrs = updatedAttrs.get(shape.id);
      return attrs ? { ...shape, ...attrs } : shape;
    });

    execute(new UpdateShapeCommand(newShapes, getShapes, rawSetShapes));
  }, [execute, transformerRef]);

  useEffect(() => {
    if (!transformerRef.current) return;

    transformerRef.current.on("transformend", onTransform);
  }, [onTransform, transformerRef]);

  const createShape = useCallback(
    <T extends ShapeConfig>(shapeConfig: T) => {
      const shape = generateShapeConfig(shapeConfig);
      execute(new AddShapeCommand(shape, getShapes, rawSetShapes));
      return shape;
    },
    [execute]
  );

  const updateShape = useCallback(
    (callback: (shape: ShapeConfig) => ShapeConfig) => {
      setShapes((shapes) => shapes.map(callback));
    },
    [setShapes]
  );

  const startShapeCreation = useCallback(
    <T extends Konva.ShapeConfig>(shapeConfig: T) => {
      const shape = generateShapeConfig(shapeConfig);
      prevShapesRef.current = getShapes();
      setShapes((shapes) => [...shapes, shape]);
      currentShapeRef.current = shape;
      return shape;
    },
    [setShapes]
  );

  const updateShapeCreation = useCallback(
    (callback: (shape: Konva.ShapeConfig) => Konva.ShapeConfig) => {
      const currentId = currentShapeRef.current?.id;
      if (!currentId || !currentShapeRef.current) return;

      const updated = callback(currentShapeRef.current);
      const newShape = { ...updated, isDrawing: true };
      currentShapeRef.current = newShape;
      setShapes((shapes) =>
        shapes.map((shape) => (shape.id === currentId ? newShape : shape))
      );
    },
    [setShapes]
  );

  const completeShapeCreation = useCallback(() => {
    execute(
      new CreateShapeCommand(prevShapesRef.current, getShapes, rawSetShapes)
    );
    const id = currentShapeRef.current?.id as string;
    currentShapeRef.current = null;
    return id;
  }, [execute]);

  return {
    createShape,
    startShapeCreation,
    updateShapeCreation,
    completeShapeCreation,
    updateShape,
  };
};

export default useShapes;
