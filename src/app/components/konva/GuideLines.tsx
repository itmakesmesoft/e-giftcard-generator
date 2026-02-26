import { Layer, Line } from "react-konva";
import { GuideLine, GUIDE_COLOR, GUIDE_STROKE_WIDTH, GUIDE_DASH } from "@/utils/snap";

interface Props {
  guides: GuideLine[];
}

const GuideLines = ({ guides }: Props) => {
  if (guides.length === 0) return null;

  return (
    <Layer listening={false}>
      {guides.map((g, i) =>
        g.orientation === "V" ? (
          <Line
            key={i}
            points={[g.position, g.start, g.position, g.end]}
            stroke={GUIDE_COLOR}
            strokeWidth={GUIDE_STROKE_WIDTH}
            dash={GUIDE_DASH}
            listening={false}
          />
        ) : (
          <Line
            key={i}
            points={[g.start, g.position, g.end, g.position]}
            stroke={GUIDE_COLOR}
            strokeWidth={GUIDE_STROKE_WIDTH}
            dash={GUIDE_DASH}
            listening={false}
          />
        ),
      )}
    </Layer>
  );
};

export default GuideLines;
