import Toolbar from "@/components/Toolbar";
import BrushRadiusControl from "./BrushRadiusControl";
import { Slider } from "radix-ui";
import { RxTransparencyGrid } from "react-icons/rx";
import { useControl } from "@/app/hooks";
import { ColorResult } from "react-color";
import { ControlPanelProps } from "./types";
import React from "react";

const BrushControlPanel = React.memo((props: ControlPanelProps) => {
  const { updateSelectedShapeAttributes } = props;
  const { getAttributes, setAttributes } = useControl();

  const onBrushColorChange = (value: ColorResult) => {
    setAttributes.setBrushStroke(value.hex);
    updateSelectedShapeAttributes({ stroke: value.hex });
  };

  const onBrushWidthChange = (value: number) => {
    setAttributes.setBrushStrokeWidth(value);
    updateSelectedShapeAttributes({ strokeWidth: value });
  };

  const onOpacityChange = (value: number[]) => {
    setAttributes.setBrushOpacity(value[0]);
    updateSelectedShapeAttributes({ opacity: value[0] });
  };

  return (
    <>
      <Toolbar.ColorPicker
        label="브러쉬 색상"
        color={getAttributes.brushStroke}
        onValueChangeComplete={onBrushColorChange}
      />
      <Toolbar.Dropdown
        label="불투명도"
        title={
          <RxTransparencyGrid
            width="24"
            height="24"
            style={{ background: `rgba(0,0,0,${getAttributes.brushOpacity})` }}
          />
        }
      >
        <p>Opacity</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={1}
          min={0}
          value={[getAttributes.brushOpacity]}
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
        value={getAttributes.brushStrokeWidth}
        onValueChange={onBrushWidthChange}
      />
    </>
  );
});
BrushControlPanel.displayName = "BrushControlPanel";
export default BrushControlPanel;
