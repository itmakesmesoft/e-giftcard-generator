import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { RefObject, useRef } from "react";
import { Rect } from "react-konva";

const useSelect = (
  stageRef: RefObject<Konva.Stage | null>,
  transformerRef: RefObject<Konva.Transformer | null>
) => {
  const selectionRef = useRef<Konva.Rect>(null);
  const isSelecting = useRef<boolean>(false);

  const selectNodeById = (id: string) => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNodes = getAllSelectedNodes();
    const stage = stageRef.current;

    const node = stage.find(".shape").find((node) => node.attrs.id === id);
    if (node && !selectedNodes.includes(node)) {
      transformerRef.current.nodes([node]);
    }
  };

  const clearSelection = () => {
    transformerRef.current?.nodes([]);
  };

  const startSelection = () => {
    if (!stageRef.current) return;

    const pointerPos = stageRef.current.getPointerPosition();
    if (!pointerPos) return;

    const selectBox = selectionRef.current;
    if (!selectBox) return;

    isSelecting.current = true;

    selectBox.setAttrs({
      x: pointerPos.x,
      y: pointerPos.y,
      width: 0,
      height: 0,
    });
  };

  const updateSelection = () => {
    if (!stageRef.current || getSingleSelectedNode()) return;

    const pointerPos = stageRef.current.getPointerPosition();
    if (!pointerPos) return;

    const selectBox = selectionRef.current;
    if (!selectBox) return;

    if (!isSelecting.current) return;

    const { x, y } = selectBox.attrs as Vector2d;

    selectBox.setAttrs({
      visible: true,
      width: Number(pointerPos.x - x),
      height: Number(pointerPos.y - y),
    });
  };

  const endSelection = () => {
    isSelecting.current = false;
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

    transformerRef.current.nodes(selectedNodes);
    selectBox.visible(false);
  };

  const getSingleSelectedNode = () => transformerRef.current?.getNode();

  const getAllSelectedNodes = () => transformerRef.current?.getNodes() ?? [];

  const SelectionBox = () => (
    <Rect
      ref={selectionRef}
      fill="rgba(0,0,255,0.5)"
      visible={false}
      listening={false}
    />
  );

  return {
    selectNodeById,
    clearSelection,
    getSingleSelectedNode,
    getAllSelectedNodes,
    startSelection,
    updateSelection,
    endSelection,
    SelectionBox,
  };
};

export default useSelect;
