import Menubar from "@/components/Menubar";
import TriangleIcon from "@/components/assets/TriangleIcon";
import { ShapeConfig, ShapeMenuGroupProps } from "./types";
import { ShapeType } from "../konva/Canvas";
import {
  Circle,
  MoveDownRight,
  Shapes,
  Slash,
  Square,
  Star,
} from "lucide-react";

const SHAPE_CONFIGS: Record<ShapeType, ShapeConfig> = {
  rectangle: {
    action: "rectangle" as const,
    icon: <Square width="16" height="16" />,
    label: "사각형",
  },
  circle: {
    action: "circle" as const,
    icon: <Circle width="16" height="16" />,
    label: "원",
  },
  line: {
    action: "line" as const,
    icon: <Slash width="16" height="16" />,
    label: "선",
  },
  arrow: {
    action: "arrow" as const,
    icon: <MoveDownRight width="16" height="16" />,
    label: "화살표",
  },
  triangle: {
    action: "triangle" as const,
    icon: <TriangleIcon width="16" height="16" />,
    label: "삼각형",
  },
  ellipse: {
    action: "ellipse" as const,
    icon: <Circle width="16" height="12" />,
    label: "타원",
  },
  star: {
    action: "star" as const,
    icon: <Star width="16" height="16" />,
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
        <Menubar.MenuGroupTrigger icon={<Shapes width="18" height="18" />} />
      }
    >
      {Object.entries(SHAPE_CONFIGS).map(([shapeAction, config]) => (
        <Menubar.MenuGroupItem
          key={shapeAction}
          onClick={() => onToolChange(shapeAction as ShapeType)}
          icon={config.icon}
        >
          {config.label}
        </Menubar.MenuGroupItem>
      ))}
    </Menubar.MenuGroup>
  );
};

export default ShapeMenuGroup;
