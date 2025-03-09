/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Konva from "konva";
import { ChangeEvent, useEffect, useRef } from "react";
import type { Vector2d } from "konva/lib/types";
import { CanvasProvider, useCanvasContext } from "@/app/context/canvas";
import { Layer, Stage, Transformer } from "react-konva";
import { useSelect, useControl, useShapes } from "@/app/hooks";
import { Slider, Button, Select, ColorPicker, BackgroundLayer } from "./index";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  readCodeByImage,
  convertBarcodeFormat,
} from "@/utils";

const WrapperCanvas = () => (
  <CanvasProvider>
    <Canvas />
  </CanvasProvider>
);

export default WrapperCanvas;

const Canvas = () => {
  const { stageRef, transformerRef, canvasSize } = useCanvasContext();
  const isPointerDown = useRef(false);

  const {
    selectNodeById,
    clearSelectNodes,
    getAllSelectedNodes,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    SelectionBox,
  } = useSelect();
  const {
    action,
    fill,
    stroke,
    strokeWidth,
    fontSize,
    setAction,
    setFill,
    setStroke,
    setStrokeWidth,
    setFontSize,
  } = useControl();
  const {
    shapes,
    setShapes,
    createShape,
    startShapeCreation,
    updateShape,
    updateShapeCreation,
    completeShapeCreation,
    renderLayer,
    redo,
    undo,
  } = useShapes();

  useEffect(() => {
    if (!stageRef.current) return;
    if (action === "select") {
      stageRef.current.container().style.cursor = "default";
    } else if (action === "pencil" || action === "eraser") {
      stageRef.current.container().style.cursor = "default";
    } else {
      stageRef.current.container().style.cursor = "crosshair";
    }
  }, [action, stageRef]);

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

  const onFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setFontSize(size);
    updateSelectedShapeAttributes({ fontSize: size });
  };

  const onPointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (action === "select") startSelectionBox(e);
    else handleCreateShapeStart();
  };

  const onPointerMove = () => {
    if (action === "select") updateSelectionBox();
    else handleCreateShapeUpdate();
  };

  const onPointerUp = () => {
    if (action === "select") endSelectionBox();
    else handleCreateShapeComplete();
  };

  const handleAddBarcode = (e: ChangeEvent<HTMLInputElement>) => {
    loadFileFromLocal(e, (file) => decodeFromImage(file));
  };

  const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
    loadFileFromLocal(e, (file) => {
      if (!file) return;
      createShape({
        type: "image",
        dataURL: file,
      });
    });
  };

  const loadFileFromLocal = (
    e: ChangeEvent<HTMLInputElement>,
    callback: (result: string | null) => any
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result as string | null);
  };

  const decodeFromImage = async (image: string | ArrayBuffer | null) => {
    if (!image) return;
    const data = await readCodeByImage(image as string);
    if (!data) return;

    const format = convertBarcodeFormat(data.format);
    createShape({
      type: "barcode",
      text: data.value,
      codeFormat: format,
      fill,
      stroke,
    });
  };

  const handleExportAsImage = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    link.click();
  };

  const handleSaveCanvas = () => {
    const exportedData = exportCanvasAsJSON();
    if (!exportedData) return;
    saveToLocalStorage(exportedData);
  };

  const exportCanvasAsJSON = () => {
    if (!stageRef.current) return;
    const children = stageRef.current.getChildren();
    const extractIds = ["_shapeLayer", "_drawLayer"];

    const json = children
      .filter((layer) => extractIds.includes(layer.attrs.id))
      .map((layer) => layer.children)
      .flat();

    return JSON.parse(JSON.stringify(json));
  };

  const handleLoadCanvas = () => {
    const loadedData = loadFromLocalStorage();
    loadCanvasByJSON(loadedData);
  };

  const loadCanvasByJSON = (data: Konva.Layer[]) => {
    if (!stageRef.current) return;

    setShapes({ shapes: data.map(({ attrs }) => attrs) });
  };

  const handleCreateShapeStart = () => {
    if (!stageRef.current) return;
    const { x, y } = stageRef.current.getPointerPosition() as Vector2d;

    isPointerDown.current = true;
    const hasPoints = ["pencil", "eraser", "arrow"].includes(action);

    startShapeCreation({
      type: action,
      fill,
      stroke,
      strokeWidth,
      fontSize,
      ...(hasPoints ? { points: [x, y] } : { x, y }),
    });
  };

  const handleCreateShapeUpdate = () => {
    if (!isPointerDown.current || !stageRef.current) return;

    const { x, y } = stageRef.current.getPointerPosition() as Vector2d;

    switch (action) {
      case "text":
      case "rectangle":
        updateShapeCreation((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;
          return {
            ...shape,
            width: Math.floor(x - dx),
            height: Math.floor(y - dy),
          };
        });
        break;
      case "circle":
        updateShapeCreation((shape) => {
          const dx = shape.x ?? 0;
          const dy = shape.y ?? 0;
          return {
            ...shape,
            radius: Math.floor((y - dy) ** 2 + (x - dx) ** 2) ** 0.5,
          };
        });
        break;
      case "arrow":
        updateShapeCreation((shape) => {
          const initialPoints = shape.points.slice(0, 2) ?? [x, y];
          return {
            ...shape,
            points: [...initialPoints, x, y],
          };
        });
        break;
      case "eraser":
      case "pencil":
        updateShapeCreation((shape) => {
          const prevPoints = shape.points ?? [];
          return {
            ...shape,
            points: [...prevPoints, x, y],
          };
        });
        break;
    }
  };

  const handleCreateShapeComplete = () => {
    isPointerDown.current = false;
    if (action === "select") return;

    const id = completeShapeCreation();
    if (action === "pencil" || action === "eraser") return;
    selectNodeById(id);
    setAction("select");
  };

  const removeShapeOnCanvas = () => {
    const selected = getAllSelectedNodes();
    const removeIds = selected.map((node) => node.attrs.id);
    const filtered = shapes.filter((shape) => !removeIds.includes(shape.id));
    setShapes({ shapes: filtered });
    clearSelectNodes();
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
          <Button
            active={action === "text"}
            onClick={() => setAction("text")}
            label="글자"
          />
          <Button onClick={removeShapeOnCanvas} label="샥제" />
          <ColorPicker color={fill} onChange={onFillChange} />
          <ColorPicker color={stroke} onChange={onStrokeChange} />
          <Button onClick={handleExportAsImage} label="다운로드" />
          <Button onClick={handleSaveCanvas} label="저장" />
          <Button onClick={handleLoadCanvas} label="불러오기" />
          <Button onClick={redo} label="이후으로" />
          <Button onClick={undo} label="이전으로" />
          <label className="cursor-pointer">
            <input
              type="file"
              onChange={handleAddBarcode}
              accept="image/*"
              className="hidden"
            />
            <span className="px-4 py-2 bg-blue-500 text-white rounded inline-block">
              바코드/QR 추가
            </span>
          </label>
          <label className="cursor-pointer">
            <input
              type="file"
              onChange={handleAddImage}
              accept="image/*"
              className="hidden"
            />
            <span className="px-4 py-2 bg-blue-500 text-white rounded inline-block">
              사진 추가
            </span>
          </label>
          <Slider
            min={1}
            max={50}
            value={strokeWidth}
            onChange={onStrokeWidthChange}
          />
          <Select
            options={[
              { label: "16", value: "16" },
              { label: "20", value: "20" },
            ]}
            label="폰트 사이즈"
            value={String(fontSize)}
            onChange={onFontSizeChange}
          />
        </div>
      </div>
      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <BackgroundLayer
          id="_bgLayer"
          onPointerDown={clearSelectNodes}
          width={canvasSize.width}
          height={canvasSize.height}
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
