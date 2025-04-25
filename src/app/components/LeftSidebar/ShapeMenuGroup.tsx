import {
  MixIcon,
  SquareIcon,
  CircleIcon,
  ArrowTopLeftIcon,
  TriangleUpIcon,
  DotFilledIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import Menubar from "@/components/Menubar";
import { ShapeAction } from "./types";

interface ShapeMenuGroupProps {
  onToolChange: (action: ShapeAction) => void;
}

const SHAPE_CONFIGS = {
  rectangle: {
    action: "rectangle" as const,
    icon: <SquareIcon width="16" height="16" />,
    label: "사각형",
  },
  circle: {
    action: "circle" as const,
    icon: <CircleIcon width="16" height="16" />,
    label: "원",
  },
  arrow: {
    action: "arrow" as const,
    icon: <ArrowTopLeftIcon width="16" height="16" />,
    label: "화살표",
  },
  triangle: {
    action: "triangle" as const,
    icon: <TriangleUpIcon width="16" height="16" />,
    label: "삼각형",
  },
  ellipse: {
    action: "ellipse" as const,
    icon: <DotFilledIcon width="16" height="16" />,
    label: "타원",
  },
  star: {
    action: "star" as const,
    icon: <StarFilledIcon width="16" height="16" />,
    label: "별",
  },
};

const ShapeMenuGroup = ({ onToolChange }: ShapeMenuGroupProps) => {
  return (
    <Menubar.MenuGroup
      label="도형"
      className="text-black"
      onClick={() => onToolChange("rectangle")}
      trigger={
        <Menubar.MenuGroupTrigger icon={<MixIcon width="18" height="18" />} />
      }
    >
      {Object.entries(SHAPE_CONFIGS).map(([shapeAction, config]) => (
        <Menubar.MenuGroupItem
          key={shapeAction}
          onClick={() => onToolChange(shapeAction as ShapeAction)}
          icon={config.icon}
        >
          {config.label}
        </Menubar.MenuGroupItem>
      ))}
    </Menubar.MenuGroup>
  );
};

export default ShapeMenuGroup;
