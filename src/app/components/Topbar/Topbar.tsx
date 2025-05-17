import Konva from "konva";
import { nanoid } from "nanoid";
import { ColorResult } from "react-color";
import Toolbar from "@/components/Toolbar";
import { useHotkeys } from "react-hotkeys-hook";
import { useEffect, useRef, useState } from "react";
import TextControlPanel from "./TextControlPanel";
import ShapeControlPanel from "./ShapeControlPanel";
import BrushControlPanel from "./BrushControlPanel";
import DeleteIcon from "@/components/assets/DeleteIcon";
import { useCanvasContext } from "@/app/context/canvas";
import { useControlStore, useShapeStore } from "@/app/store/canvas";
import { PanelType } from "./types";
import { useSelect, useSyncControl } from "@/app/hooks";
import { ActionType } from "@/app/types/canvas";

const Topbar = ({ className }: { className: string }) => {
  const clipboardRef = useRef<Konva.Node[]>(null);
  const [panelType, setPanelType] = useState<PanelType>(null);

  const action = useControlStore((state) => state.action);
  const setShapes = useShapeStore((state) => state.setShapes);
  const setCanvasOption = useShapeStore((state) => state.setCanvasOption);

  const { getAttributes } = useSyncControl();
  const { clearSelectNodes } = useSelect();
  const { selectedNodes, selectNodesByIdList, getAllSelectedNodes } =
    useCanvasContext();
  const actionType: ActionType | null =
    selectedNodes.length === 1 ? selectedNodes[0].attrs.type : null;

  useEffect(() => {
    if (selectedNodes.length > 0) {
      const type = getProperPanelType(selectedNodes);
      switch (type) {
        case "text":
          setPanelType("text");
          break;
        case "shape":
          setPanelType("shape");
      }
    } else {
      switch (action) {
        case "text":
          if (panelType !== "text") setPanelType("text");
          break;
        case "pencil":
        case "eraser":
          if (panelType !== "brush") setPanelType("brush");
          break;
        case "rectangle":
        case "circle":
        case "arrow":
        case "line":
          if (panelType !== "shape") setPanelType("shape");
          break;
        default:
          if (panelType !== null) setPanelType(null);
      }
    }
  }, [selectedNodes, action, panelType]);

  const copySelectedShapes = () => {
    if (!selectedNodes) return;
    clipboardRef.current = selectedNodes;
  };

  const pasteCopiedShape = () => {
    if (!clipboardRef.current) return;
    const ids: string[] = [];
    const copied = clipboardRef.current?.map(({ attrs }) => {
      const id = nanoid();
      ids.push(id);

      // 이전 참조값을 제거하기 위해 ref는 구조분해 후 제거
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ref: _, ...restAttrs } = attrs;
      return {
        ...restAttrs,
        id,
        x: attrs.x + 10,
        y: attrs.y + 10,
      };
    });
    setShapes((shapes) => [...shapes, ...copied]);
    selectNodesByIdList(ids);
  };

  const updateSelectedShapeAttributes = (newAttrs: Konva.ShapeConfig) => {
    const ids = selectedNodes.map((node) => node.attrs.id);
    if (ids.length === 0) return;

    setShapes((shapes) =>
      shapes.map((shape) => {
        const shapeId = shape.id;
        return shapeId && ids.includes(shapeId)
          ? { ...shape, ...newAttrs }
          : shape;
      })
    );
  };
  const removeShapeOnCanvas = () => {
    const nodes = getAllSelectedNodes();
    const ids = nodes.map((node) => node.attrs.id) as string[];
    if (ids.length === 0) return;
    setShapes((shapes) =>
      shapes.filter((shape) => shape.id && !ids.includes(shape.id))
    );
    clearSelectNodes();
  };

  useHotkeys(["delete", "backspace"], () => {
    removeShapeOnCanvas();
  });

  useHotkeys("ctrl+c", copySelectedShapes, [selectedNodes]);

  useHotkeys("ctrl+v", pasteCopiedShape, [selectedNodes]);

  const onBgColorChange = (value: ColorResult) => {
    setCanvasOption((prev) => ({ ...prev, bgColor: value.hex }));
    // updateSelectedShapeAttributes({ bgColor: value.hex });
  };

  return (
    <div className={className}>
      <Toolbar>
        <Toolbar.ColorPicker
          label="배경 색상"
          color={getAttributes.canvasOption.bgColor}
          className="rounded-none"
          onValueChangeComplete={onBgColorChange}
        />

        {panelType === "shape" && (
          <ShapeControlPanel
            updateSelectedShapeAttributes={updateSelectedShapeAttributes}
            actionType={actionType}
          />
        )}
        {panelType === "text" && (
          <TextControlPanel
            updateSelectedShapeAttributes={updateSelectedShapeAttributes}
            actionType={actionType}
          />
        )}
        {panelType === "brush" && (
          <BrushControlPanel
            updateSelectedShapeAttributes={updateSelectedShapeAttributes}
            actionType={actionType}
          />
        )}
        <Toolbar.Separator />
        <Toolbar.Tooltip label="삭제">
          <Toolbar.Button onClick={removeShapeOnCanvas}>
            <DeleteIcon width="17" height="17" />
          </Toolbar.Button>
        </Toolbar.Tooltip>
      </Toolbar>
    </div>
  );
};
export default Topbar;

const getProperPanelType = (nodes: Konva.Node[]): PanelType | null => {
  let type: PanelType | null = null;
  for (const node of nodes) {
    let tmpType: PanelType;
    if (node.attrs.type === "text") tmpType = "text";
    else tmpType = "shape";

    if (!type) type = tmpType;
    else if (type !== tmpType) return null;
  }
  return type;
};
