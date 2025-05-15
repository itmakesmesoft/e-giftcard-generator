import { useCanvasContext } from "@/app/context/canvas";
import { useControl, useSelect, useShapes } from "@/app/hooks";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Stage as KonvaStage, Layer, Transformer } from "react-konva";
import BackgroundLayer from "./BackgroundLayer";
import { useShapeStore } from "@/app/store/canvas";

const Stage = ({ children }: { children: ReactNode }) => {
  const {
    viewportSize,
    canvasPos,
    stageRef,
    transformerRef,
    stageScale,
    getPointerPosition,
  } = useCanvasContext();
  const isPointerDown = useRef(false);
  const [isDraggable, setIsDraggable] = useState<boolean>(false);
  const canvasSize = useShapeStore((state) => state.canvasOption.canvasSize);

  const { action, setAction, getAttributes } = useControl();

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

  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;

    switch (action) {
      case "select":
        stage.container().style.cursor = "default";
        break;
      case "pencil":
      case "eraser":
        stage.container().style.cursor = "default";
        break;
      default:
        stage.container().style.cursor = "crosshair";
    }
  }, [action, stageRef]);

  const switchCursor = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (!stageRef.current) return;
    const stage = stageRef.current;

    if (e.type === "pointerdown" && e.evt.button === 1) {
      stage.container().style.cursor = "grabbing";
      return;
    }
    switch (action) {
      case "select":
        stage.container().style.cursor = "default";
        break;
      case "pencil":
      case "eraser":
        stage.container().style.cursor = "default";
        break;
      default:
        stage.container().style.cursor = "crosshair";
    }
  };

  const onPointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (e.evt.button === 1) setIsDraggable(true);
    else if (action === "select") startSelectionBox(e);
    else handleCreateShapeStart();
    switchCursor(e);
  };

  const onPointerMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (e.evt.button === 1) return;
    else if (action === "select") updateSelectionBox();
    else handleCreateShapeUpdate();
  };

  const onPointerUp = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (e.evt.button === 1) setIsDraggable(false);
    else if (action === "select") endSelectionBox();
    else handleCreateShapeComplete();
    switchCursor(e);
  };

  const handleCreateShapeStart = () => {
    if (!stageRef.current) return;
    const { x, y } = getPointerPosition() as Vector2d;

    isPointerDown.current = true;
    const hasPoints = ["pencil", "eraser", "arrow"].includes(action);
    const isFont = action === "text";
    const isBrush = action === "pencil" || action === "eraser";
    const isShape = !isFont && !isBrush;
    startShapeCreation({
      type: action,
      ...(isFont && { ...getAttributes.font }),
      ...(isBrush && { ...getAttributes.brush }),
      ...(isShape && { ...getAttributes.shape }),
      ...(hasPoints ? { points: [x, y] } : { x, y }),
    });
  };

  const handleCreateShapeUpdate = () => {
    if (!isPointerDown.current || !stageRef.current) return;

    const { x, y } = getPointerPosition() as Vector2d;

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
      case "ellipse":
        updateShapeCreation((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;
          return {
            ...shape,
            radiusX: Math.abs(Math.floor(x - dx)),
            radiusY: Math.abs(Math.floor(y - dy)),
          };
        });
        break;
      case "triangle":
        updateShapeCreation((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;
          const width = Math.floor(x - dx);
          const height = Math.floor(y - dy);
          return {
            ...shape,
            width,
            height,
            points: [width / 2, 0, width, height, 0, height],
          };
        });
        break;
      case "star":
        updateShapeCreation((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;

          const width = Math.abs(Math.floor(x - dx));
          const height = Math.abs(Math.floor(y - dy));

          const outerRadius = Math.max(width, height);
          const innerRadius = outerRadius / 2.6;

          return {
            ...shape,
            numPoints: 5, // 별의 꼭지점 수는 고정
            outerRadius,
            innerRadius,
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
      width={viewportSize.width}
      height={viewportSize.height}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      draggable={isDraggable}
      scaleX={stageScale}
      scaleY={stageScale}
    >
      <BackgroundLayer
        id="_bgLayer"
        onPointerDown={clearSelectNodes}
        viewPortWidth={viewportSize.width}
        viewPortHeight={viewportSize.height}
        {...canvasSize}
        {...canvasPos}
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
