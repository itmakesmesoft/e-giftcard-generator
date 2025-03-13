import { useControlStore, useShapeStore } from "@/app/store/canvas";
import Menubar from "./ui/Menubar";
import {
  readCodeByImage,
  convertBarcodeFormat,
  saveToLocalStorage,
  loadFromLocalStorage,
} from "@/utils";
import Konva from "konva";
import { useCanvasContext } from "@/app/context/canvas";
import { ChangeEvent } from "react";
import { generateShapeConfig } from "@/utils/canvas";
import Input from "./ui/Input";
import {
  ArrowTopLeftIcon,
  CircleIcon,
  CursorArrowIcon,
  EraserIcon,
  FrameIcon,
  ImageIcon,
  MixIcon,
  Pencil1Icon,
  ResetIcon,
  SquareIcon,
  TextIcon,
} from "@radix-ui/react-icons";
import QrIcon from "./ui/QrIcon";

const Sidebar = ({ className }: { className: string }) => {
  const { stageRef, canvasSize, setCanvasSize } = useCanvasContext();

  const fill = useControlStore((state) => state.fill);
  const stroke = useControlStore((state) => state.stroke);
  const action = useControlStore((state) => state.action);
  const setAction = useControlStore((state) => state.setAction);
  // const { action, setAction, getAttributes } = useControl();

  const redo = useShapeStore((state) => state.redo);
  const undo = useShapeStore((state) => state.undo);
  const setShapes = useShapeStore((state) => state.setShapes);

  const decodeFromImage = async (image: string | ArrayBuffer | null) => {
    if (!image) return;
    const data = await readCodeByImage(image as string);
    if (!data) return;

    const format = convertBarcodeFormat(data.format);
    const newShape = generateShapeConfig({
      type: "barcode",
      text: data.value,
      codeFormat: format,
      // fill: getAttributes.fill,
      // stroke: getAttributes.stroke,
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
    const key = "autoSaved";
    saveToLocalStorage(key, exportedData);
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
    const key = "autoSaved";
    const loadedData = loadFromLocalStorage(key);
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
    <Menubar className={`flex flex-col gap-1 items-center ${className}`}>
      <Menubar.MenuInputFileItem
        accept="image/*"
        onValueChange={handleAddBarcode}
        icon={
          <QrIcon width="24" height="24" className="group-hover:text-red-600" />
        }
      />
      <Menubar.Separator className="w-full my-2 border-b border-black" />
      <Menubar.MenuItem
        onClick={() => setAction("select")}
        label="커서"
        active={action === "select"}
        icon={
          <CursorArrowIcon color={action === "select" ? "blue" : "black"} />
        }
      />
      <Menubar.MenuItem
        onClick={() => setAction("pencil")}
        label="펜"
        active={action === "pencil"}
        icon={<Pencil1Icon color={action === "pencil" ? "blue" : "black"} />}
      />
      <Menubar.MenuItem
        onClick={() => setAction("eraser")}
        label="지우개"
        active={action === "eraser"}
        icon={<EraserIcon color={action === "eraser" ? "blue" : "black"} />}
      />
      <Menubar.MenuGroup
        label="도형"
        className="text-black"
        onClick={() => setAction("rectangle")}
        icon={
          <MixIcon
            color={
              action === "rectangle" ||
              action === "circle" ||
              action === "arrow"
                ? "blue"
                : "black"
            }
          />
        }
      >
        <Menubar.MenuGroupItem
          onClick={() => setAction("rectangle")}
          icon={
            <SquareIcon color={action === "rectangle" ? "blue" : "black"} />
          }
        >
          사각형
        </Menubar.MenuGroupItem>
        <Menubar.MenuGroupItem
          onClick={() => setAction("circle")}
          icon={<CircleIcon color={action === "circle" ? "blue" : "black"} />}
        >
          원
        </Menubar.MenuGroupItem>
        <Menubar.MenuGroupItem
          onClick={() => setAction("arrow")}
          icon={
            <ArrowTopLeftIcon color={action === "arrow" ? "blue" : "black"} />
          }
        >
          화살표
        </Menubar.MenuGroupItem>
      </Menubar.MenuGroup>
      <Menubar.MenuItem
        onClick={() => setAction("text")}
        label="글자"
        active={action === "text"}
        icon={<TextIcon color={action === "text" ? "blue" : "black"} />}
      />
      <Menubar.MenuInputFileItem
        accept="image/*"
        onChange={handleAddImage}
        icon={<ImageIcon />}
      />
      <Menubar.MenuGroup label="Frame" icon={<FrameIcon />}>
        <p>프레임 크기 조절</p>
        <Menubar.MenuGroupItem asChild>
          <Menubar.Menu>
            <>
              <Input
                value={canvasSize.width}
                onValueChange={(e) =>
                  setCanvasSize({
                    ...canvasSize,
                    width: Number(e.target.value),
                  })
                }
                className="h-5 bg-white"
                label="W"
              />
              <Input
                value={canvasSize.height}
                onValueChange={(e) =>
                  setCanvasSize({
                    ...canvasSize,
                    height: Number(e.target.value),
                  })
                }
                className="h-5 bg-white"
                label="H"
              />
            </>
          </Menubar.Menu>
        </Menubar.MenuGroupItem>
      </Menubar.MenuGroup>
      <Menubar.Separator className="w-full my-2 border-b border-black" />
      <Menubar.MenuItem onClick={undo} label="뒤로" icon={<ResetIcon />} />
      <Menubar.MenuItem
        onClick={redo}
        label="앞으로"
        icon={<ResetIcon className="rotate-180" />}
      />
      {/* <Button onClick={handleExportAsImage} label="다운로드" />
      <Button onClick={handleSaveCanvas} label="저장" />
      <Button onClick={handleLoadCanvas} label="불러오기" /> */}
    </Menubar>
  );
};

export default Sidebar;
