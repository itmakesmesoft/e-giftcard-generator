import { Group } from "konva/lib/Group";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { useCanvasContext } from "../context/canvas";
import { useCallback } from "react";
import { convertPosition } from "@/utils/canvas";
import useControl from "./useControl";
import { useShapeStore } from "../store/canvas";

export interface CanvasData {
  canvas: {
    width: number;
    height: number;
    bgColor: string;
    children: (Group | Shape<ShapeConfig>)[] | undefined;
  };
}

const useCanvasData = () => {
  const { stageRef, canvasPos, canvasSize } = useCanvasContext();
  const { getAttributes, setAttributes } = useControl();

  const setShapes = useShapeStore((state) => state.setShapes);

  const convertToAbsolutePosition = useCallback(
    (props: ShapeConfig, parentX?: number, parentY?: number) => {
      return convertPosition(
        props,
        parentX ?? canvasPos.x,
        parentY ?? canvasPos.y,
        true
      );
    },
    [canvasPos.x, canvasPos.y]
  );

  const convertToRelativePosition = useCallback(
    (props: ShapeConfig, parentX?: number, parentY?: number) => {
      return convertPosition(
        props,
        parentX ?? canvasPos.x,
        parentY ?? canvasPos.y,
        false
      );
    },
    [canvasPos.x, canvasPos.y]
  );

  const loadCanvasByJSON = (data: CanvasData) => {
    if (!stageRef.current) return;
    const { width, height, bgColor, children: childrenFromData } = data.canvas;
    if (!childrenFromData) return;
    const children = childrenFromData?.map(({ attrs }) => ({
      ...attrs,
      ...convertToAbsolutePosition(attrs), // 절대 좌표로 변환
    })) as ShapeConfig[];
    setAttributes.setCanvasOption(
      () => ({
        canvasSize: { width, height },
        bgColor,
      }),
      false
    );
    setShapes(children, false);
  };

  const exportCanvasAsJSON = () => {
    if (!stageRef.current) return;
    const stagedChildren = stageRef.current.getChildren();
    const extractIds = ["_shapeLayer", "_drawLayer"];
    const children = stagedChildren
      .filter(({ attrs }) => extractIds.includes(attrs.id))
      .map(({ children }) =>
        children.map((child) => ({
          ...child,
          attrs: {
            ...child.attrs,
            ...convertToRelativePosition(child.attrs), // 상대 좌표로 변환
          },
        }))
      )
      .flat() as (Group | Shape<ShapeConfig>)[];
    return {
      canvas: {
        ...canvasSize,
        bgColor: getAttributes.canvasOption.bgColor,
        children: children,
      },
    };
  };
  return { loadCanvasByJSON, exportCanvasAsJSON };
};

export default useCanvasData;
