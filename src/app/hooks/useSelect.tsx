import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { RefObject, useContext, useRef } from "react";
import { Rect } from "react-konva";
import { CanvasContext } from "../context/canvas";

const useSelect = (
  stageRef: RefObject<Konva.Stage | null>,
  transformerRef: RefObject<Konva.Transformer | null>
) => {
  const { setCurrentNodes } = useContext(CanvasContext);

  const selectionRef = useRef<Konva.Rect>(null);
  const selectBoxPositionRef = useRef<Konva.ShapeConfig>(null);
  const isSelectingRef = useRef<boolean>(false);

  const clearSelectNodes = () => {
    transformerRef.current?.nodes([]);
    setCurrentNodes([]);
  };

  const setSelectNodes = (nodes: Konva.Node[]) => {
    if (!transformerRef.current) return;
    const selectNodes = [...nodes];
    transformerRef.current.nodes([...nodes]);
    setCurrentNodes(selectNodes);
  };

  const selectNodeById = (id: string) => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNodes = getAllSelectedNodes();
    const stage = stageRef.current;

    const node = stage.find(".shape").find((node) => node.attrs.id === id);
    if (node && !selectedNodes.includes(node)) {
      setSelectNodes([node]);
    }
  };

  const getSingleSelectedNode = (): Konva.Node | undefined =>
    transformerRef.current?.getNode();

  const getAllSelectedNodes = (): Konva.Node[] =>
    transformerRef.current?.getNodes() ?? [];

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
    selectNodeById(e.target.attrs.id);
    isSelectingRef.current = true;
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
      // 추후 수정 필요
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
