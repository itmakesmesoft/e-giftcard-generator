import Menubar from "@/components/Menubar";
import { useControlStore, useShapeStore } from "@/app/store/canvas";
import { convertBarcodeFormat, ReaderFormatType } from "@/utils";
import { ChangeEvent } from "react";
import { generateShapeConfig } from "@/utils/canvas";
import { useSyncControl, useSelect, useCommandManager } from "@/app/hooks";
import NumberStepper from "../../../components/NumberStepper";
import FrameSize from "./FrameSize";
import ShapeMenuGroup from "./ShapeMenuGroup";
import BarcodeMenuGroup from "./BarcodeMenuGroup";
import { ToolAction, ActionType } from "./types";
import { AddShapeCommand } from "@/app/lib/command";
import {
  Eraser,
  ImagePlus,
  MousePointer2,
  Pencil,
  Redo2,
  TypeIcon,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface ToolConfig {
  action: ToolAction;
  icon: React.ReactNode;
  label: string;
}

const TOOL_CONFIGS: Record<ToolAction, ToolConfig> = {
  select: {
    action: "select",
    icon: <MousePointer2 width="18" height="18" />,
    label: "커서",
  },
  pencil: {
    action: "pencil",
    icon: <Pencil width="18" height="18" />,
    label: "펜",
  },
  eraser: {
    action: "eraser",
    icon: <Eraser width="18" height="18" />,
    label: "지우개",
  },
  text: {
    action: "text",
    icon: <TypeIcon width="18" height="18" />,
    label: "글자",
  },
};

const LeftSidebar = ({ className }: { className: string }) => {
  const { clearSelectNodes } = useSelect();
  const { getAttributes } = useSyncControl();
  const action = useControlStore((state) => state.action);
  const stageScale = useControlStore((state) => state.stageScale);
  const setAction = useControlStore((state) => state.setAction);
  const setStageScale = useControlStore((state) => state.setStageScale);

  const { execute, undo, redo, canUndo, canRedo } = useCommandManager();

  const getShapes = () => useShapeStore.getState().shapes;
  const rawSetShapes = (shapes: ReturnType<typeof getShapes>) =>
    useShapeStore.getState().setShapes(shapes);

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
      execute(new AddShapeCommand(newShape, getShapes, rawSetShapes));
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
      fill: getAttributes.shape.fill,
      stroke: getAttributes.shape.stroke,
    });
    execute(new AddShapeCommand(newShape, getShapes, rawSetShapes));
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
        <ImagePlus width="18" height="18" />
      </Menubar.MenuInputFileItem>

      <FrameSize />
      <Menubar.Separator />

      <Menubar.MenuItem
        onClick={undo}
        label="뒤로"
        icon={
          <Undo2
            width="18"
            height="18"
            color={!canUndo ? "#a1a1a1" : "#000"}
          />
        }
        disabled={!canUndo}
      />
      <Menubar.MenuItem
        onClick={redo}
        label="앞으로"
        icon={
          <Redo2
            className="rotate-180"
            width="18"
            height="18"
            color={!canRedo ? "#a1a1a1" : "#000"}
          />
        }
        disabled={!canRedo}
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
            <ZoomIn width="18" height="18" />
          </NumberStepper.IncreaseButton>
        }
        slotEnd={
          <NumberStepper.DecreaseButton className="cursor-pointer py-2">
            <ZoomOut width="18" height="18" />
          </NumberStepper.DecreaseButton>
        }
      />
    </Menubar>
  );
};

export default LeftSidebar;
