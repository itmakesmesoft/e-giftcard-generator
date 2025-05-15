import { Slider } from "radix-ui";
import Toolbar from "@/components/Toolbar";
import { useState } from "react";
// import { useDebounceValue } from "@/app/hooks";

const BrushRadiusControl = ({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) => {
  const [brushRadius, setBrushRadius] = useState<number>(value);
  // const debounced = useDebounceValue(brushRadius, 300);

  const radius = 0.16 * Math.max(brushRadius, 1) + 4;

  const handleRadiusChange = (v: number[]) => {
    setBrushRadius(v[0]);
    onValueChange(v[0]);
  };

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
        onValueChange={handleRadiusChange}
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

export default BrushRadiusControl;
