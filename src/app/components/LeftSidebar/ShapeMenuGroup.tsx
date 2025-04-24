import {
  MixIcon,
  SquareIcon,
  CircleIcon,
  ArrowTopLeftIcon,
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
