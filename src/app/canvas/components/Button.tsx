const Button = ({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    className={`text-black
      ${
        active
          ? "p-1 bg-blue-300 rounded"
          : "p-1 hover:bg-blue-500 bg-blue-100 rounded"
      }`}
    onClick={onClick}
  >
    {label}
  </button>
);

export default Button;
