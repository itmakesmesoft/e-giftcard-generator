import { useCanvasContext } from "@/app/context/canvas";
import { useControl, useSelect, useShapes } from "@/app/hooks";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { ReactNode, useEffect, useRef } from "react";
import { Stage as KonvaStage, Layer, Transformer } from "react-konva";
import BackgroundLayer from "./BackgroundLayer";

const Stage = ({ children }: { children: ReactNode }) => {
  const { canvasInfo, setCanvasInfo, stageRef, transformerRef } =
    useCanvasContext();
  const { action, setAction, getAttributes } = useControl();

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

  // TODO. 이 부분 개선해야 함.
  // 글고, canvas 크기를 변경하거나, frame 크기를 변경할 때, x,y 위치도 바뀌도록 해야함.
  const viewPortWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const viewPortHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  useEffect(() => {
    setCanvasInfo((canvasInfo) => ({
      ...canvasInfo,
      x: (viewPortWidth - canvasInfo.width) / 2,
      y: (viewPortHeight - canvasInfo.height) / 2,
    }));
  }, [setCanvasInfo, viewPortHeight, viewPortWidth]);

  return (
    <KonvaStage
      ref={stageRef}
      width={viewPortWidth}
      height={viewPortHeight}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <BackgroundLayer
        id="_bgLayer"
        onPointerDown={clearSelectNodes}
        viewPortWidth={viewPortWidth}
        viewPortHeight={viewPortHeight}
        {...canvasInfo}
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
