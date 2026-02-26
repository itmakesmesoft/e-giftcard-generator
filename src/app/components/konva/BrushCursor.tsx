import Konva from "konva";
import { useEffect, useRef } from "react";
import { Circle } from "react-konva";
import { useControlStore } from "@/app/store/canvas";
import { useCanvasContext } from "@/app/context/canvas";

const BrushCursor = () => {
  const cursorRef = useRef<Konva.Circle>(null);
  const action = useControlStore((state) => state.action);
  const strokeWidth = useControlStore((state) => state.brush.strokeWidth);
  const { stageRef, getPointerPosition } = useCanvasContext();

  const isActive = action === "pencil" || action === "eraser";

  useEffect(() => {
    if (!isActive) return;
    const stage = stageRef.current;
    const circle = cursorRef.current;
    if (!stage || !circle) return;

    const onPointerMove = () => {
      const pos = getPointerPosition();
      if (!pos) return;
      circle.position(pos);
      circle.visible(true);
      circle.getLayer()?.batchDraw();
    };

    const onMouseEnter = () => {
      circle.visible(true);
      circle.getLayer()?.batchDraw();
    };

    const onMouseLeave = () => {
      circle.visible(false);
      circle.getLayer()?.batchDraw();
    };

    stage.on("pointermove", onPointerMove);
    stage.on("mouseenter", onMouseEnter);
    stage.on("mouseleave", onMouseLeave);

    return () => {
      stage.off("pointermove", onPointerMove);
      stage.off("mouseenter", onMouseEnter);
      stage.off("mouseleave", onMouseLeave);
    };
  }, [stageRef, isActive, getPointerPosition]);

  if (!isActive) return null;

  return (
    <Circle
      ref={cursorRef}
      radius={strokeWidth / 2}
      stroke="#00000050"
      strokeWidth={1}
      fill="rgba(255,255,255,0.7)"
      listening={false}
      x={-strokeWidth}
      y={-strokeWidth}
    />
  );
};

export default BrushCursor;
