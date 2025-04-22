const DeleteIcon = ({
  width,
  height,
  className,
}: {
  width: string;
  height: string;
  className?: string;
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
    <path d="M4.5 5V22H19.5V5H4.5Z" strokeWidth="2" strokeLinejoin="round" />
    <path
      d="M10 10V16.5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 10V16.5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 5H22"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 5L9.6445 2H14.3885L16 5H8Z"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export default DeleteIcon;
