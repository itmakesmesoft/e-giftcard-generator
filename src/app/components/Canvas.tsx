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
  Image as ImageComponent,
  Transformer,
} from "react-konva";
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
  const { shapes, setShapes, createShape, updateShape } = useShapes();

  const isPointerDown = useRef(false);
  const currentShapeId = useRef<string | null>(null);
  const isDraggable = action === ACTIONS.SELECT;

  function handlePointerDown() {
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
  }

  function handlePointerMove() {
    if (!isPointerDown.current) return;
    if (!stageRef.current) return;
    const { x, y } = stageRef.current.getPointerPosition() as Vector2d;
    if (!currentShapeId.current) return;

    switch (action) {
      case ACTIONS.IMAGE:
      case ACTIONS.RECTANGLE:
        updateShape((shape) => {
          if (shape.id === currentShapeId.current) {
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
          if (shape.id === currentShapeId.current) {
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
          if (shape.id === currentShapeId.current) {
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
          if (shape.id === currentShapeId.current) {
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
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
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
            {shapes.map((node, index) => {
              switch (node.type) {
                case "rectangle":
                  return (
                    <Rect
                      key={index}
                      strokeWidth={2}
                      draggable={isDraggable}
                      strokeScaleEnabled={false}
                      onPointerDown={handleClickShape}
                      {...node}
                    />
                  );
                case "circle":
                  return (
                    <Circle
                      key={index}
                      draggable={isDraggable}
                      strokeScaleEnabled={false}
                      onPointerDown={handleClickShape}
                      {...node}
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
                      points={node.points}
                      {...node}
                    />
                  );
                case "image":
                  return (
                    <ImageComponent
                      key={index}
                      alt="이미지"
                      image={node.image}
                      draggable={isDraggable}
                      onPointerDown={handleClickShape}
                      {...node}
                    />
                  );
              }
            })}
            <SelectionBox />
            <Transformer ref={transformerRef} />
          </Layer>
          <Layer>
            {shapes.map((node, index) => {
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
                      {...node}
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
