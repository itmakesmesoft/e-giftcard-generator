import { ChangeEvent, useEffect, useState } from "react";

export interface InputProps<T extends string | number = string | number> {
  type?: "text" | "number" | "file";
  id?: string;
  className?: string;
  value?: T;
  defaultValue?: T;
  label?: string;
  onValueChange?: (value: T) => void;
  onValueChangeComplete?: (value: T) => void;
  unit?: string;
  min?: number;
  max?: number;
  [key: string]: unknown;
}

const Input = ({
  id,
  type = "number",
  unit,
  label,
  value,
  defaultValue = "",
  className = "",
  onValueChange,
  onValueChangeComplete,
  ...restProps
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const isControlled = value !== undefined;
  const shouldDelayChange = !!onValueChangeComplete;

  const [internalValue, setInternalValue] = useState(
    isControlled ? value : defaultValue ?? ""
  );

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value);
    }
  }, [value, isControlled]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    } else if (shouldDelayChange && isFocused) {
      setInternalValue(newValue);
      return;
    }
    onValueChange?.(newValue);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (shouldDelayChange) {
      onValueChangeComplete?.(internalValue);
    }
  };

  return (
    <label className={`min-w-0 flex flex-row items-center ${className}`}>
      {label && <span className="mr-2">{label}</span>}
      <input
        className="w-full outline-none appearance-none"
        id={id}
        type={type}
        value={internalValue}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        {...restProps}
      />
      {unit && <span>{unit}</span>}
    </label>
  );
};

export default Input;
