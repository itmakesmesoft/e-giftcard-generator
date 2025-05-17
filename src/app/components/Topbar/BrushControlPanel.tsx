import Toolbar from "@/components/Toolbar";
import BrushRadiusControl from "./BrushRadiusControl";
import { Slider } from "radix-ui";
import { useSyncControl } from "@/app/hooks";
import { ColorResult } from "react-color";
import { ControlPanelProps } from "./types";
import React from "react";
import { useControlStore } from "@/app/store/canvas";
import { Blend } from "lucide-react";

const BrushControlPanel = React.memo((props: ControlPanelProps) => {
  const { updateSelectedShapeAttributes } = props;
  const { getAttributes } = useSyncControl();

  const setBrushStroke = useControlStore((state) => state.brush.setStroke);
  const setBrushOpacity = useControlStore((state) => state.brush.setOpacity);
  const setBrushStrokeWidth = useControlStore(
    (state) => state.brush.setStrokeWidth
  );

  const onBrushColorChange = (value: ColorResult) => {
    setBrushStroke(value.hex);
    updateSelectedShapeAttributes({ stroke: value.hex });
  };

  const onOpacityChange = (value: number[]) => {
    setBrushOpacity(value[0]);
    updateSelectedShapeAttributes({ opacity: value[0] });
  };

  const onBrushWidthChange = (value: number) => {
    setBrushStrokeWidth(value);
    updateSelectedShapeAttributes({ strokeWidth: value });
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
          <Blend
            width="20"
            height="20"
            color={`rgba(0,0,0,${Math.max(getAttributes.shapeOpacity, 0.3)})`}
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
