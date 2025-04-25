import React from "react";

interface TriangleIconProps {
  width?: string | number;
  height?: string | number;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
}

const TriangleIcon: React.FC<TriangleIconProps> = ({
  width = "64px",
  height = "64px",
  fill = "#000000",
  stroke = "#000",
  strokeWidth = "2",
}) => {
  return (
    <svg
      fill={fill}
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 72.72 80"
    >
      <g id="SVGRepo_iconCarrier">
        <g>
          <g>
            <path
              d="M72.72,65.686H0L36.36,7.034L72.72,65.686z M5.388,62.686h61.943L36.36,12.727L5.388,62.686z"
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default TriangleIcon;
