import { Slider } from "radix-ui";
import { useControl } from "@/app/hooks";
import { ColorResult } from "react-color";
import Toolbar from "@/components/Toolbar";
import { ControlPanelProps } from "./types";
import { useShapeStore } from "@/app/store/canvas";
import { RxTransparencyGrid } from "react-icons/rx";
import { useCanvasContext } from "@/app/context/canvas";
import MoveBackwardIcon from "@/components/assets/MoveBackwardIcon";
import MoveForwardIcon from "@/components/assets/MoveForwardIcon";
import StrokeWidthIcon from "@/components/assets/StrokeWidthIcon";

const ShapeControlPanel = (props: ControlPanelProps) => {
  const { updateSelectedShapeAttributes } = props;
  const { getAttributes, setAttributes } = useControl();
  const { selectedNodes, selectNodesByIdList } = useCanvasContext();
  const { moveToForward, moveToBackward } = useShapeStore();

  const onFillChange = (value: ColorResult) => {
    setAttributes.setShapeFill(value.hex);
    updateSelectedShapeAttributes({ fill: value.hex });
  };

  const onStrokeChange = (value: ColorResult) => {
    setAttributes.setShapeStroke(value.hex);
    updateSelectedShapeAttributes({ stroke: value.hex });
  };

  const onStrokeWidthChange = (value: number[]) => {
    setAttributes.setShapeStrokeWidth(value[0]);
    updateSelectedShapeAttributes({ strokeWidth: value[0] });
  };

  const onOpacityChange = (value: number[]) => {
    setAttributes.setShapeOpacity(value[0]);
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

  return (
    <>
      <Toolbar.ColorPicker
        label="채우기 색상"
        color={getAttributes.shapeFill}
        onValueChangeComplete={onFillChange}
      />
      <Toolbar.ColorPicker
        label="선 색상"
        variant="border"
        color={getAttributes.shapeStroke}
        onValueChangeComplete={onStrokeChange}
      />
      <Toolbar.Dropdown
        label="불투명도"
        title={
          <RxTransparencyGrid
            width="24"
            height="24"
            style={{ background: `rgba(0,0,0,${getAttributes.shapeOpacity})` }}
          />
        }
      >
        <p>Opacity</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={1}
          min={0}
          value={[getAttributes.shapeOpacity]}
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
            <span>{getAttributes.shapeStrokeWidth}</span>
          </span>
        }
      >
        <p>Stroke Width</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={100}
          min={0}
          value={[getAttributes.shapeStrokeWidth]}
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
    </>
  );
};

export default ShapeControlPanel;
