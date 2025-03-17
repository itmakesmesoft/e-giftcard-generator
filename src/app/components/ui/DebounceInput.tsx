import Input from "./Input";
import { useState, useEffect } from "react";
import useDebounce from "@/app/hooks/useDebounce";

const DebounceInput = ({
  value,
  onValueChange,
  delay = 500,
  ...restProps
}: {
  value: string | number;
  onValueChange: (value: string | number) => void;
  delay?: number;
  [key: string]: unknown;
}) => {
  const [inputValue, setInputValue] = useState<string | number>(value);
  const debounced = useDebounce(inputValue, delay);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (debounced != value) onValueChange(debounced);
  }, [debounced, onValueChange, value]);

  return (
    <Input
      value={inputValue}
      onValueChange={handleValueChange}
      className="h-5 bg-white"
      label="W"
      {...restProps}
    />
  );
};

export default DebounceInput;
