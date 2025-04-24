import Menubar from "@/components/Menubar";
import { useShapeStore } from "@/app/store/canvas";
import { convertBarcodeFormat, ReaderFormatType } from "@/utils";
import { useCanvasContext } from "@/app/context/canvas";
import { ChangeEvent } from "react";
import { generateShapeConfig } from "@/utils/canvas";
import {
  CursorArrowIcon,
  EraserIcon,
  ImageIcon,
  Pencil1Icon,
  ResetIcon,
  TextIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";
import { useControl, useSelect } from "@/app/hooks";
import NumberStepper from "../../../components/NumberStepper";
import FrameSize from "./FrameSize";
import ShapeMenuGroup from "./ShapeMenuGroup";
import BarcodeMenuGroup from "./BarcodeMenuGroup";
import { ToolAction, ActionType } from "./types";

interface ToolConfig {
  action: ToolAction;
  icon: React.ReactNode;
  label: string;
}

const TOOL_CONFIGS: Record<ToolAction, ToolConfig> = {
  select: {
    action: "select",
    icon: <CursorArrowIcon width="18" height="18" />,
    label: "커서",
  },
  pencil: {
    action: "pencil",
    icon: <Pencil1Icon width="18" height="18" />,
    label: "펜",
  },
  eraser: {
    action: "eraser",
    icon: <EraserIcon width="18" height="18" />,
    label: "지우개",
  },
  text: {
    action: "text",
    icon: <TextIcon width="18" height="18" />,
    label: "글자",
  },
};

const LeftSidebar = ({ className }: { className: string }) => {
  const { clearSelectNodes } = useSelect();
  const { stageScale, setStageScale } = useCanvasContext();
  const { action, setAction, getAttributes } = useControl();

  const redo = useShapeStore((state) => state.redo);
  const undo = useShapeStore((state) => state.undo);
  const setShapes = useShapeStore((state) => state.setShapes);
  const isFirstHistory = useShapeStore((state) => state.isFirstHistory);
  const isLastHistory = useShapeStore((state) => state.isLastHistory);

  const handleToolChange = (newAction: ActionType) => {
    setAction(newAction);
    clearSelectNodes();
  };

  const handleScaleChange = (value: number) => {
    const scale = value / 100;
    setStageScale(scale);
  };

  const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (!reader.result) return;

      const newShape = generateShapeConfig({
        type: "image",
        name: "shape",
        dataURL: reader.result as string,
        isDrawing: false,
      });
      setShapes((shapes) => [...shapes, newShape]);
      setAction("select");
    };
  };

  const handleAddBarcode = (data: {
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
    setAction("select");
  };

  return (
    <Menubar className={`flex flex-col items-center ${className}`}>
      <BarcodeMenuGroup onAddBarcode={handleAddBarcode} />
      <Menubar.Separator />

      {Object.entries(TOOL_CONFIGS).map(([toolAction, config]) => (
        <Menubar.MenuItem
          key={toolAction}
          onClick={() => handleToolChange(toolAction as ToolAction)}
          label={config.label}
          active={action === toolAction}
          icon={config.icon}
        />
      ))}

      <ShapeMenuGroup onToolChange={handleToolChange} />

      <Menubar.MenuInputFileItem
        accept="image/*"
        onChange={handleAddImage}
        label="이미지 추가"
      >
        <ImageIcon />
      </Menubar.MenuInputFileItem>

      <FrameSize />
      <Menubar.Separator />

      <Menubar.MenuItem
        onClick={undo}
        label="뒤로"
        icon={
          <ResetIcon
            width="18"
            height="18"
            color={isFirstHistory ? "#a1a1a1" : "#000"}
          />
        }
        disabled={isFirstHistory}
      />
      <Menubar.MenuItem
        onClick={redo}
        label="앞으로"
        icon={
          <ResetIcon
            className="rotate-180"
            width="18"
            height="18"
            color={isLastHistory ? "#a1a1a1" : "#000"}
          />
        }
        disabled={isLastHistory}
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
