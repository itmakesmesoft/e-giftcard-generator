import { ChangeEvent } from "react";

export interface InputProps {
  type?: "text" | "number" | "file";
  id?: string;
  className?: string;
  value?: string | number;
  label?: string;
  onValueChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
}

const Input = ({
  type = "number",
  id,
  className,
  value,
  label,
  onValueChange,
  ...restProps
}: InputProps) => {
  return (
    <label className={`flex flex-row items-center ${className}`}>
      <span>{label}</span>
      <input
        type={type}
        id={id}
        value={value}
        className="min-w-[30px] ml-2 outline-none"
        onChange={onValueChange}
        {...restProps}
      />
    </label>
  );
};

export default Input;
