import Konva from "konva";
import {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useShapeStore } from "../store/canvas";
import { Group } from "konva/lib/Group";
import { Shape } from "konva/lib/Shape";
import { Vector2d } from "konva/lib/types";
import { ShapeConfig } from "../types/canvas";
import { useControl } from "../hooks";

export interface CanvasSize {
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface CanvasData {
  canvas: {
    width: number;
    height: number;
    bgColor: string;
    children: (Group | Shape<ShapeConfig>)[] | undefined;
  };
}

interface CanvasContextValueProps {
  canvasSize: CanvasSize;
  canvasPos: Vector2d;
  stageScale: number;
  viewportSize: ViewportSize;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  setCanvasSize: Dispatch<SetStateAction<CanvasSize>>;
  setCanvasPos: Dispatch<SetStateAction<Vector2d>>;
  setStageScale: Dispatch<SetStateAction<number>>;
  setSelectedNodes: (node: Konva.Node[]) => void;
  getAllSelectedNodes: () => Konva.Node[];
  getSingleSelectedNode: () => Konva.Node | undefined;
  selectNodeById: (id: string) => void;
  selectNodesByIdList: (idList: string[]) => void;
  loadCanvasByJSON: (data: CanvasData) => void;
  exportCanvasAsJSON: () => CanvasData | undefined;
  getPointerPosition: () => Vector2d;
}

const defaultValue: CanvasContextValueProps = {
  canvasSize: { width: 400, height: 600 },
  canvasPos: { x: 0, y: 0 },
  stageScale: 1,
  viewportSize: { width: 0, height: 0 },
  selectedNodes: [],
  stageRef: { current: null },
  transformerRef: { current: null },
  setCanvasSize: () => {},
  setCanvasPos: () => {},
  setStageScale: () => {},
  setSelectedNodes: () => {},
  getAllSelectedNodes: () => [],
  getSingleSelectedNode: () => undefined,
  selectNodeById: () => {},
  selectNodesByIdList: () => {},
  loadCanvasByJSON: () => {},
  exportCanvasAsJSON: () => undefined,
  getPointerPosition: () => ({ x: 0, y: 0 }),
};

const CanvasContext = createContext<CanvasContextValueProps>(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const {
    canvasPos: cPos,
    canvasSize: cSize,
    viewportSize: vSize,
  } = defaultValue;

  const stageRef = useRef<Konva.Stage>(null);
  const canvasPosRef = useRef<Vector2d>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [canvasPos, setCanvasPos] = useState<Vector2d>(cPos);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(cSize);
  const [stageScale, setStageScale] = useState<number>(defaultValue.stageScale);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(vSize);
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);

  const { getAttributes, setAttributes } = useControl();
  const setShapes = useShapeStore((state) => state.setShapes);

  // useEffect(() => {
  //   const { width, height } = getAttributes.canvasOption.canvasSize;
  //   if (width === canvasSize.width && height === canvasSize.height) return;

  //   setAttributes.setCanvasOption((prev) => ({ ...prev, canvasSize }));
  // }, [setAttributes, canvasSize, getAttributes]);

  const getPointerPosition = useCallback((): Vector2d => {
    if (!stageRef.current) return { x: 0, y: 0 };
    const stagePos = stageRef.current.getPosition();
    const scale = stageRef.current.getAbsoluteScale();
    const pointerPos = stageRef.current.getPointerPosition() as Vector2d;

    return {
      x: (pointerPos.x - stagePos.x) / scale.x,
      y: (pointerPos.y - stagePos.y) / scale.y,
    };
  }, []);

  // 위치를 절대 위치 또는 상대 위치로 바꾸는 함수
  const convertPosition = useCallback(
    (props: ShapeConfig, parentX = 0, parentY = 0, isAbsolute = true) => {
      const { x, y, points } = props;
      return {
        ...(x && { x: x + (isAbsolute ? parentX : -parentX) }),
        ...(y && { y: y + (isAbsolute ? parentY : -parentY) }),
        ...(points && {
          points: points?.map((point: number, index: number) =>
            index % 2
              ? point + (isAbsolute ? parentY : -parentY)
              : point + (isAbsolute ? parentX : -parentX)
          ),
        }),
      };
    },
    []
  );

  const convertToAbsolutePosition = useCallback(
    (props: ShapeConfig, parentX?: number, parentY?: number) => {
      const canvasPos = canvasPosRef.current || { x: 0, y: 0 };
      return convertPosition(
        props,
        parentX ?? canvasPos.x,
        parentY ?? canvasPos.y,
        true
      );
    },
    [convertPosition]
  );

  const convertToRelativePosition = useCallback(
    (props: ShapeConfig, parentX?: number, parentY?: number) => {
      const canvasPos = canvasPosRef.current || { x: 0, y: 0 };
      return convertPosition(
        props,
        parentX ?? canvasPos.x,
        parentY ?? canvasPos.y,
        false
      );
    },
    [convertPosition]
  );

  useEffect(() => {
    if (selectedNodes.length > 0) {
      transformerRef.current?.nodes([...selectedNodes]);
      return;
    }
    transformerRef.current?.nodes([]);
  }, [selectedNodes]);

  const resize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const posX = (width - canvasSize.width) / 2;
    const posY = (height - canvasSize.height) / 2;

    setShapes(
      (shapes) =>
        shapes.map((shape) => ({
          ...shape,
          ...convertToAbsolutePosition(
            convertToRelativePosition(shape),
            posX,
            posY
          ),
        })),
      false
    );
    setViewportSize({ width, height });
    setCanvasPos({
      x: posX,
      y: posY,
    });
    canvasPosRef.current = { x: posX, y: posY };
  }, [
    canvasSize,
    convertToAbsolutePosition,
    convertToRelativePosition,
    setShapes,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const selectNodeById = (id: string) => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNodes = getAllSelectedNodes();
    const stage = stageRef.current;
    const node = stage.find(".shape").find(({ attrs }) => attrs.id === id);
    if (node && !selectedNodes.includes(node)) {
      setSelectedNodes([node]);
    }
  };

  const selectNodesByIdList = useCallback((idList: string[]) => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;

    const nodes = stage.find(({ attrs }: Konva.Node) =>
      idList.includes(attrs.id)
    );
    if (nodes && nodes.length > 0) setSelectedNodes(nodes);
  }, []);

  const getSingleSelectedNode = (): Konva.Node | undefined =>
    transformerRef.current?.getNode();

  const getAllSelectedNodes = (): Konva.Node[] =>
    transformerRef.current?.getNodes() ?? [];

  const loadCanvasByJSON = (data: CanvasData) => {
    if (!stageRef.current) return;
    const { width, height, bgColor, children: childrenFromData } = data.canvas;
    if (!childrenFromData) return;

    const children = childrenFromData?.map(({ attrs }) => ({
      ...attrs,
      ...convertToAbsolutePosition(attrs), // 절대 좌표로 변환
    })) as ShapeConfig[];

    setAttributes.setCanvasOption(
      () => ({
        canvasSize: { width, height },
        bgColor,
      }),
      false
    );
    setShapes(children, false);
  };

  const exportCanvasAsJSON = () => {
    if (!stageRef.current) return;
    const stagedChildren = stageRef.current.getChildren();
    const extractIds = ["_shapeLayer", "_drawLayer"];
    const children = stagedChildren
      .filter(({ attrs }) => extractIds.includes(attrs.id))
      .map(({ children }) =>
        children.map((child) => ({
          ...child,
          attrs: {
            ...child.attrs,
            ...convertToRelativePosition(child.attrs), // 상대 좌표로 변환
          },
        }))
      )
      .flat() as (Group | Shape<ShapeConfig>)[];

    return {
      canvas: {
        ...canvasSize,
        bgColor: getAttributes.canvasOption.bgColor,
        children: children,
      },
    };
  };

  return (
    <CanvasContext.Provider
      value={{
        canvasSize,
        canvasPos,
        stageScale,
        viewportSize,
        selectedNodes,
        stageRef: stageRef as RefObject<Konva.Stage>,
        transformerRef: transformerRef as RefObject<Konva.Transformer>,
        setCanvasSize,
        setCanvasPos,
        setStageScale,
        setSelectedNodes,
        getAllSelectedNodes,
        getSingleSelectedNode,
        selectNodeById,
        selectNodesByIdList,
        loadCanvasByJSON,
        exportCanvasAsJSON,
        getPointerPosition,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
