const MoveForwardIcon = ({
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
      d="M20.5 9H9.5C9.22385 9 9 9.22385 9 9.5V20.5C9 20.7761 9.22385 21 9.5 21H20.5C20.7761 21 21 20.7761 21 20.5V9.5C21 9.22385 20.7761 9 20.5 9Z"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M4.98453 3H3V5.0168"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.99853 15H3V13.006"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.0011 3H14.9999V5.0076"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.01416 3H10.0042"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 8C3 9.3268 3 9.99345 3 10"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 8C15 9.33825 15 9.6728 15 9.0037"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M7.99634 15H9.00004" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default MoveForwardIcon;
