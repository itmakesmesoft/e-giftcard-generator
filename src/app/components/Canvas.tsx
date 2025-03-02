"use client";

import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { nanoid } from "nanoid";
import { ChangeEvent, useRef, useState } from "react";
import {
  Arrow,
  Circle,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer,
} from "react-konva";

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

const Canvas = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const selectionRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stage = stageRef.current;
  const transformer = transformerRef.current;

  const [stagedNode, setStagedNode] = useState<StagedNode[]>([]);
  const [action, setAction] = useState(ACTIONS.SELECT);
  const [fillColor, setFillColor] = useState("#ff0000");
  const [strokeColor, setStrokeColor] = useState<string>("#000");

  const isPaining = useRef(false);
  const currentShapeId = useRef("");
  const isDraggable = action === ACTIONS.SELECT;

  function onPointerDown() {
    if (transformer && transformer.getNodes().length > 0) return;
    if (!stage) return;
    clearShapeClick();
    const { x, y } = stage.getPointerPosition() as Vector2d;
    const id = nanoid();
    currentShapeId.current = id;
    isPaining.current = true;
    const name = "shape";

    switch (action) {
      case ACTIONS.SELECT:
        const select = selectionRef.current;
        select?.setAttrs({
          x,
          y,
          width: 0,
          height: 0,
        });
        break;
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
  function onPointerMove() {
    if (!isPaining.current) return;
    if (!stage) return;
    const { x, y } = stage.getPointerPosition() as Vector2d;

    switch (action) {
      case ACTIONS.SELECT:
        const select = selectionRef.current;
        select?.setAttrs({
          visible: true,
          width: x - select.attrs.x,
          height: y - select.attrs.y,
        });
        break;
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

  function onPointerUp() {
    isPaining.current = false;
    const select = selectionRef.current;
    if (select && select.visible()) {
      select?.setAttrs({
        visible: false,
      });
      const staged = stage?.find(".shape");
      const draggedArea = select.getClientRect();
      const selected =
        staged?.filter((node) =>
          Konva.Util.haveIntersection(draggedArea, node.getClientRect())
        ) || [];
      transformer?.nodes([...selected]);
    }
  }

  function handleExport() {
    if (!stage) return;
    const uri = stage.toDataURL();
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleShapeClick(e: Konva.KonvaPointerEvent) {
    if (!transformer) return;
    const target = e.currentTarget;
    const selected = transformer.getNodes();
    if (selected.includes(target)) return;
    if (action === ACTIONS.PENCIL || action === ACTIONS.ERASER) return;
    if (action !== ACTIONS.SELECT) {
      setAction(ACTIONS.SELECT);
      e.cancelBubble = true;
    }
    transformer.nodes([target]);
  }

  const clearShapeClick = () => {
    transformer?.nodes([]);
  };

  const handleChangeFillColor = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedNode = transformer?.getNode() as StagedNode | undefined;
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

  const handleChangeStrokeColor = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedNode = transformer?.getNode() as StagedNode | undefined;
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
            <button
              className={
                action === ACTIONS.SELECT
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.SELECT)}
            >
              커서
            </button>
            <button
              className={
                action === ACTIONS.RECTANGLE
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.RECTANGLE)}
            >
              사각형
            </button>
            <button
              className={
                action === ACTIONS.CIRCLE
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.CIRCLE)}
            >
              원
            </button>
            <button
              className={
                action === ACTIONS.ARROW
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.ARROW)}
            >
              화살표
            </button>
            <button
              className={
                action === ACTIONS.PENCIL
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.PENCIL)}
            >
              펜
            </button>
            <button
              className={
                action === ACTIONS.ERASER
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.ERASER)}
            >
              지우개
            </button>
            <button>
              <input
                className="w-6 h-6"
                type="color"
                value={fillColor}
                onChange={handleChangeFillColor}
              />
            </button>
            <button>
              <input
                className="w-6 h-6"
                type="color"
                value={strokeColor}
                onChange={handleChangeStrokeColor}
              />
            </button>

            <button onClick={handleExport}>다운로드</button>
          </div>
        </div>
        {/* Canvas */}
        <Stage
          ref={stageRef}
          width={1000}
          height={600}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <Layer>
            <Rect
              id="bg"
              x={0}
              y={0}
              height={600}
              width={1000}
              fill="white"
              onPointerDown={clearShapeClick}
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
                      onPointerDown={handleShapeClick}
                      {...node.attrs}
                    />
                  );
                case "circle":
                  return (
                    <Circle
                      key={index}
                      draggable={isDraggable}
                      strokeScaleEnabled={false}
                      onPointerDown={handleShapeClick}
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
                      onPointerDown={handleShapeClick}
                      {...node.attrs}
                    />
                  );
              }
            })}
            {/* 드래그 선택을 위한 도형 */}
            <Rect
              ref={selectionRef}
              fill="rgba(0,0,255,0.5)"
              visible={false}
              listening={false}
            />
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
