import Konva from "konva";
import { Rect } from "react-konva";
import { useEffect, useRef } from "react";
import { Vector2d } from "konva/lib/types";
import { useCanvasContext } from "../context/canvas";
import { useControlStore } from "../store/canvas";

const useSelect = () => {
  const selectionRef = useRef<Konva.Rect>(null);
  const selectBoxPositionRef = useRef<Konva.ShapeConfig>(null);
  const isSelectingRef = useRef<boolean>(false);

  const action = useControlStore((state) => state.action);
  const {
    stageRef,
    transformerRef,
    setSelectedNodes,
    getSingleSelectedNode,
    selectNodeById,
  } = useCanvasContext();

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

  const clearSelectNodes = () => {
    transformerRef.current?.nodes([]);
    setSelectedNodes([]);
  };

  const setSelectNodes = (nodes: Konva.Node[]) => {
    if (!transformerRef.current) return;
    const selectNodes = [...nodes];
    transformerRef.current.nodes([...nodes]);
    setSelectedNodes(selectNodes);
  };

  const startSelectionBox = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (!stageRef.current) return;

    const pointerPos = stageRef.current.getPointerPosition();
    if (!pointerPos) return;

    const selectBox = selectionRef.current;
    if (!selectBox) return;

    const position = {
      x: Math.round(pointerPos.x),
      y: Math.round(pointerPos.y),
    };
    selectBox.setAttrs(position);
    selectBoxPositionRef.current = position;
    isSelectingRef.current = true;
    selectNodeById(e.target.attrs.id);
  };

  const updateSelectionBox = () => {
    if (!stageRef.current || getSingleSelectedNode()) return;

    const pointerPos = stageRef.current.getPointerPosition();
    if (!pointerPos) return;

    const selectBox = selectionRef.current;
    const selectBoxPosition = selectBoxPositionRef.current;
    if (!selectBox || !selectBoxPosition) return;

    if (!isSelectingRef.current) return;

    const { x, y } = selectBoxPosition as Vector2d;

    selectBox.setAttrs({
      x,
      y,
      width: Number(pointerPos.x - x),
      height: Number(pointerPos.y - y),
      visible: true,
    });
  };

  const endSelectionBox = () => {
    isSelectingRef.current = false;
    if (!stageRef.current || !selectionRef.current || !transformerRef.current)
      return;

    const selectBox = selectionRef.current;
    if (!selectBox.visible()) return;

    const selectedNodes = stageRef.current
      .find(".shape")
      .filter((node) =>
        Konva.Util.haveIntersection(
          selectBox.getClientRect(),
          node.getClientRect()
        )
      );
    setSelectNodes(selectedNodes);
    selectBox.visible(false);
  };

  const SelectionBox = () => (
    <Rect
      ref={(node) => {
        selectionRef.current = node;
      }}
      id="selectBox"
      fill="rgba(0,0,255,0.5)"
      visible={false}
      listening={false}
    />
  );

  return {
    selectNodeById,
    clearSelectNodes,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    SelectionBox,
  };
};

export default useSelect;
