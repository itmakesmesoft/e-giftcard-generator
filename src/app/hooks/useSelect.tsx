import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { RefObject, useRef } from "react";
import { Rect } from "react-konva";

const useSelect = (
  stageRef: RefObject<Konva.Stage | null>,
  transformerRef: RefObject<Konva.Transformer | null>
) => {
  const selectionRef = useRef<Konva.Rect>(null);
  const isSelectingRef = useRef<boolean>(false);

  const selectNodeById = (id: string) => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNodes = getAllSelectedNodes();
    const stage = stageRef.current;

    const node = stage.find(".shape").find((node) => node.attrs.id === id);
    if (node && !selectedNodes.includes(node)) {
      setSelectNodes([node]);
    }
  };

  const clearSelectNodes = () => {
    transformerRef.current?.nodes([]);
  };

  const setSelectNodes = (nodes: Konva.Node[]) => {
    if (!transformerRef.current) return;
    transformerRef.current.nodes([...nodes]);
  };

  const startSelectionBox = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (!stageRef.current) return;

    const pointerPos = stageRef.current.getPointerPosition();
    if (!pointerPos) return;

    const selectBox = selectionRef.current;
    if (!selectBox) return;

    isSelectingRef.current = true;

    selectNodeById(e.target.attrs.id);
    selectBox.setAttrs({
      x: pointerPos.x,
      y: pointerPos.y,
      width: 0,
      height: 0,
    });
  };

  const updateSelectionBox = () => {
    if (!stageRef.current || getSingleSelectedNode()) return;

    const pointerPos = stageRef.current.getPointerPosition();
    if (!pointerPos) return;

    const selectBox = selectionRef.current;
    if (!selectBox) return;

    if (!isSelectingRef.current) return;

    const { x, y } = selectBox.attrs as Vector2d;

    selectBox.setAttrs({
      visible: true,
      width: Number(pointerPos.x - x),
      height: Number(pointerPos.y - y),
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

  const getSingleSelectedNode = (): Konva.Node | undefined =>
    transformerRef.current?.getNode();

  const getAllSelectedNodes = (): Konva.Node[] =>
    transformerRef.current?.getNodes() ?? [];

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
    getSingleSelectedNode,
    getAllSelectedNodes,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    SelectionBox,
  };
};

export default useSelect;
