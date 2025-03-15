const MoveBackwardIcon = ({
  width,
  height,
  className,
}: {
  width: string;
  height: string;
  className: string;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    className={className}
  >
    <path
      d="M15 9H20.5C20.7761 9 21 9.22385 21 9.5V20.5C21 20.7761 20.7761 21 20.5 21H9.5C9.22385 21 9 20.7761 9 20.5V15"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.98453 3H3V5.0168"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.99853 14.9999H3V13.0059"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 14.9999H14.9986V13.0059"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.0011 3H14.9999V4.99893"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8.01416 3H10.0042" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M3 8V10.0074"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 8V10.0074"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.99634 15H10"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default MoveBackwardIcon;
