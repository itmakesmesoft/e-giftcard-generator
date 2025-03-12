import { useCanvasContext } from "@/app/context/canvas";
import { useControl, useSelect, useShapes } from "@/app/hooks";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { ReactNode, useRef } from "react";
import { Stage as KonvaStage, Layer, Transformer } from "react-konva";
import BackgroundLayer from "./BackgroundLayer";
import { useControlStore } from "@/app/store/canvas";

const Stage = ({ children }: { children: ReactNode }) => {
  const { canvasSize, stageRef, transformerRef } = useCanvasContext();
  const { action, setAction, getAttributes } = useControl();

  // const fill = useControlStore((state) => state.fill);
  // const stroke = useControlStore((state) => state.stroke);
  // const action = useControlStore((state) => state.action);
  // const setAction = useControlStore((state) => state.setAction);

  const isPointerDown = useRef(false);

  const { startShapeCreation, updateShapeCreation, completeShapeCreation } =
    useShapes();
  const {
    selectNodeById,
    clearSelectNodes,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    SelectionBox,
  } = useSelect();

  const onPointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (action === "select") {
      startSelectionBox(e);
    } else handleCreateShapeStart();
  };

  const onPointerMove = () => {
    if (action === "select") updateSelectionBox();
    else handleCreateShapeUpdate();
  };

  const onPointerUp = () => {
    if (action === "select") endSelectionBox();
    else handleCreateShapeComplete();
  };

  const handleCreateShapeStart = () => {
    if (!stageRef.current) return;
    const { x, y } = stageRef.current.getPointerPosition() as Vector2d;

    isPointerDown.current = true;
    const hasPoints = ["pencil", "eraser", "arrow"].includes(action);

    startShapeCreation({
      type: action,
      ...getAttributes,
      // fill,
      // stroke,
      ...(hasPoints ? { points: [x, y] } : { x, y }),
    });
  };

  const handleCreateShapeUpdate = () => {
    if (!isPointerDown.current || !stageRef.current) return;

    const { x, y } = stageRef.current.getPointerPosition() as Vector2d;

    switch (action) {
      case "text":
      case "rectangle":
        updateShapeCreation((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;
          return {
            ...shape,
            width: Math.floor(x - dx),
            height: Math.floor(y - dy),
          };
        });
        break;
      case "circle":
        updateShapeCreation((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;
          return {
            ...shape,
            radius: Math.floor((y - dy) ** 2 + (x - dx) ** 2) ** 0.5,
          };
        });
        break;
      case "arrow":
        updateShapeCreation((shape) => {
          const initialPoints = shape.points.slice(0, 2) ?? [x, y];
          return {
            ...shape,
            points: [...initialPoints, x, y],
          };
        });
        break;
      case "eraser":
      case "pencil":
        updateShapeCreation((shape) => {
          const prevPoints = shape.points ?? [];
          return {
            ...shape,
            points: [...prevPoints, x, y],
          };
        });
        break;
    }
  };

  const handleCreateShapeComplete = () => {
    isPointerDown.current = false;
    if (action === "select") return;

    const id = completeShapeCreation();
    if (action === "pencil" || action === "eraser") return;
    selectNodeById(id);
    setAction("select");
  };

  return (
    <KonvaStage
      ref={stageRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <BackgroundLayer
        id="_bgLayer"
        onPointerDown={clearSelectNodes}
        width={canvasSize.width}
        height={canvasSize.height}
      />
      {children}
      <Layer id="_selectLayer">
        <SelectionBox />
        <Transformer ref={transformerRef} />
      </Layer>
    </KonvaStage>
  );
};

export default Stage;
