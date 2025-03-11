import Konva from "konva";
import { useCanvasContext } from "../context/canvas";
import { useCallback, useEffect, useRef } from "react";
import { useShapeStore } from "../store/canvas";
import { ShapeConfig } from "@/app/types/canvas";
import { generateShapeConfig } from "@/utils/canvas";

const useShapes = () => {
  const currentShapeRef = useRef<ShapeConfig>(null);
  const { transformerRef } = useCanvasContext();
  const setShapes = useShapeStore((state) => state.setShapes);

  // Transformer 컴포넌트에 의해 스케일이 변경되는 경우, 변경사항을 shapes에 반영해주기 위함.
  const onTransform = useCallback(() => {
    const target = transformerRef.current?.getNode();
    if (!target) return;

    setShapes((shapes) =>
      shapes.map((shape: Konva.ShapeConfig) =>
        shape.id === target.attrs.id ? { ...shape, ...target.attrs } : shape
      )
    );
  }, [setShapes, transformerRef]);

  useEffect(() => {
    if (!transformerRef.current) return;

    transformerRef.current.on("transformend", onTransform);
  }, [onTransform, transformerRef]);

  const createShape = <T extends ShapeConfig>(shapeConfig: T) => {
    const shape = generateShapeConfig(shapeConfig);
    setShapes((shapes) => [...shapes, shape]);
    return shape;
  };

  const updateShape = useCallback(
    (callback: (shape: ShapeConfig) => ShapeConfig) => {
      setShapes((shapes) => shapes.map(callback));
    },
    [setShapes]
  );

  const startShapeCreation = <T extends Konva.ShapeConfig>(shapeConfig: T) => {
    const shape = generateShapeConfig(shapeConfig);
    setShapes((shapes) => [...shapes, shape], false);
    currentShapeRef.current = shape;
    return shape;
  };

  const updateShapeCreation = (
    callback: (shape: Konva.ShapeConfig) => Konva.ShapeConfig
  ) => {
    const currentId = currentShapeRef.current?.id;
    if (!currentId || !currentShapeRef.current) return;

    const updated = callback(currentShapeRef.current);
    const newShape = { ...updated, isDrawing: true };
    currentShapeRef.current = newShape;
    setShapes(
      (shapes) =>
        shapes.map((shape) => (shape.id === currentId ? newShape : shape)),
      false
    );
  };

  const completeShapeCreation = () => {
    setShapes((shapes) =>
      shapes.map((shape) => ({ ...shape, isDrawing: false }))
    );
    const id = currentShapeRef.current?.id;
    currentShapeRef.current = null;
    return id as string;
  };

  return {
    createShape,
    startShapeCreation,
    updateShapeCreation,
    completeShapeCreation,
    updateShape,
  };
};

export default useShapes;
