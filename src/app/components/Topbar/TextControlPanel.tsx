import MoveBackwardIcon from "@/components/assets/MoveBackwardIcon";
import MoveForwardIcon from "@/components/assets/MoveForwardIcon";
import Toolbar from "@/components/Toolbar";
import {
  CheckIcon,
  ChevronDownIcon,
  FontBoldIcon,
  FontItalicIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextIcon,
} from "@radix-ui/react-icons";
import { Select } from "radix-ui";
import { ChangeEvent } from "react";
import { ColorResult } from "react-color";
import { ControlPanelProps } from "./types";
import { useControl, useFonts } from "@/app/hooks";
import { useCanvasContext } from "@/app/context/canvas";
import { useShapeStore } from "@/app/store/canvas";
import { TextAlign } from "@/app/store/types";

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

const TextControlPanel = (props: ControlPanelProps) => {
  const { updateSelectedShapeAttributes } = props;
  const { moveToForward, moveToBackward } = useShapeStore();
  const { getAttributes, setAttributes } = useControl();
  const { fontList, loadFontFamily, fontDict } = useFonts();
  const { selectedNodes, selectNodesByIdList } = useCanvasContext();

  const onFontStylesChange = (values: string[]) => {
    const fontStyle = values.includes("italic") ? "italic" : "normal";
    const fontWeight = values.includes("900") ? "900" : "400";

    setAttributes.setFontStyle(fontStyle);
    setAttributes.setFontWeight(fontWeight);
    updateSelectedShapeAttributes({ fontStyle, fontWeight });
  };

  const onTextAlignChange = (textAlign: string) => {
    setAttributes.setFontTextAlign(textAlign as TextAlign);
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
    setAttributes.setFontTypeFace(typeFace);
    updateSelectedShapeAttributes({ fontFamily, typeFace });
  };

  const onFontColorChange = (value: ColorResult) => {
    setAttributes.setFontFill(value.hex);
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
        value={getAttributes.fontTextAlign}
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
        color={getAttributes.fontFill}
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
    </>
  );
};

export default TextControlPanel;
