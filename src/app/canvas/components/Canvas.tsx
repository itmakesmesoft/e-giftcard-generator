"use client";

import Konva from "konva";
import { ChangeEvent, useRef } from "react";
import type { Vector2d } from "konva/lib/types";
import { CanvasProvider } from "@/app/context/canvas";
import { Layer, Stage, Transformer } from "react-konva";
import { useSelect, useControl, useShapes } from "@/app/hooks";
import { Slider, Button, ColorPicker, BackgroundLayer } from "./index";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const WrapperCanvas = () => (
  <CanvasProvider>
    <Canvas />
  </CanvasProvider>
);

export default WrapperCanvas;

const Canvas = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const isPointerDown = useRef(false);
  const stage = stageRef.current;

  const {
    selectNodeById,
    clearSelectNodes,
    getAllSelectedNodes,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    SelectionBox,
  } = useSelect(stageRef, transformerRef);
  const {
    action,
    fill,
    stroke,
    strokeWidth,
    setAction,
    setFill,
    setStroke,
    setStrokeWidth,
  } = useControl();
  const {
    shapes,
    setShapes,
    createShape,
    updateShape,
    updateCurrentShape,
    endCreateShape,
    renderLayer,
  } = useShapes();

  const onFillChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFill(e.target.value);
    updateSelectedShapeAttributes({ fill: e.target.value });
  };

  const onStrokeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStroke(e.target.value);
    updateSelectedShapeAttributes({ stroke: e.target.value });
  };

  const onStrokeWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const strokeWidth = Number(e.target.value);
    setStrokeWidth(strokeWidth);
    updateSelectedShapeAttributes({ strokeWidth });
  };

  const onPointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (action === "select") startSelectionBox(e);
    else startShapeCreation();
  };

  const onPointerMove = () => {
    if (action === "select") updateSelectionBox();
    else updateShapeCreation();
  };

  const onPointerUp = () => {
    if (action === "select") endSelectionBox();
    else completeShapeCreation();
  };

  const addImage = () => {
    setAction("image");
  };

  const exportCanvasAsImage = () => {
    if (!stage) return;
    const uri = stage.toDataURL();
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    link.click();
  };

  const exportCanvasAsJSON = () => {
    if (!stage) return;
    const children = stage.getChildren();
    const extractIds = ["_shapeLayer", "_drawLayer"];

    const json = children
      .filter((layer) => {
        const id = layer.attrs.id;
        extractIds.includes(id);
      })
      .map((layer) => layer.children)
      .flat();
    return json;
  };

  const loadCanvasByJSON = (data: string) => {
    if (!stage) return;
    const shapes = JSON.parse(data)?.map((item: string) =>
      JSON.parse(item)
    ) as Konva.Layer[];

    setShapes(shapes.map(({ attrs }) => attrs));
  };

  const saveToLocalStorage = () => {
    try {
      const dataAsjson = exportCanvasAsJSON();
      window.localStorage.setItem("autoSaved", JSON.stringify(dataAsjson));
      return true;
    } catch (err) {
      throw err;
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const dataAsString = window.localStorage.getItem("autoSaved");
      if (dataAsString) {
        loadCanvasByJSON(dataAsString);
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const updateSelectedShapeAttributes = (newAttrs: Konva.ShapeConfig) => {
    const selectedNodes = getAllSelectedNodes();
    const ids = selectedNodes.map((node) => node.attrs.id);
    updateShapeAttributes(ids, newAttrs);
  };

  const updateShapeAttributes = (
    ids: string[],
    newAttrs: Konva.ShapeConfig
  ) => {
    if (ids.length > 0) {
      updateShape((shape) => {
        const shapeId = shape.id;
        return shapeId && ids.includes(shapeId)
          ? { ...shape, ...newAttrs }
          : shape;
      });
    }
  };

  const startShapeCreation = () => {
    if (!stage) return;
    const { x, y } = stage.getPointerPosition() as Vector2d;

    isPointerDown.current = true;
    const hasPoints = ["pencil", "eraser", "arrow"].includes(action);

    createShape({
      type: action,
      fill,
      stroke,
      strokeWidth,
      ...(hasPoints ? { points: [x, y] } : { x, y }),
    });
  };

  const updateShapeCreation = () => {
    if (!isPointerDown.current || !stage) return;

    const { x, y } = stage.getPointerPosition() as Vector2d;

    switch (action) {
      case "image":
      case "rectangle":
        updateCurrentShape((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;
          return {
            ...shape,
            width: x - dx,
            height: y - dy,
          };
        });
        break;
      case "circle":
        updateCurrentShape((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;
          return {
            ...shape,
            radius: ((y - dy) ** 2 + (x - dx) ** 2) ** 0.5,
          };
        });
        break;
      case "arrow":
        updateCurrentShape((shape) => {
          const initialPoints = shape.points.slice(0, 2) ?? [x, y];
          return {
            ...shape,
            points: [...initialPoints, x, y],
          };
        });
        break;
      case "eraser":
      case "pencil":
        updateCurrentShape((shape) => {
          const prevPoints = shape.points ?? [];
          return {
            ...shape,
            points: [...prevPoints, x, y],
          };
        });
        break;
    }
  };

  const completeShapeCreation = () => {
    if (action !== "select" && action !== "pencil" && action !== "eraser") {
      const id = endCreateShape();
      selectNodeById(id);
      setAction("select");
    }
    isPointerDown.current = false;
  };

  const removeShapeOnCanvas = () => {
    const selected = getAllSelectedNodes();
    if (!selected) return;

    const removeIds = selected.map((node) => node.attrs.id);
    const filtered = shapes.filter((shape) => !removeIds.includes(shape.id));
    setShapes(filtered);
    clearSelectNodes();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Controls */}
      <div className="absolute top-0 z-10 w-full py-2 ">
        <div className="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg">
          <Button
            active={action === "select"}
            onClick={() => setAction("select")}
            label="커서"
          />
          <Button
            active={action === "rectangle"}
            onClick={() => setAction("rectangle")}
            label="사각형"
          />
          <Button
            active={action === "circle"}
            onClick={() => setAction("circle")}
            label="원"
          />
          <Button
            active={action === "arrow"}
            onClick={() => setAction("arrow")}
            label="화살표"
          />
          <Button
            active={action === "pencil"}
            onClick={() => setAction("pencil")}
            label="펜"
          />
          <Button
            active={action === "eraser"}
            onClick={() => setAction("eraser")}
            label="지우개"
          />
          <Button onClick={removeShapeOnCanvas} label="샥제" />
          <ColorPicker color={fill} onChange={onFillChange} />
          <ColorPicker color={stroke} onChange={onStrokeChange} />
          <Button onClick={exportCanvasAsImage} label="다운로드" />
          <Button onClick={saveToLocalStorage} label="저장" />
          <Button onClick={loadFromLocalStorage} label="불러오기" />
          <Button
            active={action === "image"}
            onClick={addImage}
            label="사진 추가 "
          />
          <Slider
            min={1}
            max={50}
            value={strokeWidth}
            onChange={onStrokeWidthChange}
          />
        </div>
      </div>
      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <BackgroundLayer
          id="_bgLayer"
          onPointerDown={clearSelectNodes}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />
        <Layer id="_shapeLayer">
          {renderLayer.shapes({
            isDraggable: action === "select",
          })}
        </Layer>
        <Layer id="_drawLayer">{renderLayer.drawing()}</Layer>
        <Layer id="_selectLayer">
          <SelectionBox />
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </div>
  );
};
