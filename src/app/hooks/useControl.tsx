import { Dispatch, SetStateAction, useState } from "react";

type ActionType =
  | "select"
  | "rectangle"
  | "circle"
  | "pencil"
  | "eraser"
  | "arrow"
  | "image";

interface ControlValues {
  action: ActionType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  draggable: boolean;
  lineJoin: string;
  lineCap: string;
  radius: number;
  image: unknown;
}

interface Controls extends ControlValues {
  setAction: Dispatch<SetStateAction<ActionType>>;
  setFill: Dispatch<SetStateAction<string>>;
  setStroke: Dispatch<SetStateAction<string>>;
  setStrokeWidth: Dispatch<SetStateAction<number>>;
  setOpacity: Dispatch<SetStateAction<number>>;
  setDraggable: Dispatch<SetStateAction<boolean>>;
  setLineJoin: Dispatch<SetStateAction<string>>;
  setLineCap: Dispatch<SetStateAction<string>>;
  setRadius: Dispatch<SetStateAction<number>>;
  setImage: Dispatch<SetStateAction<unknown>>;
}

const defaultValues: ControlValues = {
  action: "select",
  fill: "#ff0000",
  stroke: "#000000",
  strokeWidth: 2,
  opacity: 1,
  draggable: true,
  lineJoin: "round",
  lineCap: "round",
  radius: 0,
  image: "",
};

const useControl = (props?: ControlValues): Controls => {
  const config = { ...defaultValues, ...props };

  const [action, setAction] = useState<ActionType>(config.action);
  const [fill, setFill] = useState<string>(config.fill);
  const [stroke, setStroke] = useState<string>(config.stroke);
  const [strokeWidth, setStrokeWidth] = useState<number>(config.strokeWidth);
  const [opacity, setOpacity] = useState<number>(config.opacity);
  const [draggable, setDraggable] = useState<boolean>(config.draggable);
  const [lineJoin, setLineJoin] = useState<string>(config.lineJoin);
  const [lineCap, setLineCap] = useState<string>(config.lineCap);
  const [radius, setRadius] = useState<number>(config.radius);
  const [image, setImage] = useState<unknown>(config.image);

  return {
    // for Shape
    action,
    fill,
    stroke,
    strokeWidth,
    opacity,
    draggable,
    setAction,
    setFill,
    setStroke,
    setStrokeWidth,
    setOpacity,
    setDraggable,
    lineCap,
    lineJoin,
    setLineJoin,
    setLineCap,

    // for Elipse
    radius,
    setRadius,

    // for image
    image,
    setImage,
  };
};

export default useControl;
