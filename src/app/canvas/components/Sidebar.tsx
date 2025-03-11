import { useControlStore, useShapeStore } from "@/app/store/canvas";
import Menubar from "./primitives/Menubar";
import {
  readCodeByImage,
  convertBarcodeFormat,
  saveToLocalStorage,
  loadFromLocalStorage,
} from "@/utils";
import Konva from "konva";
import { useCanvasContext } from "@/app/context/canvas";
import Button from "./primitives/Button";
import { ChangeEvent } from "react";
import { generateShapeConfig } from "@/utils/canvas";

const Sidebar = ({ className }: { className: string }) => {
  const { stageRef } = useCanvasContext();

  const fill = useControlStore((state) => state.fill);
  const stroke = useControlStore((state) => state.stroke);

  const redo = useShapeStore((state) => state.redo);
  const undo = useShapeStore((state) => state.undo);
  const setShapes = useShapeStore((state) => state.setShapes);
  const setAction = useControlStore((state) => state.setAction);

  const decodeFromImage = async (image: string | ArrayBuffer | null) => {
    if (!image) return;
    const data = await readCodeByImage(image as string);
    if (!data) return;

    const format = convertBarcodeFormat(data.format);
    const newShape = generateShapeConfig({
      type: "barcode",
      text: data.value,
      codeFormat: format,
      fill,
      stroke,
    });
    setShapes((shapes) => [...shapes, newShape]);
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

    setShapes(data.map(({ attrs }) => attrs));
  };

  const loadFileFromLocal = (
    e: ChangeEvent<HTMLInputElement>,
    callback: (result: string | null) => unknown
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result as string | null);
  };

  const handleAddBarcode = (e: ChangeEvent<HTMLInputElement>) => {
    loadFileFromLocal(e, (file) => decodeFromImage(file));
  };

  const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
    loadFileFromLocal(e, (file) => {
      if (!file) return;
      const newShape = generateShapeConfig({
        type: "image",
        dataURL: file,
        isDrawing: false,
      });
      setShapes((shapes) => [...shapes, newShape]);
    });
  };

  return (
    <Menubar className={`flex flex-col items-center ${className}`}>
      <Menubar.Item
        // active={action === "select"}
        onClick={() => setAction("select")}
        label="커서"
      />
      <Menubar.MenuGroup label="도형">
        <Menubar.MenuGroupItem
          // active={action === "rectangle"}
          onClick={() => setAction("rectangle")}
          label="사각형"
        />
        <Menubar.MenuGroupItem
          // active={action === "circle"}
          onClick={() => setAction("circle")}
          label="원"
        />
        <Menubar.MenuGroupItem
          // active={action === "arrow"}
          onClick={() => setAction("arrow")}
          label="화살표"
        />
      </Menubar.MenuGroup>
      <Menubar.Item
        // active={action === "pencil"}
        onClick={() => setAction("pencil")}
        label="펜"
      />
      <Menubar.Item
        // active={action === "eraser"}
        onClick={() => setAction("eraser")}
        label="지우개"
      />
      <Menubar.Item
        // active={action === "text"}
        onClick={() => setAction("text")}
        label="글자"
      />
      <Menubar.Item
        // active={action === "text"}
        onClick={undo}
        label="뒤로"
      />
      <Menubar.Item
        // active={action === "text"}
        onClick={redo}
        label="앞으로"
      />
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
    </Menubar>
  );
};

export default Sidebar;
