"use client";

import Konva from "konva";
import { nanoid } from "nanoid";
import { ChangeEvent, useRef, useState } from "react";
import type { Vector2d } from "konva/lib/types";
import {
  Arrow,
  Circle,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer,
} from "react-konva";
import useSelect from "../hooks/useSelect";

const ACTIONS = {
  SELECT: "SELECT",
  RECTANGLE: "RECTANGLE",
  CIRCLE: "CIRCLE",
  PENCIL: "PENCIL",
  ERASER: "ERASER",
  ARROW: "ARROW",
};

interface StagedNode extends Konva.ShapeConfig {
  type?: "rectangle" | "circle" | "pencil" | "eraser" | "arrow";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrs: any;
}
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const Canvas = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const stage = stageRef.current;
  const {
    selectNodeById,
    clearSelection,
    getSingleSelectedNode,
    getAllSelectedNodes,
    startSelection,
    updateSelection,
    endSelection,
    SelectionBox,
  } = useSelect(stageRef, transformerRef);

  const [action, setAction] = useState(ACTIONS.SELECT);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [strokeColor, setStrokeColor] = useState<string>("#000000");
  const [stagedNode, setStagedNode] = useState<StagedNode[]>([]);

  const isPointerDown = useRef(false);
  const currentShapeId = useRef<string | null>(null);
  const isDraggable = action === ACTIONS.SELECT;

  function handlePointerDown() {
    if (!stage) return;

    const { x, y } = stage.getPointerPosition() as Vector2d;
    const id = nanoid();
    const name = "shape";
    currentShapeId.current = id;
    isPointerDown.current = true;

    switch (action) {
      case ACTIONS.RECTANGLE:
        setStagedNode((rectangles) => [
          ...rectangles,
          {
            type: "rectangle",
            attrs: {
              id,
              name,
              x,
              y,
              width: 0,
              height: 0,
              fill: fillColor,
              stroke: strokeColor,
            },
          },
        ]);
        break;
      case ACTIONS.CIRCLE:
        setStagedNode((circles) => [
          ...circles,
          {
            type: "circle",
            attrs: {
              id,
              name,
              x,
              y,
              width: 0,
              height: 0,
              fill: fillColor,
              stroke: strokeColor,
            },
          },
        ]);
        break;
      case ACTIONS.ARROW:
        setStagedNode((arrows) => [
          ...arrows,
          {
            type: "arrow",
            attrs: {
              id,
              name,
              points: [x, y],
              fill: fillColor,
              stroke: strokeColor,
            },
          },
        ]);
        break;
      // TODO. PENCIL과 ERASER를 handlerPointerDown에서 분리해야함.
      case ACTIONS.PENCIL:
        setStagedNode((pencil) => [
          ...pencil,
          {
            type: "pencil",
            attrs: {
              id,
              points: [x, y],
              fill: fillColor,
              stroke: strokeColor,
              globalCompositeOperation: "source-over",
            },
          },
        ]);
        break;
      case ACTIONS.ERASER:
        setStagedNode((eraser) => [
          ...eraser,
          {
            type: "eraser",
            attrs: {
              id,
              points: [x, y],
              fill: fillColor,
              stroke: strokeColor,
              globalCompositeOperation: "destination-out",
            },
          },
        ]);
        break;
    }
  }
  function handlePointerMove() {
    if (!isPointerDown.current) return;
    if (!stage) return;
    const { x, y } = stage.getPointerPosition() as Vector2d;

    switch (action) {
      case ACTIONS.RECTANGLE:
        setStagedNode((node) =>
          node.map((node) => {
            if (node.attrs.id === currentShapeId.current) {
              return {
                ...node,
                attrs: {
                  ...node.attrs,
                  width: x - node.attrs.x,
                  height: y - node.attrs.y,
                },
              };
            }
            return node;
          })
        );
        break;
      case ACTIONS.CIRCLE:
        setStagedNode((circles) =>
          circles.map((circle) => {
            if (circle.attrs.id === currentShapeId.current) {
              return {
                ...circle,
                attrs: {
                  ...circle.attrs,
                  radius:
                    ((y - circle.attrs.y) ** 2 + (x - circle.attrs.x) ** 2) **
                    0.5,
                },
              };
            }
            return circle;
          })
        );
        break;
      case ACTIONS.ARROW:
        setStagedNode((nodes) =>
          nodes.map((arrow) => {
            if (arrow.attrs.id === currentShapeId.current) {
              return {
                ...arrow,
                attrs: {
                  ...arrow.attrs,
                  points: [arrow.attrs.points[0], arrow.attrs.points[1], x, y],
                },
              };
            }
            return arrow;
          })
        );
        break;
      case ACTIONS.PENCIL:
        setStagedNode((nodes) =>
          nodes.map((line) => {
            if (line.attrs.id === currentShapeId.current) {
              return {
                ...line,
                attrs: {
                  ...line.attrs,
                  points: [...line.attrs.points, x, y],
                },
              };
            }
            return line;
          })
        );
        break;
      case ACTIONS.ERASER:
        setStagedNode((nodes) =>
          nodes.map((line) => {
            if (line.attrs.id === currentShapeId.current) {
              return {
                ...line,
                attrs: {
                  ...line.attrs,
                  points: [...line.attrs.points, x, y],
                },
              };
            }
            return line;
          })
        );
        break;
    }
  }

  function handlePointerUp() {
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
  }

  function exportCanvasAsImage() {
    if (!stage) return;
    const uri = stage.toDataURL();
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    link.click();
    document.body.appendChild(link);
    document.body.removeChild(link);
  }

  const handleClickShape = (e: Konva.KonvaPointerEvent) => {
    if (action === ACTIONS.PENCIL || action === ACTIONS.ERASER) return;
    selectNodeById(e.target.attrs.id);
  };

  const removeShape = () => {
    const selected = getAllSelectedNodes();
    if (!selected) return;

    const removeIds = selected.map((node) => node.attrs.id);
    setStagedNode((nodes: StagedNode[]) =>
      nodes.filter((node: StagedNode) => !removeIds.includes(node.attrs.id))
    );
    clearSelection();
  };

  const handleFillColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedNode = getSingleSelectedNode() as Konva.Node;
    if (selectedNode) {
      setStagedNode((stagedNode) =>
        stagedNode.map((node) => {
          const id = node.attrs.id;
          return id === selectedNode.attrs.id
            ? { ...node, attrs: { ...node.attrs, fill: e.target.value } }
            : node;
        })
      );
    }
    setFillColor(e.target.value);
  };

  const handleStrokeColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedNode = getSingleSelectedNode() as Konva.Node;
    if (selectedNode) {
      setStagedNode((stagedNode) =>
        stagedNode.map((node) => {
          const id = node.attrs.id;
          return id === selectedNode.attrs.id
            ? { ...node, attrs: { ...node.attrs, stroke: e.target.value } }
            : node;
        })
      );
    }
    setStrokeColor(e.target.value);
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
          <Layer>
            <Rect
              id="bg"
              x={0}
              fill="white"
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onPointerDown={clearSelection}
            />
          </Layer>
          <Layer>
            {stagedNode.map((node, index) => {
              switch (node.type) {
                case "rectangle":
                  return (
                    <Rect
                      key={index}
                      strokeWidth={2}
                      draggable={isDraggable}
                      strokeScaleEnabled={false}
                      onPointerDown={handleClickShape}
                      {...node.attrs}
                    />
                  );
                case "circle":
                  return (
                    <Circle
                      key={index}
                      draggable={isDraggable}
                      strokeScaleEnabled={false}
                      onPointerDown={handleClickShape}
                      {...node.attrs}
                    />
                  );
                case "arrow":
                  return (
                    <Arrow
                      key={index}
                      strokeWidth={2}
                      draggable={isDraggable}
                      strokeScaleEnabled={false}
                      onPointerDown={handleClickShape}
                      {...node.attrs}
                    />
                  );
              }
            })}
            <SelectionBox />
            <Transformer ref={transformerRef} />
          </Layer>
          <Layer>
            {stagedNode.map((node, index) => {
              switch (node.type) {
                case "pencil":
                case "eraser":
                  return (
                    <Line
                      key={index}
                      lineCap="round"
                      lineJoin="round"
                      strokeWidth={2}
                      tension={0.5}
                      {...node.attrs}
                    />
                  );
              }
            })}
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
