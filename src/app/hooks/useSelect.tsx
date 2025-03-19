import Konva from "konva";
import { Rect } from "react-konva";
import { useRef } from "react";
import { Vector2d } from "konva/lib/types";
import { useCanvasContext } from "../context/canvas";

const useSelect = () => {
  const selectionRef = useRef<Konva.Rect>(null);
  const selectBoxPositionRef = useRef<Konva.ShapeConfig>(null);
  const isSelectingRef = useRef<boolean>(false);

  const {
    stageRef,
    transformerRef,
    setSelectedNodes,
    getSingleSelectedNode,
    selectNodeById,
    getPointerPosition,
  } = useCanvasContext();

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
    const pointerPos = getPointerPosition();
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
    if (getSingleSelectedNode()) return;

    const pointerPos = getPointerPosition();
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
      fill="rgba(211,237,255,0.5)"
      stroke="rgba(211,237,255,1)"
      strokeWidth={1}
      visible={false}
      listening={false}
      perfectDrawEnabled={false}
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
