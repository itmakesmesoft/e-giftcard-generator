import Menubar from "../../../components/Menubar";
import { useShapeStore } from "@/app/store/canvas";
import {
  readCodeByImage,
  convertBarcodeFormat,
  ReaderFormatType,
} from "@/utils";
import { useCanvasContext } from "@/app/context/canvas";
import { ChangeEvent } from "react";
import { generateShapeConfig } from "@/utils/canvas";
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
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";
import QrIcon from "../../../components/assets/QrIcon";
import { useControl, useSelect } from "@/app/hooks";
import Image from "next/image";
import NumberStepper from "../../../components/NumberStepper";
import BarcodeModal from "./BarcodeModal";
import FrameSize from "./FrameSize";

const LeftSidebar = ({ className }: { className: string }) => {
  const { clearSelectNodes } = useSelect();
  const { stageScale, setStageScale } = useCanvasContext();
  const { action, setAction, getAttributes } = useControl();

  const redo = useShapeStore((state) => state.redo);
  const undo = useShapeStore((state) => state.undo);
  const setShapes = useShapeStore((state) => state.setShapes);

  const handleSetSelect = () => {
    setAction("select");
    clearSelectNodes();
  };

  const handleSetPencil = () => {
    setAction("pencil");
    clearSelectNodes();
  };

  const handleSetEraser = () => {
    setAction("eraser");
    clearSelectNodes();
  };

  const handleSetRectangle = () => {
    setAction("rectangle");
    clearSelectNodes();
  };

  const handleSetCircle = () => {
    setAction("circle");
    clearSelectNodes();
  };

  const handleSetArrow = () => {
    setAction("arrow");
    clearSelectNodes();
  };

  const handleSetText = () => {
    setAction("text");
    clearSelectNodes();
  };

  const handleScaleChange = (value: number) => {
    const scale = value / 100;
    setStageScale(scale);
  };

  const handleAddBarcodeWithImage = (e: ChangeEvent<HTMLInputElement>) => {
    loadFileFromLocal(e, async (file) => {
      setAction("select");
      if (!file) return;

      const data = await readCodeByImage(file as string);
      if (!data) return;
      generateBarcodeConfig(data);
    });
  };
  const handleAddBarcodeWithURL = (data: {
    format: ReaderFormatType;
    value: string;
  }) => {
    generateBarcodeConfig(data);
    setAction("select");
  };

  const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
    loadFileFromLocal(e, (file) => {
      if (!file) return;

      const newShape = generateShapeConfig({
        type: "image",
        name: "shape",
        dataURL: file,
        isDrawing: false,
      });
      setShapes((shapes) => [...shapes, newShape]);
      setAction("select");
    });
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

  const generateBarcodeConfig = async (data: {
    format: ReaderFormatType;
    value: string;
  }) => {
    const format = convertBarcodeFormat(data.format);
    const newShape = generateShapeConfig({
      type: "barcode",
      name: "shape",
      code: data.value,
      codeFormat: format,
      fill: getAttributes.fill,
      stroke: getAttributes.stroke,
    });
    setShapes((shapes) => [...shapes, newShape]);
  };

  return (
    <Menubar className={`flex flex-col items-center ${className}`}>
      <Menubar.MenuGroup
        className="p-4 text-center w-[300px]"
        label="QR/바코드 추가"
        trigger={
          <div className="group p-2 pt-4 hover:bg-blue-500 cursor-pointer">
            <QrIcon width="30" height="30" className="group-hover:fill-white" />
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-sm overflow-hidden">
            <Image src="/example.png" width="300" height="300" alt="barcode" />
          </div>
          <p className="text-sm break-keep text-center">
            <strong className="font-semibold">
              QR 코드 또는 바코드가 포함된 사진
            </strong>
            을 선택하면 자동으로 캔버스에 추가됩니다.
          </p>
          <Menubar.MenuInputFileItem
            accept="image/*"
            onValueChange={handleAddBarcodeWithImage}
            className="py-2 h-auto rounded-sm !aspect-auto !bg-blue-400 !text-white hover:!bg-blue-500"
          >
            사진 불러오기
          </Menubar.MenuInputFileItem>
          <hr />
          <BarcodeModal
            trigger={
              <button className="py-2 w-full hover:bg-gray-500 active:bg-gray-600 hover:text-white cursor-pointer rounded-sm border border-gray-300">
                코드 또는 URL 입력
              </button>
            }
            onSubmit={handleAddBarcodeWithURL}
          />
        </div>
      </Menubar.MenuGroup>
      <Menubar.Separator />
      <Menubar.MenuItem
        onClick={handleSetSelect}
        label="커서"
        active={action === "select"}
        icon={<CursorArrowIcon width="18" height="18" />}
      />
      <Menubar.MenuItem
        onClick={handleSetPencil}
        label="펜"
        active={action === "pencil"}
        icon={<Pencil1Icon width="18" height="18" />}
      />
      <Menubar.MenuItem
        onClick={handleSetEraser}
        label="지우개"
        active={action === "eraser"}
        icon={<EraserIcon width="18" height="18" />}
      />
      <Menubar.MenuGroup
        label="도형"
        className="text-black"
        onClick={handleSetRectangle}
        trigger={
          <Menubar.MenuGroupTrigger icon={<MixIcon width="18" height="18" />} />
        }
      >
        <Menubar.MenuGroupItem
          onClick={handleSetRectangle}
          icon={<SquareIcon width="16" height="16" />}
        >
          사각형
        </Menubar.MenuGroupItem>
        <Menubar.MenuGroupItem
          onClick={handleSetCircle}
          icon={<CircleIcon width="16" height="16" />}
        >
          원
        </Menubar.MenuGroupItem>
        <Menubar.MenuGroupItem
          onClick={handleSetArrow}
          icon={<ArrowTopLeftIcon width="16" height="16" />}
        >
          화살표
        </Menubar.MenuGroupItem>
      </Menubar.MenuGroup>
      <Menubar.MenuItem
        onClick={handleSetText}
        label="글자"
        active={action === "text"}
        icon={<TextIcon width="18" height="18" />}
      />
      <Menubar.MenuInputFileItem
        accept="image/*"
        onChange={handleAddImage}
        label="이미지 추가"
      >
        <ImageIcon />
      </Menubar.MenuInputFileItem>
      <Menubar.MenuGroup
        label="Frame"
        className="p-2 text-center w-[220px]"
        trigger={
          <Menubar.MenuGroupTrigger
            icon={<FrameIcon width="18" height="18" />}
          />
        }
      >
        <FrameSize />
      </Menubar.MenuGroup>
      <Menubar.Separator />
      <Menubar.MenuItem
        onClick={undo}
        label="뒤로"
        icon={<ResetIcon width="18" height="18" />}
      />
      <Menubar.MenuItem
        onClick={redo}
        label="앞으로"
        icon={<ResetIcon className="rotate-180" width="18" height="18" />}
        className="pb-3"
      />
      <NumberStepper
        className="bg-white w-10 text-sm"
        value={stageScale * 100}
        onValueChange={handleScaleChange}
        align="column"
        unit="%"
        max={150}
        min={50}
        slotStart={
          <NumberStepper.IncreaseButton className="cursor-pointer py-2">
            <ZoomInIcon width="20" height="20" />
          </NumberStepper.IncreaseButton>
        }
        slotEnd={
          <NumberStepper.DecreaseButton className="cursor-pointer py-2">
            <ZoomOutIcon width="20" height="20" />
          </NumberStepper.DecreaseButton>
        }
      />
    </Menubar>
  );
};

export default LeftSidebar;
