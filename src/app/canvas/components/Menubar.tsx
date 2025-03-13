import Konva from "konva";
import StrokeWidthIcon from "./ui/StrokeWidthIcon";
import { ChangeEvent } from "react";
import { useCanvasContext } from "@/app/context/canvas";
import { TextAlign, useShapeStore } from "@/app/store/canvas";
import { Select, Slider } from "radix-ui";
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  FontBoldIcon,
  FontItalicIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { useControl, useFonts } from "@/app/hooks";
import { RxTransparencyGrid } from "react-icons/rx";
import Toolbar from "./ui/Toolbar";

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

const Menubar = ({ className }: { className: string }) => {
  const { selectedNodes } = useCanvasContext();
  const { getAttributes, setAttributes } = useControl();
  const setShapes = useShapeStore((state) => state.setShapes);

  const onFillChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAttributes.setFill(e.target.value);
    updateSelectedShapeAttributes({ fill: e.target.value });
  };

  const onStrokeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAttributes.setStroke(e.target.value);
    updateSelectedShapeAttributes({ stroke: e.target.value });
  };

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

  const onStrokeWidthChange = (value: number[]) => {
    setAttributes.setStrokeWidth(value[0]);
    updateSelectedShapeAttributes({ strokeWidth: value[0] });
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

  const onOpacityChange = (value: number[]) => {
    setAttributes.setOpacity(value[0]);
    updateSelectedShapeAttributes({ opacity: value[0] });
  };

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

  const { fontList, loadFontFamily, fontDict } = useFonts();

  return (
    <div className={className}>
      <Toolbar>
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
          value={getAttributes.fontFamily}
          onValueChange={onFontFamilyChange}
          title={
            <>
              <Select.Value placeholder="Select a font">
                {getAttributes.fontFamily}
              </Select.Value>
              <Select.Icon className="">
                <ChevronDownIcon />
              </Select.Icon>
            </>
          }
        >
          {fontList?.map((item, index) => (
            <Toolbar.SelectItem
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
          color={getAttributes.fill}
          onChange={onFillChange}
        />
        <Toolbar.ColorPicker
          color={getAttributes.stroke}
          onChange={onStrokeChange}
        />
        <Toolbar.Dropdown
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
          title={
            <StrokeWidthIcon
              width="24"
              height="24"
              className="group-hover:fill-red-600"
            />
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
      </Toolbar>
    </div>
  );
};

export default Menubar;
