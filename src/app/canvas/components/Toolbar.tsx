import Konva from "konva";
import ColorPicker from "./ui/ColorPicker";
import { ChangeEvent } from "react";
import { useCanvasContext } from "@/app/context/canvas";
import { TextAlign, useShapeStore } from "@/app/store/canvas";
import Input from "./ui/Input";
import {
  DropdownMenu,
  Toolbar as RadixToolbar,
  Select,
  Slider,
} from "radix-ui";
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

const Toolbar = ({ className }: { className: string }) => {
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

  // const onFontStyleChange = (value: string[]) => {
  //   setAttributes.setFontStyle(value);
  //   updateSelectedShapeAttributes({ fontStyle: value });
  // };

  const onFontStylesChange = (values: string[]) => {
    const fontStyle = values.includes("italic") ? "italic" : "normal";
    const fontWeight = values.includes("900") ? "900" : "400";

    setAttributes.setFontStyle(fontStyle);
    setAttributes.setFontWeight(fontWeight);
    console.log({ fontStyle, fontWeight });
    updateSelectedShapeAttributes({ fontStyle, fontWeight });
  };

  const onTextAlignChange = (textAlign: string) => {
    setAttributes.setTextAlign(textAlign as TextAlign);
    updateSelectedShapeAttributes({ textAlign });
  };

  const onStrokeWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const strokeWidth = Number(e.target.value);
    setAttributes.setStrokeWidth(strokeWidth);
    updateSelectedShapeAttributes({ strokeWidth });
  };

  const onFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setAttributes.setFontSize(size);
    updateSelectedShapeAttributes({ fontSize: size });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFontFamilyChange = async (fontFamily: string) => {
    const res = await loadFontFamily(fontFamily);

    if (!res) return;
    const typeFace = fontDict[fontFamily].category;

    setAttributes.setFontFamily(fontFamily);
    setAttributes.setTypeFace(typeFace);
    console.log(fontFamily, typeFace);
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

  const { fontList, currentFont, loadFontFamily, fontDict } = useFonts();

  return (
    <div className={className}>
      <RadixToolbar.Root className="flex flex-row gap-4 bg-white px-4 py-2 rounded-xl border">
        <RadixToolbar.ToggleGroup
          type="multiple"
          value={[getAttributes.fontStyle, `${getAttributes.fontWeight}`]}
          onValueChange={onFontStylesChange}
        >
          <RadixToolbar.ToggleItem
            value="900"
            className={`data-[state="on"]:bg-purple-500`}
          >
            <FontBoldIcon />
          </RadixToolbar.ToggleItem>
          <RadixToolbar.ToggleItem
            value="italic"
            className={`data-[state="on"]:bg-purple-500`}
          >
            <FontItalicIcon />
          </RadixToolbar.ToggleItem>
          {/* <RadixToolbar.ToggleItem
            value="strikethrough"
            className={`data-[state="on"]:bg-purple-500`}
          >
            <StrikethroughIcon />
          </RadixToolbar.ToggleItem> */}
        </RadixToolbar.ToggleGroup>
        <RadixToolbar.Separator className="" />
        <RadixToolbar.ToggleGroup
          type="single"
          value={getAttributes.textAlign}
          onValueChange={onTextAlignChange}
        >
          <RadixToolbar.ToggleItem
            className={`data-[state="on"]:bg-purple-500`}
            value="left"
          >
            <TextAlignLeftIcon />
          </RadixToolbar.ToggleItem>
          <RadixToolbar.ToggleItem
            className={`data-[state="on"]:bg-purple-500`}
            value="center"
          >
            <TextAlignCenterIcon />
          </RadixToolbar.ToggleItem>
          <RadixToolbar.ToggleItem
            className={`data-[state="on"]:bg-purple-500`}
            value="right"
          >
            <TextAlignRightIcon />
          </RadixToolbar.ToggleItem>
        </RadixToolbar.ToggleGroup>
        <RadixToolbar.Separator className="ToolbarSeparator" />
        <Select.Root
          value={getAttributes.fontFamily}
          onValueChange={onFontFamilyChange}
        >
          <RadixToolbar.Button asChild>
            <Select.Trigger
              className="flex flex-row justify-between items-center gap-4 px-4 cursor-pointer"
              aria-label="font"
            >
              <Select.Value placeholder="Select a font">
                {getAttributes.fontFamily}
              </Select.Value>
              <Select.Icon className="">
                <ChevronDownIcon />
              </Select.Icon>
            </Select.Trigger>
          </RadixToolbar.Button>
          <Select.Portal>
            <Select.Content
              className="bg-white p-2 rounded-lg"
              position="popper"
              sideOffset={10}
            >
              <Select.Viewport className="SelectViewport">
                {fontList?.map((item, index) => (
                  <Select.Item
                    key={index}
                    value={item.family}
                    className="hover:bg-gray-200 px-2 py-0.5 cursor-pointer"
                  >
                    {item.family}
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        <Input
          value={String(getAttributes.fontSize)}
          onChange={onFontSizeChange}
          className="w-[60px]"
        />
        <ColorPicker color={getAttributes.fill} onChange={onFillChange} />
        <ColorPicker color={getAttributes.stroke} onChange={onStrokeChange} />

        <DropdownMenu.Root>
          <RadixToolbar.Button asChild>
            <DropdownMenu.Trigger className="">
              <RxTransparencyGrid
                style={{ background: `rgba(0,0,0,${getAttributes.opacity})` }}
              />
            </DropdownMenu.Trigger>
          </RadixToolbar.Button>
          <DropdownMenu.Content className="mt-4 py-2 px-4 rounded-xl bg-white">
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
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        {/* <Slider
          min={1}
          max={50}
          value={getAttributes.strokeWidth}
          onChange={onStrokeWidthChange}
        /> */}
      </RadixToolbar.Root>
    </div>
  );
};

export default Toolbar;
