import { Slider } from "radix-ui";
import { useSyncControl, useCommandManager } from "@/app/hooks";
import { ColorResult } from "react-color";
import Toolbar from "@/components/Toolbar";
import { ControlPanelProps } from "./types";
import { useControlStore, useShapeStore } from "@/app/store/canvas";
import { useCanvasContext } from "@/app/context/canvas";
import MoveBackwardIcon from "@/components/assets/MoveBackwardIcon";
import MoveForwardIcon from "@/components/assets/MoveForwardIcon";
import StrokeWidthIcon from "@/components/assets/StrokeWidthIcon";
import { Blend, Square, SquareDashed, SquareRoundCorner } from "lucide-react";
import { ReorderShapeCommand } from "@/app/lib/command";

const ShapeControlPanel = (props: ControlPanelProps) => {
  const { updateSelectedShapeAttributes, actionType } = props;
  const { getAttributes } = useSyncControl();
  const { selectedNodes, selectNodesByIdList } = useCanvasContext();
  const { execute } = useCommandManager();

  const getShapes = () => useShapeStore.getState().shapes;
  const rawSetShapes = (shapes: ReturnType<typeof getShapes>) =>
    useShapeStore.getState().setShapes(shapes);

  const setShapeFill = useControlStore((state) => state.shape.setFill);
  const hasStroke = useControlStore((state) => state.shape.hasStroke);
  const setShapeHasStroke = useControlStore(
    (state) => state.shape.setHasStroke
  );
  const setShapeStroke = useControlStore((state) => state.shape.setStroke);
  const setShapeOpacity = useControlStore((state) => state.shape.setOpacity);
  const setShapeCornerRadius = useControlStore(
    (state) => state.shape.setCornerRadius
  );
  const setShapeStrokeWidth = useControlStore(
    (state) => state.shape.setStrokeWidth
  );

  const onFillChange = (value: ColorResult) => {
    setShapeFill(value.hex);
    updateSelectedShapeAttributes({ fill: value.hex });
  };

  const onHasStrokeChange = () => {
    const newHasStroke = !hasStroke;
    setShapeHasStroke(newHasStroke);
    updateSelectedShapeAttributes({ hasStroke: newHasStroke });
  };

  const onStrokeChange = (value: ColorResult) => {
    setShapeStroke(value.hex);
    updateSelectedShapeAttributes({ stroke: value.hex });
  };

  const onStrokeWidthChange = (value: number[]) => {
    setShapeStrokeWidth(value[0]);
    updateSelectedShapeAttributes({ strokeWidth: value[0] });
  };

  const onRadiusChange = (value: number[]) => {
    setShapeCornerRadius(value[0]);
    updateSelectedShapeAttributes({ cornerRadius: value[0] });
  };

  const onOpacityChange = (value: number[]) => {
    setShapeOpacity(value[0]);
    updateSelectedShapeAttributes({ opacity: value[0] });
  };

  const onMoveToForward = () => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map((node) => node.attrs.id);
    let shapes = getShapes();
    for (const id of selectedIds) {
      const shape = shapes.find((s) => s.id === id);
      if (!shape) continue;
      shapes = [...shapes.filter((s) => s.id !== id), shape];
    }
    execute(new ReorderShapeCommand(shapes, getShapes, rawSetShapes));
    selectNodesByIdList(selectedIds);
  };

  const onMoveToBackward = () => {
    if (selectedNodes.length === 0) return;
    const selectedIds = selectedNodes.map((node) => node.attrs.id);
    let shapes = getShapes();
    for (const id of selectedIds) {
      const shape = shapes.find((s) => s.id === id);
      if (!shape) continue;
      shapes = [shape, ...shapes.filter((s) => s.id !== id)];
    }
    execute(new ReorderShapeCommand(shapes, getShapes, rawSetShapes));
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
      {actionType !== "line" && actionType !== "arrow" && (
        <Toolbar.Tooltip label="테두리">
          <Toolbar.Button onClick={onHasStrokeChange}>
            {hasStroke ? (
              <Square width="20" height="20" />
            ) : (
              <SquareDashed width="20" height="20" />
            )}
          </Toolbar.Button>
        </Toolbar.Tooltip>
      )}
      <Toolbar.Dropdown
        label="선 굵기"
        disabled={!hasStroke}
        title={
          <span className="flex flex-row gap-0.5 items-center min-w-10">
            <StrokeWidthIcon
              width="24"
              height="24"
              className={hasStroke ? "text-black" : "text-[#acacac]"}
            />
            <span className={hasStroke ? "text-black" : "text-[#acacac]"}>
              {getAttributes.shapeStrokeWidth}
            </span>
          </span>
        }
      >
        <p>Stroke Width</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={100}
          min={1}
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
      {actionType === "rectangle" && (
        <Toolbar.Dropdown
          label="모서리"
          title={<SquareRoundCorner width="20" height="20" />}
        >
          <p>Corner Radius</p>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-[200px] h-4"
            max={100}
            min={1}
            value={[getAttributes.shapeCornerRadius]}
            onValueChange={onRadiusChange}
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
      )}
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
