import Konva from "konva";
import StrokeWidthIcon from "./ui/StrokeWidthIcon";
import { ChangeEvent, useEffect, useState } from "react";
import { useCanvasContext } from "@/app/context/canvas";
import { TextAlign, useControlStore, useShapeStore } from "@/app/store/canvas";
import { Select, Slider } from "radix-ui";
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  FontBoldIcon,
  FontItalicIcon,
  ChevronDownIcon,
  CheckIcon,
  TextIcon,
} from "@radix-ui/react-icons";
import { useControl, useFonts, useSelect } from "@/app/hooks";
import { RxTransparencyGrid } from "react-icons/rx";
import Toolbar from "./ui/Toolbar";
import { ColorResult } from "react-color";
import MoveForwardIcon from "./ui/MoveForwardIcon";
import MoveBackwardIcon from "./ui/MoveBackwardIcon";
import DeleteIcon from "./ui/DeleteIcon";
import useDebounce from "../hooks/useDebounce";

const fontStyleOptions = [
  {
    label: "font weight bold",
    value: "900",
    icon: <FontBoldIcon width="24" height="24" />,
  },
  {
    label: "font style italic",
    value: "italic",
    icon: <FontItalicIcon width="24" height="24" />,
  },
];
const textAlignOptions = [
  {
    label: "left",
    value: "left",
    icon: <TextAlignLeftIcon width="24" height="24" />,
  },
  {
    label: "center",
    value: "center",
    icon: <TextAlignCenterIcon width="24" height="24" />,
  },
  {
    label: "right",
    value: "right",
    icon: <TextAlignRightIcon width="24" height="24" />,
  },
];

type PanelType = "text" | "shape" | "brush" | null;

const getProperPanelType = (nodes: Konva.Node[]) => {
  let type = null;
  for (const node of nodes) {
    let tmpType;
    if (node.attrs.type === "text") tmpType = "text";
    else tmpType = "shape";

    if (!type) type = tmpType;
    else if (type !== tmpType) return null;
  }
  return type;
};

const Menubar = ({ className }: { className: string }) => {
  const { clearSelectNodes } = useSelect();
  const { selectedNodes } = useCanvasContext();
  const [panelType, setPanelType] = useState<PanelType>(null);
  const setShapes = useShapeStore((state) => state.setShapes);
  const action = useControlStore((state) => state.action);

  useEffect(() => {
    if (selectedNodes.length === 0) {
      switch (action) {
        case "text":
          setPanelType("text");
          break;
        case "pencil":
        case "eraser":
          setPanelType("brush");
          break;
        case "rectangle":
        case "circle":
        case "arrow":
          setPanelType("shape");
          break;
        default:
          setPanelType(null);
      }
      return;
    }

    const type = getProperPanelType(selectedNodes);
    switch (type) {
      case "text":
        setPanelType("text");
        break;
      case "shape":
        setPanelType("shape");
        break;
      default:
        setPanelType(null);
    }
  }, [selectedNodes, action]);

  const updateSelectedShapeAttributes = (newAttrs: Konva.ShapeConfig) => {
    const ids = selectedNodes.map((node) => node.attrs.id);
    if (ids.length === 0) return;

    setShapes((shapes) =>
      shapes.map((shape) => {
        const shapeId = shape.id;
        return shapeId && ids.includes(shapeId)
          ? { ...shape, ...newAttrs }
          : shape;
      })
    );
  };
  const removeShapeOnCanvas = (ids: string[]) => {
    if (ids.length === 0) return;
    setShapes((shapes) =>
      shapes.filter((shape) => shape.id && !ids.includes(shape.id))
    );
    clearSelectNodes();
  };

  return (
    <div className={className}>
      {panelType && (
        <Toolbar>
          {panelType === "shape" && (
            <ShapeControlPanel
              updateSelectedShapeAttributes={updateSelectedShapeAttributes}
              removeShapeOnCanvas={removeShapeOnCanvas}
            />
          )}
          {panelType === "text" && (
            <TextControlPanel
              updateSelectedShapeAttributes={updateSelectedShapeAttributes}
              removeShapeOnCanvas={removeShapeOnCanvas}
            />
          )}
          {panelType === "brush" && (
            <BrushControlPanel
              updateSelectedShapeAttributes={updateSelectedShapeAttributes}
            />
          )}
        </Toolbar>
      )}
    </div>
  );
};
interface ControlPanelProps {
  updateSelectedShapeAttributes: (newAttrs: Konva.ShapeConfig) => void;
  removeShapeOnCanvas?: (ids: string[]) => void;
}

const TextControlPanel = ({
  updateSelectedShapeAttributes,
  removeShapeOnCanvas,
}: ControlPanelProps) => {
  const { moveToForward, moveToBackward } = useShapeStore();
  const { getAttributes, setAttributes } = useControl();
  const { fontList, loadFontFamily, fontDict } = useFonts();
  const { selectedNodes, selectNodesByIdList, getAllSelectedNodes } =
    useCanvasContext();

  const onFontStylesChange = (values: string[]) => {
    const fontStyle = values.includes("italic") ? "italic" : "normal";
    const fontWeight = values.includes("900") ? "900" : "400";

    setAttributes.setFontStyle(fontStyle);
    setAttributes.setFontWeight(fontWeight);
    updateSelectedShapeAttributes({ fontStyle, fontWeight });
  };

  const onTextAlignChange = (textAlign: string) => {
    setAttributes.setTextAlign(textAlign as TextAlign);
    updateSelectedShapeAttributes({ textAlign });
  };

  const onFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setAttributes.setFontSize(size);
    updateSelectedShapeAttributes({ fontSize: size });
  };

  const onFontFamilyChange = async (fontFamily: string) => {
    const res = await loadFontFamily(fontFamily);

    if (!res) return;
    const typeFace = fontDict[fontFamily].category;

    setAttributes.setFontFamily(fontFamily);
    setAttributes.setTypeFace(typeFace);
    updateSelectedShapeAttributes({ fontFamily, typeFace });
  };

  const onFontColorChange = (value: ColorResult) => {
    setAttributes.setFill(value.hex);
    updateSelectedShapeAttributes({ fill: value.hex });
  };

  const onMoveToForward = () => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map((node) => node.attrs.id);
    for (const id of selectedIds) moveToForward(id);
    selectNodesByIdList(selectedIds);
  };

  const onMoveToBackward = () => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map((node) => node.attrs.id);
    for (const id of selectedIds) moveToBackward(id);
    selectNodesByIdList(selectedIds);
  };

  const removeShapes = () => {
    if (!removeShapeOnCanvas) return;

    const nodes = getAllSelectedNodes();
    const ids = nodes.map((node) => node.attrs.id) as string[];
    if (ids.length > 0) removeShapeOnCanvas(ids);
  };

  return (
    <>
      <Toolbar.ToggleGroup
        type="multiple"
        items={fontStyleOptions}
        value={[getAttributes.fontStyle, String(getAttributes.fontWeight)]}
        onValueChange={onFontStylesChange}
      />
      <Toolbar.ToggleGroup
        type="single"
        items={textAlignOptions}
        value={getAttributes.textAlign}
        onValueChange={onTextAlignChange}
      />
      <Toolbar.Separator />
      <Toolbar.Select
        defaultValue={getAttributes.fontFamily}
        onValueChange={onFontFamilyChange}
        className="w-[150px] overflow-hidden"
        label="폰트 선택"
        title={
          <>
            <Select.Value placeholder="Select a font" asChild>
              <span className="overflow-hidden text-ellipsis text-nowrap">
                {getAttributes.fontFamily}
              </span>
            </Select.Value>
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </>
        }
      >
        {fontList?.map((item, index) => (
          <Toolbar.SelectItem
            icon={getAttributes.fontFamily === item.family && <CheckIcon />}
            className={
              getAttributes.fontFamily === item.family
                ? "text-gray-700! font-semibold"
                : ""
            }
            key={index}
            value={item.family}
            label={item.family}
          />
        ))}
      </Toolbar.Select>
      <Toolbar.Input
        value={String(getAttributes.fontSize)}
        onChange={onFontSizeChange}
      />
      <Toolbar.ColorPicker
        label="텍스트 색상"
        color={getAttributes.fill}
        onValueChangeComplete={onFontColorChange}
        variant="custom"
        customTitle={(currentColor) => (
          <span className="flex flex-col justify-between items-center w-[24px] h-[24px]">
            <TextIcon width="19" height="19" />
            <span
              className="w-full h-1 inline-block rounded-xs"
              style={{ background: currentColor }}
            />
          </span>
        )}
      />
      <Toolbar.Tooltip label="앞으로 이동">
        <Toolbar.Button onClick={onMoveToForward}>
          <MoveForwardIcon width="20" height="20" />
        </Toolbar.Button>
      </Toolbar.Tooltip>
      <Toolbar.Tooltip label="뒤로 이동">
        <Toolbar.Button onClick={onMoveToBackward}>
          <MoveBackwardIcon width="20" height="20" />
        </Toolbar.Button>
      </Toolbar.Tooltip>
      <Toolbar.Tooltip label="삭제">
        <Toolbar.Button onClick={removeShapes}>
          <DeleteIcon width="17" height="17" />
        </Toolbar.Button>
      </Toolbar.Tooltip>
    </>
  );
};

const ShapeControlPanel = ({
  updateSelectedShapeAttributes,
  removeShapeOnCanvas,
}: ControlPanelProps) => {
  const { getAttributes, setAttributes } = useControl();
  const { selectedNodes, selectNodesByIdList, getAllSelectedNodes } =
    useCanvasContext();
  const { moveToForward, moveToBackward } = useShapeStore();

  const onFillChange = (value: ColorResult) => {
    setAttributes.setFill(value.hex);
    updateSelectedShapeAttributes({ fill: value.hex });
  };

  const onStrokeChange = (value: ColorResult) => {
    setAttributes.setStroke(value.hex);
    updateSelectedShapeAttributes({ stroke: value.hex });
  };

  const onStrokeWidthChange = (value: number[]) => {
    setAttributes.setStrokeWidth(value[0]);
    updateSelectedShapeAttributes({ strokeWidth: value[0] });
  };

  const onOpacityChange = (value: number[]) => {
    setAttributes.setOpacity(value[0]);
    updateSelectedShapeAttributes({ opacity: value[0] });
  };

  const onMoveToForward = () => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map((node) => node.attrs.id);
    for (const id of selectedIds) moveToForward(id);
    selectNodesByIdList(selectedIds);
  };

  const onMoveToBackward = () => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map((node) => node.attrs.id);
    for (const id of selectedIds) moveToBackward(id);
    selectNodesByIdList(selectedIds);
  };

  const removeShapes = () => {
    if (!removeShapeOnCanvas) return;

    const nodes = getAllSelectedNodes();
    const ids = nodes.map((node) => node.attrs.id) as string[];
    if (ids.length > 0) removeShapeOnCanvas(ids);
  };

  return (
    <>
      <Toolbar.ColorPicker
        label="채우기 색상"
        color={getAttributes.fill}
        onValueChangeComplete={onFillChange}
      />
      <Toolbar.ColorPicker
        label="선 색상"
        variant="border"
        color={getAttributes.stroke}
        onValueChangeComplete={onStrokeChange}
      />
      <Toolbar.Dropdown
        label="불투명도"
        title={
          <RxTransparencyGrid
            width="24"
            height="24"
            style={{ background: `rgba(0,0,0,${getAttributes.opacity})` }}
          />
        }
      >
        <p>Opacity</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={1}
          min={0}
          value={[getAttributes.opacity]}
          onValueChange={onOpacityChange}
          step={0.01}
        >
          <Slider.Track className="bg-black relative grow-1 h-1">
            <Slider.Range className="absolute bg-blue-500 h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 bg-red-500 rounded-full"
            aria-label="opacity"
          />
        </Slider.Root>
      </Toolbar.Dropdown>
      <Toolbar.Dropdown
        label="선 굵기"
        title={
          <span className="flex flex-row gap-0.5 items-center min-w-10">
            <StrokeWidthIcon
              width="24"
              height="24"
              className="group-hover:fill-red-600"
            />
            <span>{getAttributes.strokeWidth}</span>
          </span>
        }
      >
        <p>Stroke Width</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={100}
          min={0}
          value={[getAttributes.strokeWidth]}
          onValueChange={onStrokeWidthChange}
          step={1}
        >
          <Slider.Track className="bg-black relative grow-1 h-1">
            <Slider.Range className="absolute bg-blue-500 h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 bg-red-500 rounded-full"
            aria-label="opacity"
          />
        </Slider.Root>
      </Toolbar.Dropdown>
      <Toolbar.Tooltip label="맨 앞으로 이동">
        <Toolbar.Button onClick={onMoveToForward}>
          <MoveForwardIcon width="20" height="20" />
        </Toolbar.Button>
      </Toolbar.Tooltip>
      <Toolbar.Tooltip label="맨 뒤로 이동">
        <Toolbar.Button onClick={onMoveToBackward}>
          <MoveBackwardIcon width="20" height="20" />
        </Toolbar.Button>
      </Toolbar.Tooltip>
      <Toolbar.Tooltip label="삭제">
        <Toolbar.Button onClick={removeShapes}>
          <DeleteIcon width="17" height="17" />
        </Toolbar.Button>
      </Toolbar.Tooltip>
    </>
  );
};

const BrushControlPanel = ({
  updateSelectedShapeAttributes,
}: ControlPanelProps) => {
  const { getAttributes, setAttributes } = useControl();

  const onBrushColorChange = (value: ColorResult) => {
    setAttributes.setStroke(value.hex);
    updateSelectedShapeAttributes({ stroke: value.hex });
  };

  const onBrushWidthChange = (value: number) => {
    setAttributes.setStrokeWidth(value);
    updateSelectedShapeAttributes({ strokeWidth: value });
  };

  const onOpacityChange = (value: number[]) => {
    setAttributes.setOpacity(value[0]);
    updateSelectedShapeAttributes({ opacity: value[0] });
  };

  return (
    <>
      <Toolbar.ColorPicker
        label="브러쉬 색상"
        color={getAttributes.stroke}
        onValueChangeComplete={onBrushColorChange}
      />
      <Toolbar.Dropdown
        label="불투명도"
        title={
          <RxTransparencyGrid
            width="24"
            height="24"
            style={{ background: `rgba(0,0,0,${getAttributes.opacity})` }}
          />
        }
      >
        <p>Opacity</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={1}
          min={0}
          value={[getAttributes.opacity]}
          onValueChange={onOpacityChange}
          step={0.01}
        >
          <Slider.Track className="bg-black relative grow-1 h-1">
            <Slider.Range className="absolute bg-blue-500 h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 bg-red-500 rounded-full"
            aria-label="opacity"
          />
        </Slider.Root>
      </Toolbar.Dropdown>
      <BrushRadiusControl
        value={getAttributes.strokeWidth}
        onValueChange={onBrushWidthChange}
      />
    </>
  );
};

export default Menubar;

const BrushRadiusControl = ({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) => {
  const [brushRadius, setBrushRadius] = useState<number>(value);
  const debounced = useDebounce(brushRadius, 300);

  const radius = 0.16 * Math.max(brushRadius, 1) + 4;

  useEffect(() => {
    onValueChange(debounced);
  }, [debounced, onValueChange]);

  return (
    <Toolbar.Dropdown
      label="브러쉬 굵기"
      title={
        <span className="flex flex-row gap-0.5 items-center">
          <span className="w-[25px] flex justify-center items-center">
            <span
              className="rounded-full bg-black inline-block"
              style={{ width: radius, height: radius }}
            />
          </span>
          <span>{brushRadius}</span>
        </span>
      }
    >
      <p>Stroke Width</p>
      {/* TODO. 추후 BrushWidth를 따로 빼야함 */}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-[200px] h-4"
        max={100}
        min={1}
        value={[brushRadius]}
        onValueChange={(v) => setBrushRadius(v[0])}
        step={1}
      >
        <Slider.Track className="bg-black relative grow-1 h-1">
          <Slider.Range className="absolute bg-blue-500 h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-red-500 rounded-full"
          aria-label="opacity"
        />
      </Slider.Root>
    </Toolbar.Dropdown>
  );
};
