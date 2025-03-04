"use client";

import Konva from "konva";
import { nanoid } from "nanoid";
import { ChangeEvent, useRef, useState } from "react";
import type { Vector2d } from "konva/lib/types";
import { Layer, Rect, Stage, Transformer } from "react-konva";
import useSelect from "../hooks/useSelect";
import useShapes from "../hooks/useShapes";

const ACTIONS = {
  SELECT: "select",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  PENCIL: "pencil",
  ERASER: "eraser",
  ARROW: "arrow",
  IMAGE: "image",
};

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const Canvas = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const {
    selectNodeById,
    clearSelection,
    getAllSelectedNodes,
    startSelection,
    updateSelection,
    endSelection,
    SelectionBox,
  } = useSelect(stageRef, transformerRef);

  const [action, setAction] = useState(ACTIONS.SELECT);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [strokeColor, setStrokeColor] = useState<string>("#000000");
  const {
    shapes,
    setShapes,
    createShape,
    updateShape,
    ShapesRenderer,
    DrawingRenderer,
  } = useShapes();

  const isPointerDown = useRef(false);
  const currentShapeId = useRef<string | null>(null);
  const isDraggable = action === ACTIONS.SELECT;

  const handlePointerDown = () => {
    if (!stageRef.current) return;

    const { x, y } = stageRef.current.getPointerPosition() as Vector2d;
    const id = nanoid();
    const name = "shape";

    currentShapeId.current = id;
    isPointerDown.current = true;

    const hasPoints = ["pencil", "eraser", "arrow"].includes(action);
    const isPencilOrEraser = action === "pencil" || action === "eraser";
    const compositeOperation =
      action === "pencil" ? "source-over" : "destination-out";

    const shapeConfig: Konva.ShapeConfig = {
      id,
      type: action,
      fill: fillColor,
      stroke: strokeColor,
      ...(hasPoints ? { points: [x, y] } : { x, y }),
      ...(isPencilOrEraser
        ? { globalCompositeOperation: compositeOperation }
        : { name }),
    };

    createShape(shapeConfig);
  };

  const handlePointerMove = () => {
    if (!isPointerDown.current || !stageRef.current || !currentShapeId.current)
      return;

    const { x, y } = stageRef.current.getPointerPosition() as Vector2d;
    const currentId = currentShapeId.current;

    switch (action) {
      case ACTIONS.IMAGE:
      case ACTIONS.RECTANGLE:
        updateShape((shape) => {
          if (shape.id === currentId) {
            const dx = shape.x ?? 0;
            const dy = shape.y ?? 0;
            return {
              ...shape,
              width: x - dx,
              height: y - dy,
            };
          }
          return shape;
        });
        break;
      case ACTIONS.CIRCLE:
        updateShape((shape) => {
          if (shape.id === currentId) {
            const dx = shape.x ?? 0;
            const dy = shape.y ?? 0;
            return {
              ...shape,
              radius: ((y - dy) ** 2 + (x - dx) ** 2) ** 0.5,
            };
          }
          return shape;
        });
        break;
      case ACTIONS.ARROW:
        updateShape((shape) => {
          if (shape.id === currentId) {
            const initialPoints = shape.points.slice(0, 2) ?? [x, y];
            return {
              ...shape,
              points: [...initialPoints, x, y],
            };
          }
          return shape;
        });
        break;
      case ACTIONS.ERASER:
      case ACTIONS.PENCIL:
        updateShape((shape) => {
          if (shape.id === currentId) {
            const prevPoints = shape.points ?? [];
            return {
              ...shape,
              points: [...prevPoints, x, y],
            };
          }
          return shape;
        });
        break;
    }
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    if (!currentShapeId.current) return;
    if (
      action !== ACTIONS.SELECT &&
      action !== ACTIONS.PENCIL &&
      action !== ACTIONS.ERASER
    ) {
      selectNodeById(currentShapeId.current);
      setAction(ACTIONS.SELECT);
    }
    currentShapeId.current = null;
  };

  const exportCanvasAsImage = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    link.click();
    document.body.appendChild(link);
    document.body.removeChild(link);
  };

  // TODO. localStorage에 저장하도록 변경
  // debounce를 이용한 자동 저장 필요
  const exportCanvasAsJSON = () => {
    if (!stageRef.current) return;
    const children = stageRef.current.getChildren();

    const extractables = ["_shapeLayer", "_drawLayer"];
    const json = children.filter((child) =>
      extractables.includes(child.attrs.id)
    );
    return json;
  };

  // TODO. localStorage에서 가져오도록 변경
  const loadCanvasByJSON = (data: string) => {
    if (!stageRef.current) return;

    const parsedLayers = JSON.parse(data) as Konva.NodeConfig[];

    // NOTE.
    // 불러온 도형들을 각각 id에 맞는 레이어에 추가해야 하나,
    // 기존에 있는 레이어의 초기화 없이 도형을 추가하는 것이 까다로워, 별도의 레이어를 생성하고, stage에 추가하도록 함

    // 추후 이전 내역 저장 후 볼러오는 방식으로 전환할 예정, 기존 레이어를 삭제하는 로직이 추가되어야 함

    for (const nodeConfig of parsedLayers) {
      const layer = Konva.Node.create(nodeConfig);
      stageRef.current.add(layer);
    }
    sortStagedObject();
  };

  const sortStagedObject = () => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const shapeLayer = stage.find("#_shapeLayer");
    const bgLayer = stage.findOne("#_bgLayer");
    const selectLayer = stage.findOne("#_selectLayer");

    shapeLayer?.map((item) => item.moveToBottom());
    bgLayer?.moveToBottom();
    selectLayer?.moveToTop();
  };

  const handleClickShape = (e: Konva.KonvaPointerEvent) => {
    if (action === ACTIONS.PENCIL || action === ACTIONS.ERASER) return;
    selectNodeById(e.target.attrs.id);
  };

  const removeShape = () => {
    const selected = getAllSelectedNodes();
    if (!selected) return;

    const removeIds = selected.map((node) => node.attrs.id);
    const filtered = shapes.filter((shape) => !removeIds.includes(shape.id));
    setShapes(filtered);
    clearSelection();
  };

  const handleFillColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedNodes = getAllSelectedNodes();
    const ids = selectedNodes.map((node) => node.attrs.id);
    if (selectedNodes.length > 0) {
      updateShape((shape) => {
        return ids.includes(shape.id)
          ? { ...shape, fill: e.target.value }
          : shape;
      });
    }
    setFillColor(e.target.value);
  };

  const handleStrokeColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedNodes = getAllSelectedNodes();
    const ids = selectedNodes.map((node) => node.attrs.id);
    if (selectedNodes) {
      updateShape((shape) => {
        return ids.includes(shape.id)
          ? { ...shape, stroke: e.target.value }
          : shape;
      });
    }
    setStrokeColor(e.target.value);
  };

  const addImage = () => {
    setAction(ACTIONS.IMAGE);
  };

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Controls */}
        <div className="absolute top-0 z-10 w-full py-2 ">
          <div className="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg">
            <ActionButton
              active={action === ACTIONS.SELECT}
              onClick={() => setAction(ACTIONS.SELECT)}
              label="커서"
            />
            <ActionButton
              active={action === ACTIONS.RECTANGLE}
              onClick={() => setAction(ACTIONS.RECTANGLE)}
              label="사각형"
            />
            <ActionButton
              active={action === ACTIONS.CIRCLE}
              onClick={() => setAction(ACTIONS.CIRCLE)}
              label="원"
            />
            <ActionButton
              active={action === ACTIONS.ARROW}
              onClick={() => setAction(ACTIONS.ARROW)}
              label="화살표"
            />
            <ActionButton
              active={action === ACTIONS.PENCIL}
              onClick={() => setAction(ACTIONS.PENCIL)}
              label="펜"
            />
            <ActionButton
              active={action === ACTIONS.ERASER}
              onClick={() => setAction(ACTIONS.ERASER)}
              label="지우개"
            />
            <ActionButton onClick={removeShape} label="샥제" />
            <ColorPicker color={fillColor} onChange={handleFillColorChange} />
            <ColorPicker
              color={strokeColor}
              onChange={handleStrokeColorChange}
            />
            <ActionButton onClick={exportCanvasAsImage} label="다운로드" />
            <ActionButton onClick={exportCanvasAsJSON} label="JSON" />
            <ActionButton
              active={action === ACTIONS.IMAGE}
              onClick={addImage}
              label="사진 추가 "
            />
          </div>
        </div>
        {/* Canvas */}
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={() => {
            if (action === ACTIONS.SELECT) startSelection();
            else handlePointerDown();
          }}
          onPointerMove={() => {
            if (action === ACTIONS.SELECT) updateSelection();
            else handlePointerMove();
          }}
          onPointerUp={() => {
            if (action === ACTIONS.SELECT) endSelection();
            else handlePointerUp();
          }}
        >
          <BackgroundLayer id="_bgLayer" onPointerDown={clearSelection} />
          <Layer id="_shapeLayer">
            {ShapesRenderer({ isDraggable, handleClickShape })}
          </Layer>
          <Layer id="_drawLayer">{DrawingRenderer()}</Layer>
          <Layer id="_selectLayer">
            <SelectionBox />
            <Transformer
              ref={(node) => {
                transformerRef.current = node;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </>
  );
};
export default Canvas;

const ColorPicker = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <button>
    <input className="w-6 h-6" type="color" value={color} onChange={onChange} />
  </button>
);

const BackgroundLayer = (props: {
  onPointerDown: (e: Konva.KonvaEventObject<PointerEvent>) => void;
  [key: string]: unknown;
}) => {
  const { onPointerDown, ...restProps } = props;
  return (
    <Layer {...restProps}>
      <Rect
        id="bg"
        x={0}
        fill="white"
        y={0}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={onPointerDown}
      />
    </Layer>
  );
};

const ActionButton = ({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    className={`text-black
      ${
        active
          ? "p-1 bg-blue-300 rounded"
          : "p-1 hover:bg-blue-500 bg-blue-100 rounded"
      }`}
    onClick={onClick}
  >
    {label}
  </button>
);
