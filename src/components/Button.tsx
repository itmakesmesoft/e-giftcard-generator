import { ReactNode } from "react";

const Button = ({
  // active,
  children,
  onClick,
  className,
}: {
  // active?: boolean;
  children?: ReactNode;
  onClick: () => void;
  className?: string;
}) => (
  <button className={`${className}`} onClick={onClick}>
    {children}
  </button>
);

export default Button;
