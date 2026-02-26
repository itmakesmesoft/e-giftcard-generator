import { useCanvasContext } from "@/app/context/canvas";
import {
  useSyncControl,
  useSelect,
  useShapes,
  useCommandManager,
} from "@/app/hooks";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Stage as KonvaStage, Layer, Transformer } from "react-konva";
import BackgroundLayer from "./BackgroundLayer";
import { NodeSize } from "@/app/types/canvas";
import { useControlStore, useShapeStore } from "@/app/store/canvas";
import { useGuideStore } from "@/app/store/guides";
import { UpdateCanvasOptionCommand } from "@/app/lib/command";
import useSnap from "@/app/hooks/useSnap";
import { getSnapEdges, calculateSnap, SnapEdges } from "@/utils/snap";
import type { Box } from "konva/lib/shapes/Transformer";

const Stage = ({ children }: { children: ReactNode }) => {
  const {
    canvasPos,
    stageRef,
    transformerRef,
    selectedNodes,
    getPointerPosition,
    setCanvasPos,
  } = useCanvasContext();
  const isPointerDown = useRef(false);
  const bgNodeRef = useRef<Konva.Rect>(null);
  const frameTransformerRef = useRef<Konva.Transformer>(null);
  const isFrameHovered = useRef(false);
  const isFrameTransforming = useRef(false);
  const hideTimerRef = useRef<NodeJS.Timeout>(undefined);
  const stageScale = useControlStore((state) => state.stageScale);
  const { execute } = useCommandManager();
  const [isDraggable, setIsDraggable] = useState<boolean>(false);
  const [viewportSize, setViewportSize] = useState<NodeSize>({
    width: 0,
    height: 0,
  });

  const { getAttributes } = useSyncControl();
  const action = useControlStore((state) => state.action);
  const setAction = useControlStore((state) => state.setAction);
  const { getSnapTargets, clearGuides: clearSnapGuides } = useSnap();
  const snapTargetsRef = useRef<SnapEdges[]>([]);
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
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const canvasOption = useShapeStore.getState().canvasOption;
      setViewportSize({
        width,
        height,
      });
      const posX = (width - canvasOption.canvasSize.width) / 2;
      const posY = (height - canvasOption.canvasSize.height) / 2;
      setCanvasPos({
        x: posX,
        y: posY,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedNodes.length > 0) {
      transformerRef.current?.nodes([...selectedNodes]);
      return;
    }
    transformerRef.current?.nodes([]);
  }, [selectedNodes, transformerRef]);

  useEffect(() => {
    if (!frameTransformerRef.current || !bgNodeRef.current) return;

    if (selectedNodes.length === 0) {
      frameTransformerRef.current.nodes([bgNodeRef.current]);
    } else {
      frameTransformerRef.current.nodes([]);
    }
    // Always start hidden (shown on hover)
    frameTransformerRef.current.visible(false);
    frameTransformerRef.current.getLayer()?.batchDraw();
  }, [selectedNodes]);

  const getCanvasOption = () => useShapeStore.getState().canvasOption;
  const rawSetCanvasOption = (option: ReturnType<typeof getCanvasOption>) =>
    useShapeStore.getState().setCanvasOption(option);

  const showFrameTransformer = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    if (frameTransformerRef.current) {
      frameTransformerRef.current.visible(true);
      frameTransformerRef.current.getLayer()?.batchDraw();
    }
  }, []);

  const hideFrameTransformer = useCallback(() => {
    if (frameTransformerRef.current) {
      frameTransformerRef.current.visible(false);
      frameTransformerRef.current.getLayer()?.batchDraw();
    }
  }, []);

  const scheduleHideFrameTransformer = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!isFrameHovered.current && !isFrameTransforming.current) {
        hideFrameTransformer();
      }
    }, 100);
  }, [hideFrameTransformer]);

  // Stage-level hover detection for frame Transformer
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handlePointerMove = () => {
      if (selectedNodes.length > 0 || !bgNodeRef.current) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const pos = getPointerPosition();
      const bg = bgNodeRef.current;
      const isOverBg =
        pos.x >= bg.x() &&
        pos.x <= bg.x() + bg.width() &&
        pos.y >= bg.y() &&
        pos.y <= bg.y() + bg.height();

      if (isOverBg && !isFrameHovered.current) {
        isFrameHovered.current = true;
        showFrameTransformer();
      } else if (!isOverBg && isFrameHovered.current && !isFrameTransforming.current) {
        isFrameHovered.current = false;
        scheduleHideFrameTransformer();
      }
    };

    const handleMouseLeave = () => {
      if (isFrameHovered.current) {
        isFrameHovered.current = false;
        if (!isFrameTransforming.current) scheduleHideFrameTransformer();
      }
    };

    stage.on("pointermove", handlePointerMove);
    stage.on("mouseleave", handleMouseLeave);
    return () => {
      stage.off("pointermove", handlePointerMove);
      stage.off("mouseleave", handleMouseLeave);
    };
  }, [stageRef, selectedNodes.length, getPointerPosition, showFrameTransformer, scheduleHideFrameTransformer]);

  const handleFrameTransformStart = useCallback(() => {
    isFrameTransforming.current = true;
    clearTimeout(hideTimerRef.current);
  }, []);

  // Imperative listeners on Transformer node to prevent flicker
  useEffect(() => {
    const transformer = frameTransformerRef.current;
    if (!transformer) return;

    const onEnter = () => {
      isFrameHovered.current = true;
      clearTimeout(hideTimerRef.current);
    };
    const onLeave = () => {
      isFrameHovered.current = false;
      if (!isFrameTransforming.current) scheduleHideFrameTransformer();
    };

    transformer.on("mouseenter", onEnter);
    transformer.on("mouseleave", onLeave);
    return () => {
      transformer.off("mouseenter", onEnter);
      transformer.off("mouseleave", onLeave);
    };
  }, [scheduleHideFrameTransformer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(hideTimerRef.current);
  }, []);

  const handleFrameTransformEnd = useCallback(() => {
    isFrameTransforming.current = false;

    const node = bgNodeRef.current;
    if (!node) return;

    const newWidth = Math.round(Math.max(node.width() * node.scaleX(), 50));
    const newHeight = Math.round(Math.max(node.height() * node.scaleY(), 50));

    node.scaleX(1);
    node.scaleY(1);
    node.width(newWidth);
    node.height(newHeight);

    const newOption = {
      ...getCanvasOption(),
      canvasSize: { width: newWidth, height: newHeight },
    };
    execute(
      new UpdateCanvasOptionCommand(newOption, getCanvasOption, rawSetCanvasOption)
    );

    if (!isFrameHovered.current) scheduleHideFrameTransformer();
  }, [execute, scheduleHideFrameTransformer]);

  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;

    switch (action) {
      case "select":
        stage.container().style.cursor = "default";
        break;
      case "pencil":
      case "eraser":
        stage.container().style.cursor = "none";
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
        stage.container().style.cursor = "none";
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
    // Cache snap targets at creation start (no shape to exclude yet — new shape has isDrawing)
    snapTargetsRef.current = getSnapTargets();
    const hasPoints = ["pencil", "eraser", "arrow", "line"].includes(action);
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

  const snapPointer = (
    pointerX: number,
    pointerY: number,
    originX: number,
    originY: number,
    opts?: {
      vKeys?: ("left" | "right" | "centerX")[];
      hKeys?: ("top" | "bottom" | "centerY")[];
    },
  ): { x: number; y: number } => {
    const minX = Math.min(originX, pointerX);
    const minY = Math.min(originY, pointerY);
    const w = Math.abs(pointerX - originX);
    const h = Math.abs(pointerY - originY);
    const edges = getSnapEdges({ x: minX, y: minY, width: w, height: h });
    const targets = snapTargetsRef.current;
    const result = calculateSnap(edges, targets, undefined, opts);
    useGuideStore.getState().setGuides(result.guides);
    return {
      x: pointerX + (result.dx ?? 0),
      y: pointerY + (result.dy ?? 0),
    };
  };

  const handleCreateShapeUpdate = () => {
    if (!isPointerDown.current || !stageRef.current) return;

    const pointer = getPointerPosition() as Vector2d;

    switch (action) {
      case "text":
      case "rectangle":
        updateShapeCreation((shape) => {
          const ox = shape.x ?? 0;
          const oy = shape.y ?? 0;
          const { x, y } = snapPointer(pointer.x, pointer.y, ox, oy, {
            vKeys: ["right", "centerX"],
            hKeys: ["bottom", "centerY"],
          });
          return {
            ...shape,
            width: Math.floor(x - ox),
            height: Math.floor(y - oy),
          };
        });
        break;
      case "circle":
        updateShapeCreation((shape) => {
          const ox = shape.x ?? 0;
          const oy = shape.y ?? 0;
          const r = Math.floor((pointer.y - oy) ** 2 + (pointer.x - ox) ** 2) ** 0.5;
          // Circle: center-origin, AABB = {x-r, y-r, 2r, 2r}
          const aabb = { x: ox - r, y: oy - r, width: 2 * r, height: 2 * r };
          const edges = getSnapEdges(aabb);
          const targets = snapTargetsRef.current;
          const result = calculateSnap(edges, targets);
          useGuideStore.getState().setGuides(result.guides);
          const snappedR = result.dx !== null
            ? r + Math.abs(result.dx)
            : result.dy !== null
              ? r + Math.abs(result.dy)
              : r;
          return {
            ...shape,
            radius: Math.max(0, Math.floor(snappedR)),
          };
        });
        break;
      case "ellipse":
        updateShapeCreation((shape) => {
          const ox = shape.x ?? 0;
          const oy = shape.y ?? 0;
          const rx = Math.abs(Math.floor(pointer.x - ox));
          const ry = Math.abs(Math.floor(pointer.y - oy));
          // Ellipse: center-origin, AABB = {x-rx, y-ry, 2rx, 2ry}
          const aabb = { x: ox - rx, y: oy - ry, width: 2 * rx, height: 2 * ry };
          const edges = getSnapEdges(aabb);
          const targets = snapTargetsRef.current;
          const result = calculateSnap(edges, targets);
          useGuideStore.getState().setGuides(result.guides);
          return {
            ...shape,
            radiusX: Math.max(0, rx + Math.abs(result.dx ?? 0)),
            radiusY: Math.max(0, ry + Math.abs(result.dy ?? 0)),
          };
        });
        break;
      case "triangle":
        updateShapeCreation((shape) => {
          const ox = shape.x ?? 0;
          const oy = shape.y ?? 0;
          const { x, y } = snapPointer(pointer.x, pointer.y, ox, oy, {
            vKeys: ["right", "centerX"],
            hKeys: ["bottom", "centerY"],
          });
          const width = Math.floor(x - ox);
          const height = Math.floor(y - oy);
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
          const ox = shape.x ?? 0;
          const oy = shape.y ?? 0;

          const width = Math.abs(Math.floor(pointer.x - ox));
          const height = Math.abs(Math.floor(pointer.y - oy));
          const outerRadius = Math.max(width, height);

          // Star: center-origin, AABB = {x-or, y-or, 2or, 2or}
          const aabb = { x: ox - outerRadius, y: oy - outerRadius, width: 2 * outerRadius, height: 2 * outerRadius };
          const edges = getSnapEdges(aabb);
          const targets = snapTargetsRef.current;
          const result = calculateSnap(edges, targets);
          useGuideStore.getState().setGuides(result.guides);
          const snappedOr = outerRadius + Math.abs(result.dx ?? result.dy ?? 0);
          const innerRadius = snappedOr / 2.6;

          return {
            ...shape,
            numPoints: 5,
            outerRadius: snappedOr,
            innerRadius,
          };
        });
        break;
      case "line":
      case "arrow":
        updateShapeCreation((shape) => {
          const initialPoints = shape.points.slice(0, 2) ?? [pointer.x, pointer.y];
          // Point snap: 0x0 rect at pointer position
          const aabb = { x: pointer.x, y: pointer.y, width: 0, height: 0 };
          const edges = getSnapEdges(aabb);
          const targets = snapTargetsRef.current;
          const result = calculateSnap(edges, targets);
          useGuideStore.getState().setGuides(result.guides);
          const sx = pointer.x + (result.dx ?? 0);
          const sy = pointer.y + (result.dy ?? 0);
          return {
            ...shape,
            points: [...initialPoints, sx, sy],
          };
        });
        break;
      case "eraser":
      case "pencil":
        updateShapeCreation((shape) => {
          const prevPoints = shape.points ?? [];
          return {
            ...shape,
            points: [...prevPoints, pointer.x, pointer.y],
          };
        });
        break;
    }
  };

  const handleCreateShapeComplete = () => {
    isPointerDown.current = false;
    clearSnapGuides();
    if (action === "select") return;

    const id = completeShapeCreation();
    if (action === "pencil" || action === "eraser") return;
    selectNodeById(id);
    setAction("select");
  };

  // --- Transform snap ---
  const transformSnapTargetsRef = useRef<SnapEdges[]>([]);

  const handleShapeTransformStart = useCallback(() => {
    // Cache snap targets (getSnapTargets excludes isDrawing shapes;
    // transformed shapes are not isDrawing so they appear as targets for each other,
    // which is acceptable for single-node transforms)
    transformSnapTargetsRef.current = getSnapTargets();
  }, [getSnapTargets]);

  const snapBoundBox = useCallback(
    (oldBox: Box, newBox: Box): Box => {
      // Convert absolute (stage) box to layer-relative coords
      const offsetX = canvasPos.x;
      const offsetY = canvasPos.y;
      const layerBox = {
        x: newBox.x - offsetX,
        y: newBox.y - offsetY,
        width: newBox.width,
        height: newBox.height,
      };

      const edges = getSnapEdges(layerBox);
      const targets = transformSnapTargetsRef.current;

      // Detect which edges are moving
      const leftMoved = Math.abs(newBox.x - oldBox.x) > 0.5;
      const rightMoved = Math.abs((newBox.x + newBox.width) - (oldBox.x + oldBox.width)) > 0.5;
      const topMoved = Math.abs(newBox.y - oldBox.y) > 0.5;
      const bottomMoved = Math.abs((newBox.y + newBox.height) - (oldBox.y + oldBox.height)) > 0.5;

      const vKeys: ("left" | "right" | "centerX")[] = [];
      if (leftMoved) vKeys.push("left");
      if (rightMoved) vKeys.push("right");
      if (leftMoved || rightMoved) vKeys.push("centerX");

      const hKeys: ("top" | "bottom" | "centerY")[] = [];
      if (topMoved) hKeys.push("top");
      if (bottomMoved) hKeys.push("bottom");
      if (topMoved || bottomMoved) hKeys.push("centerY");

      if (vKeys.length === 0 && hKeys.length === 0) return newBox;

      const result = calculateSnap(edges, targets, undefined, {
        vKeys: vKeys.length > 0 ? vKeys : undefined,
        hKeys: hKeys.length > 0 ? hKeys : undefined,
      });

      let { x, width, height } = newBox;
      let y = newBox.y;

      if (result.dx !== null) {
        if (leftMoved && !rightMoved) {
          // Left edge dragged: shift x, adjust width
          x += result.dx;
          width -= result.dx;
        } else if (rightMoved && !leftMoved) {
          // Right edge dragged: adjust width
          width += result.dx;
        } else {
          // Both or corner: shift position
          x += result.dx;
        }
      }

      if (result.dy !== null) {
        if (topMoved && !bottomMoved) {
          y += result.dy;
          height -= result.dy;
        } else if (bottomMoved && !topMoved) {
          height += result.dy;
        } else {
          y += result.dy;
        }
      }

      // Show guides (convert back from layer to stage coords for display isn't needed —
      // guides are in layer coords and GuideLines renders in its own layer)
      useGuideStore.getState().setGuides(result.guides);

      return { ...newBox, x, y, width, height };
    },
    [canvasPos],
  );

  const handleShapeTransformEnd = useCallback(() => {
    clearSnapGuides();
  }, [clearSnapGuides]);

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
        bgRef={(node) => {
          bgNodeRef.current = node;
        }}
        viewPortWidth={viewportSize.width}
        viewPortHeight={viewportSize.height}
        {...canvasPos}
      />
      {children}
      <Layer id="_selectLayer">
        <SelectionBox />
        <Transformer
          ref={transformerRef}
          boundBoxFunc={snapBoundBox}
          onTransformStart={handleShapeTransformStart}
          onTransformEnd={handleShapeTransformEnd}
        />
        <Transformer
          ref={frameTransformerRef}
          rotateEnabled={false}
          keepRatio={false}
          borderStroke="#4a90d9"
          borderStrokeWidth={1}
          anchorSize={8}
          anchorStroke="#4a90d9"
          anchorFill="#ffffff"
          onTransformStart={handleFrameTransformStart}
          onTransformEnd={handleFrameTransformEnd}
        />
      </Layer>
    </KonvaStage>
  );
};

export default Stage;
